/**
 * AI-Powered Recovery Assistant Service
 * 
 * Responsibility: Provides intelligent, personalized recovery assistance
 * 
 * FEATURES:
 * - Natural language understanding for recovery requests
 * - Personalized recovery flow recommendations
 * - Context-aware assistance
 * - Multi-language support
 * - Adaptive guidance based on user behavior
 * 
 * FUTURE: Integrate with LLM APIs (OpenAI, Anthropic, etc.)
 */

const logger = require('../utils/logger');
const { ValidationError } = require('../middleware/errorHandler');

/**
 * User recovery preferences and history
 * Structure: { userId: { preferredMethod, language, lastRecovery, recoveryCount, ... } }
 */
const userRecoveryProfiles = {};

/**
 * Analyzes recovery request and provides personalized recommendations
 * 
 * @param {Object} params - Recovery context
 * @param {string} params.userId - User identifier
 * @param {string} params.requestMethod - 'email' or 'phone'
 * @param {string} params.language - User's preferred language
 * @param {Object} params.historicalData - Previous recovery attempts
 * @returns {Promise<Object>} Personalized recovery recommendations
 */
const analyzeRecoveryRequest = async ({ userId, requestMethod, language = 'en', historicalData = {} }) => {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  // Get or create user recovery profile
  const profile = getUserRecoveryProfile(userId);
  
  // Analyze recovery patterns
  const patterns = analyzeRecoveryPatterns(profile, historicalData);
  
  // Generate personalized recommendations
  const recommendations = generateRecommendations({
    userId,
    requestMethod,
    language,
    profile,
    patterns
  });

  // Determine optimal recovery flow
  const optimalFlow = determineOptimalFlow(profile, requestMethod, patterns);

  logger.info('AI recovery assistant analysis completed', {
    userId,
    requestMethod,
    recommendationsCount: recommendations.length
  });

  return {
    userId,
    recommendations,
    optimalFlow,
    personalizedMessage: generatePersonalizedMessage(userId, language, requestMethod),
    estimatedTime: estimateRecoveryTime(profile, requestMethod),
    confidence: calculateConfidence(profile, patterns)
  };
};

/**
 * Gets or creates user recovery profile
 * 
 * @param {string} userId - User identifier
 * @returns {Object} User recovery profile
 */
