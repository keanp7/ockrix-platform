/**
 * Prisma Seed - Initialize Plans
 * 
 * Run with: npx prisma db seed
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Plans
  const plans = [
    {
      id: 'FREE',
      name: 'Free',
      description: 'Try & trust only - Limited recovery',
      price: 0,
      currency: 'USD',
      interval: 'month',
      monthlyRecoveryLimit: null,
      totalRecoveryLimit: 2, // Lifetime limit
      accountVaultLimit: null,
      recoveryHistoryDays: null,
      aiVoiceEnabled: false,
      auditLogsEnabled: false,
      exportReportsEnabled: false,
      prioritySupport: false,
      languages: ['en'],
      brandingRemoved: false,
      active: true,
    },
    {
      id: 'BASIC',
      name: 'Basic',
      description: 'Most Popular - Essential recovery features',
      price: 19.99,
      currency: 'USD',
      interval: 'month',
      monthlyRecoveryLimit: 20,
      totalRecoveryLimit: null,
      accountVaultLimit: 15,
      recoveryHistoryDays: 30,
      aiVoiceEnabled: false,
      auditLogsEnabled: false,
      exportReportsEnabled: false,
      prioritySupport: false,
      languages: ['en', 'es', 'fr', 'pt', 'de', 'it', 'nl', 'ar', 'ht', 'zh'],
      brandingRemoved: false,
      active: true,
    },
    {
      id: 'PRO',
      name: 'Pro',
      description: 'Unlimited recoveries with advanced features',
      price: 39.99,
      currency: 'USD',
      interval: 'month',
      monthlyRecoveryLimit: null, // Unlimited
      totalRecoveryLimit: null,
      accountVaultLimit: null, // Unlimited
      recoveryHistoryDays: null, // Unlimited
      aiVoiceEnabled: true,
      auditLogsEnabled: true,
      exportReportsEnabled: true,
      prioritySupport: true,
      languages: ['en', 'es', 'fr', 'pt', 'de', 'it', 'nl', 'ar', 'ht', 'zh'],
      brandingRemoved: true,
      active: true,
    },
    {
      id: 'BUSINESS',
      name: 'Business',
      description: 'Enterprise features with team management',
      price: 0, // Custom pricing
      currency: 'USD',
      interval: 'month',
      monthlyRecoveryLimit: null,
      totalRecoveryLimit: null,
      accountVaultLimit: null,
      recoveryHistoryDays: null,
      aiVoiceEnabled: true,
      auditLogsEnabled: true,
      exportReportsEnabled: true,
      prioritySupport: true,
      languages: ['en', 'es', 'fr', 'pt', 'de', 'it', 'nl', 'ar', 'ht', 'zh'],
      brandingRemoved: true,
      active: true,
    },
  ];

  for (const plan of plans) {
    const existing = await prisma.plan.findUnique({
      where: { id: plan.id },
    });

    if (!existing) {
      await prisma.plan.create({
        data: plan,
      });
      console.log(`✅ Created plan: ${plan.name}`);
    } else {
      await prisma.plan.update({
        where: { id: plan.id },
        data: plan,
      });
      console.log(`🔄 Updated plan: ${plan.name}`);
    }
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

