/**
 * Stripe Service
 * 
 * Handles Stripe subscriptions, webhooks, and billing
 */

const Stripe = require('stripe');
const prisma = require('../prisma/client');
const logger = require('../utils/logger');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

/**
 * Create or get Stripe customer
 */
const getOrCreateCustomer = async (userId, email, name) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  // Check if customer already exists
  if (user.subscription?.stripeCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(user.subscription.stripeCustomerId);
      return customer;
    } catch (error) {
      logger.warn('Stripe customer not found, creating new one', { userId, error: error.message });
    }
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  });

  // Update or create subscription record
  if (user.subscription) {
    await prisma.subscription.update({
      where: { userId },
      data: { stripeCustomerId: customer.id },
    });
  } else {
    await prisma.subscription.create({
      data: {
        userId,
        stripeCustomerId: customer.id,
        planId: 'FREE',
        planName: 'Free',
        stripeStatus: 'active',
        status: 'active',
      },
    });
  }

  logger.info('Stripe customer created', { userId, customerId: customer.id });
  return customer;
};

/**
 * Create checkout session for subscription
 */
const createCheckoutSession = async (userId, planId, successUrl, cancelUrl) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });

  if (!plan || !plan.active) {
    throw new NotFoundError('Plan');
  }

  if (!plan.stripePriceId) {
    throw new ValidationError('Plan does not have a Stripe price ID configured');
  }

  const customer = await getOrCreateCustomer(userId, user.email, user.name);

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planId,
    },
    subscription_data: {
      metadata: {
        userId,
        planId,
      },
    },
  });

  logger.info('Checkout session created', { userId, planId, sessionId: session.id });
  return session;
};

/**
 * Create billing portal session
 */
const createBillingPortalSession = async (userId, returnUrl) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user || !user.subscription?.stripeCustomerId) {
    throw new NotFoundError('Subscription');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.subscription.stripeCustomerId,
    return_url: returnUrl,
  });

  return session;
};

/**
 * Handle Stripe webhook events
 */
const handleWebhook = async (event) => {
  logger.info('Stripe webhook received', { type: event.type, id: event.id });

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      await handleCheckoutCompleted(session);
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      await handleSubscriptionUpdate(subscription);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      await handleSubscriptionDeleted(subscription);
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      await handlePaymentSucceeded(invoice);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      await handlePaymentFailed(invoice);
      break;
    }

    default:
      logger.info('Unhandled Stripe webhook event', { type: event.type });
  }
};

/**
 * Handle checkout completion
 */
const handleCheckoutCompleted = async (session) => {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  if (!userId || !planId) {
    logger.error('Checkout session missing metadata', { sessionId: session.id });
    return;
  }

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    logger.error('Plan not found', { planId });
    return;
  }

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      stripeSubscriptionId: session.subscription,
      stripePriceId: session.line_items?.data[0]?.price?.id,
      planId: planId,
      planName: plan.name,
      stripeStatus: 'active',
      status: 'active',
      currentPeriodStart: new Date(session.subscription_details?.period_start * 1000),
      currentPeriodEnd: new Date(session.subscription_details?.period_end * 1000),
      // Update feature flags from plan
      monthlyRecoveryLimit: plan.monthlyRecoveryLimit,
      accountVaultLimit: plan.accountVaultLimit,
      recoveryHistoryDays: plan.recoveryHistoryDays,
      aiVoiceEnabled: plan.aiVoiceEnabled,
      auditLogsEnabled: plan.auditLogsEnabled,
      exportReportsEnabled: plan.exportReportsEnabled,
      prioritySupport: plan.prioritySupport,
    },
    create: {
      userId,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      stripePriceId: session.line_items?.data[0]?.price?.id,
      planId: planId,
      planName: plan.name,
      stripeStatus: 'active',
      status: 'active',
      currentPeriodStart: new Date(session.subscription_details?.period_start * 1000),
      currentPeriodEnd: new Date(session.subscription_details?.period_end * 1000),
      monthlyRecoveryLimit: plan.monthlyRecoveryLimit,
      accountVaultLimit: plan.accountVaultLimit,
      recoveryHistoryDays: plan.recoveryHistoryDays,
      aiVoiceEnabled: plan.aiVoiceEnabled,
      auditLogsEnabled: plan.auditLogsEnabled,
      exportReportsEnabled: plan.exportReportsEnabled,
      prioritySupport: plan.prioritySupport,
    },
  });

  logger.info('Subscription activated', { userId, planId });
};