const getUserRecoveryProfile = (userId) => {
  if (!userRecoveryProfiles[userId]) {
    userRecoveryProfiles[userId] = {
      userId,
      preferredMethod: 'email',
      language: 'en',
      lastRecovery: null,
      recoveryCount: 0,
      successfulRecoveries: 0,
      averageRecoveryTime: null,
      preferredVerificationMethod: 'email',
      riskTolerance: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  return userRecoveryProfiles[userId];
};

/**
 * Analyzes recovery patterns from historical data
 * 
 * @param {Object} profile - User recovery profile
 * @param {Object} historicalData - Historical recovery attempts
 * @returns {Object} Pattern analysis
 */
const analyzeRecoveryPatterns = (profile, historicalData) => {
  const patterns = {
    frequency: 'normal', // 'low', 'normal', 'high'
    consistency: 'consistent', // 'consistent', 'variable', 'inconsistent'
    successRate: profile.recoveryCount > 0 
      ? (profile.successfulRecoveries / profile.recoveryCount) * 100 
      : 100,
    timePattern: 'normal', // 'normal', 'unusual', 'suspicious'
    methodPreference: profile.preferredMethod
  };

  // Analyze frequency
  if (profile.recoveryCount > 5) {
    patterns.frequency = 'high';
  } else if (profile.recoveryCount === 0) {
    patterns.frequency = 'low';
  }

  // Analyze consistency
  if (historicalData.lastAttempt) {
    const timeSinceLastAttempt = Date.now() - new Date(historicalData.lastAttempt).getTime();
    const daysSince = timeSinceLastAttempt / (1000 * 60 * 60 * 24);
    
    if (daysSince < 1) {
      patterns.consistency = 'inconsistent';
    } else if (daysSince < 30) {
      patterns.consistency = 'variable';
    }
  }

  return patterns;
};

/**
 * Generates personalized recovery recommendations
 * 
 * @param {Object} context - Recovery context
 * @returns {Array} Array of recommendations
 */
const generateRecommendations = ({ userId, requestMethod, language, profile, patterns }) => {
  const recommendations = [];

  // Recommendation 1: Method optimization
  if (requestMethod !== profile.preferredMethod) {
    recommendations.push({
      type: 'method_suggestion',
      priority: 'low',
      message: getLocalizedMessage(language, 'consider_preferred_method', {
        method: profile.preferredMethod
      }),
      action: 'switch_method'
    });
  }

  // Recommendation 2: Security best practices
  if (patterns.frequency === 'high') {
    recommendations.push({
      type: 'security_reminder',
      priority: 'medium',
      message: getLocalizedMessage(language, 'frequent_recovery_warning'),
      action: 'review_security'
    });
  }

  // Recommendation 3: Verification method
  if (requestMethod === 'phone' && profile.preferredVerificationMethod === 'email') {
    recommendations.push({
      type: 'verification_suggestion',
      priority: 'low',
      message: getLocalizedMessage(language, 'email_verification_faster'),
      action: 'use_email_verification'
    });
  }

  // Recommendation 4: Time-based suggestions
  const hour = new Date().getHours();
  if (hour < 6 || hour > 22) {
    recommendations.push({
      type: 'time_suggestion',
      priority: 'low',
      message: getLocalizedMessage(language, 'unusual_time_notice'),
      action: 'verify_identity'
    });
  }

  return recommendations;
};

/**
 * Determines optimal recovery flow based on user profile and patterns
 * 
 * @param {Object} profile - User recovery profile
 * @param {string} requestMethod - Request method
 * @param {Object} patterns - Pattern analysis
 * @returns {Object} Optimal flow configuration
 */
const determineOptimalFlow = (profile, requestMethod, patterns) => {
  const flow = {
    steps: [],
    verificationLevel: 'standard', // 'minimal', 'standard', 'enhanced'
    requiresQuestions: false,
    requiresVoiceVerification: false
  };

  // Standard flow steps
  flow.steps = [
    'identify_account',
    'verify_identity',
    'confirm_recovery'
  ];

  // Adjust verification level based on risk
  if (patterns.frequency === 'high' || patterns.consistency === 'inconsistent') {
    flow.verificationLevel = 'enhanced';
    flow.requiresQuestions = true;
  } else if (patterns.successRate < 50) {
    flow.verificationLevel = 'enhanced';
    flow.requiresVoiceVerification = true;
  } else if (profile.recoveryCount === 0) {
    flow.verificationLevel = 'minimal';
  }

  // Add voice verification if preferred
  if (profile.preferredVerificationMethod === 'voice' || requestMethod === 'phone') {
    flow.requiresVoiceVerification = true;
    flow.steps.push('voice_verification');
  }

  return flow;
};

/**
 * Generates personalized message for user
 * 
 * @param {string} userId - User identifier
 * @param {string} language - User's language
 * @param {string} requestMethod - Request method
 * @returns {string} Personalized message
 */
const generatePersonalizedMessage = (userId, language, requestMethod) => {
  const profile = getUserRecoveryProfile(userId);
  const name = profile.name || 'User';
  
  const messages = {
    en: {
      email: `Hi ${name}, we're here to help you recover your account. We'll send a secure recovery link to your email.`,
      phone: `Hi ${name}, we'll help you recover your account via SMS. Please check your phone for a verification code.`
    },
    es: {
      email: `Hola ${name}, estamos aquí para ayudarte a recuperar tu cuenta. Enviaremos un enlace seguro a tu correo.`,
      phone: `Hola ${name}, te ayudaremos a recuperar tu cuenta por SMS. Por favor revisa tu teléfono para un código de verificación.`
    },
    fr: {
      email: `Bonjour ${name}, nous sommes là pour vous aider à récupérer votre compte. Nous enverrons un lien sécurisé à votre e-mail.`,
      phone: `Bonjour ${name}, nous vous aiderons à récupérer votre compte par SMS. Veuillez vérifier votre téléphone pour un code de vérification.`
    },
    ht: {
      email: `Bonjou ${name}, nou la pou ede w rekipere kont ou. Nou pral voye yon lyen sekirite nan imel ou.`,
      phone: `Bonjou ${name}, nou pral ede w rekipere kont ou via SMS. Tanpri tcheke telefòn ou pou yon kòd verifikasyon.`
    }
  };

  return messages[language]?.[requestMethod] || messages.en[requestMethod];
};

/**
 * Estimates recovery time based on profile and method
 * 
 * @param {Object} profile - User recovery profile
 * @param {string} requestMethod - Request method
 * @returns {number} Estimated time in minutes
 */
const estimateRecoveryTime = (profile, requestMethod) => {
  const baseTime = requestMethod === 'email' ? 5 : 3; // minutes
  const experienceFactor = profile.recoveryCount > 0 ? 0.8 : 1.2;
  
  return Math.ceil(baseTime * experienceFactor);
};

/**
 * Calculates confidence score for recovery recommendation
 * 
 * @param {Object} profile - User recovery profile
 * @param {Object} patterns - Pattern analysis
 * @returns {number} Confidence score (0-1)
 */
const calculateConfidence = (profile, patterns) => {
  let confidence = 0.8; // Base confidence

  // Increase confidence for experienced users
  if (profile.recoveryCount > 0 && patterns.successRate > 80) {
    confidence += 0.1;
  }

  // Decrease confidence for unusual patterns
  if (patterns.frequency === 'high' || patterns.consistency === 'inconsistent') {
    confidence -= 0.2;
  }

  return Math.max(0.5, Math.min(1.0, confidence));
};

/**
 * Gets localized message
 * 
 * @param {string} language - Language code
 * @param {string} key - Message key
 * @param {Object} params - Message parameters
 * @returns {string} Localized message
 */
const getLocalizedMessage = (language, key, params = {}) => {
  const messages = {
    en: {
      consider_preferred_method: `Consider using ${params.method} for faster recovery`,
      frequent_recovery_warning: 'You\'ve requested recovery multiple times. Please review your account security.',
      email_verification_faster: 'Email verification may be faster for your account',
      unusual_time_notice: 'Recovery requested at an unusual time. Additional verification may be required.'
    },
    es: {
      consider_preferred_method: `Considere usar ${params.method} para una recuperación más rápida`,
      frequent_recovery_warning: 'Has solicitado recuperación varias veces. Por favor revisa la seguridad de tu cuenta.',
      email_verification_faster: 'La verificación por correo puede ser más rápida para tu cuenta',
      unusual_time_notice: 'Recuperación solicitada en un momento inusual. Puede requerirse verificación adicional.'
    },
    fr: {
      consider_preferred_method: `Envisagez d'utiliser ${params.method} pour une récupération plus rapide`,
      frequent_recovery_warning: 'Vous avez demandé la récupération plusieurs fois. Veuillez examiner la sécurité de votre compte.',
      email_verification_faster: 'La vérification par e-mail peut être plus rapide pour votre compte',
      unusual_time_notice: 'Récupération demandée à un moment inhabituel. Une vérification supplémentaire peut être requise.'
    },
    ht: {
      consider_preferred_method: `Konsidere itilize ${params.method} pou rekiperasyon pi rapid`,
      frequent_recovery_warning: 'Ou te mande rekiperasyon plizyè fwa. Tanpri revize sekirite kont ou.',
      email_verification_faster: 'Verifikasyon imel ka pi rapid pou kont ou',
      unusual_time_notice: 'Rekiperasyon mande nan yon moman etranj. Verifikasyon adisyonèl ka nesesè.'
    }
  };

  return messages[language]?.[key] || messages.en[key] || key;
};

/**
 * Updates user recovery profile after successful recovery
 * 
 * @param {string} userId - User identifier
 * @param {Object} recoveryData - Recovery completion data
 */
const updateRecoveryProfile = (userId, recoveryData) => {
  const profile = getUserRecoveryProfile(userId);
  
  profile.recoveryCount += 1;
  profile.successfulRecoveries += 1;
  profile.lastRecovery = new Date();
  profile.updatedAt = new Date();
  
  // Update average recovery time
  if (recoveryData.recoveryTime) {
    const currentAvg = profile.averageRecoveryTime || recoveryData.recoveryTime;
    profile.averageRecoveryTime = (currentAvg + recoveryData.recoveryTime) / 2;
  }

  // Update preferred method if used successfully
  if (recoveryData.method) {
    profile.preferredMethod = recoveryData.method;
  }

  logger.info('User recovery profile updated', {
    userId,
    recoveryCount: profile.recoveryCount
  });
};

/**
 * Gets user recovery profile
 * 
 * @param {string} userId - User identifier
 * @returns {Object} User recovery profile
 */
const getUserProfile = (userId) => {
  return getUserRecoveryProfile(userId);
};

module.exports = {
  analyzeRecoveryRequest,
  updateRecoveryProfile,
  getUserProfile,
  getLocalizedMessage
};