/**
 * Handle subscription update
 */
const handleSubscriptionUpdate = async (stripeSubscription) => {
  const userId = stripeSubscription.metadata?.userId;
  if (!userId) {
    logger.error('Subscription missing userId metadata', { subscriptionId: stripeSubscription.id });
    return;
  }

  const planId = stripeSubscription.metadata?.planId;
  const plan = planId ? await prisma.plan.findUnique({ where: { id: planId } }) : null;

  await prisma.subscription.update({
    where: { userId },
    data: {
      stripeStatus: stripeSubscription.status,
      status: mapStripeStatus(stripeSubscription.status),
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      ...(plan && {
        planId: plan.id,
        planName: plan.name,
        monthlyRecoveryLimit: plan.monthlyRecoveryLimit,
        accountVaultLimit: plan.accountVaultLimit,
        recoveryHistoryDays: plan.recoveryHistoryDays,
        aiVoiceEnabled: plan.aiVoiceEnabled,
        auditLogsEnabled: plan.auditLogsEnabled,
        exportReportsEnabled: plan.exportReportsEnabled,
        prioritySupport: plan.prioritySupport,
      }),
    },
  });
};

/**
 * Handle subscription deletion
 */
const handleSubscriptionDeleted = async (stripeSubscription) => {
  const userId = stripeSubscription.metadata?.userId;
  if (!userId) {
    logger.error('Subscription missing userId metadata', { subscriptionId: stripeSubscription.id });
    return;
  }

  await prisma.subscription.update({
    where: { userId },
    data: {
      stripeStatus: 'canceled',
      status: 'canceled',
      canceledAt: new Date(),
      stripeSubscriptionId: null,
      stripePriceId: null,
      // Reset to FREE plan features
      planId: 'FREE',
      planName: 'Free',
      monthlyRecoveryLimit: null,
      totalRecoveryLimit: 2,
      accountVaultLimit: null,
      recoveryHistoryDays: null,
      aiVoiceEnabled: false,
      auditLogsEnabled: false,
      exportReportsEnabled: false,
      prioritySupport: false,
    },
  });

  logger.info('Subscription canceled', { userId });
};

/**
 * Handle successful payment
 */
const handlePaymentSucceeded = async (invoice) => {
  const customerId = invoice.customer;
  const subscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'active',
        stripeStatus: 'active',
      },
    });
  }
};

/**
 * Handle failed payment
 */
const handlePaymentFailed = async (invoice) => {
  const customerId = invoice.customer;
  const subscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'past_due',
        stripeStatus: 'past_due',
      },
    });
  }
};

/**
 * Map Stripe status to internal status
 */
const mapStripeStatus = (stripeStatus) => {
  const statusMap = {
    active: 'active',
    canceled: 'canceled',
    past_due: 'past_due',
    trialing: 'active',
    incomplete: 'past_due',
    incomplete_expired: 'canceled',
    unpaid: 'past_due',
  };
  return statusMap[stripeStatus] || 'canceled';
};

/**
 * Get user subscription
 */
const getUserSubscription = async (userId) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  return subscription;
};

module.exports = {
  stripe,
  getOrCreateCustomer,
  createCheckoutSession,
  createBillingPortalSession,
  handleWebhook,
  getUserSubscription,
};

