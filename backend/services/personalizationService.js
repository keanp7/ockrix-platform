/**
 * Personalization Service
 * 
 * Responsibility: Provides personalized recovery experiences based on user preferences and behavior
 * 
 * FEATURES:
 * - User preference management
 * - Recovery flow customization
 * - Language and locale preferences
 * - Accessibility preferences
 * - Recovery method preferences
 * - UI/UX customization
 */

const logger = require('../utils/logger');
const { ValidationError } = require('../middleware/errorHandler');

/**
 * User personalization profiles
 * Structure: { userId: { preferences, behavior, settings, ... } }
 */
const userProfiles = {};

/**
 * Gets or creates user personalization profile
 * 
 * @param {string} userId - User identifier
 * @returns {Object} User profile
 */
const getUserProfile = (userId) => {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  if (!userProfiles[userId]) {
    userProfiles[userId] = createDefaultProfile(userId);
  }

  return userProfiles[userId];
};

/**
 * Creates default personalization profile
 * 
 * @param {string} userId - User identifier
 * @returns {Object} Default profile
 */
const createDefaultProfile = (userId) => {
  return {
    userId,
    preferences: {
      language: 'en',
      locale: 'en-US',
      timezone: 'UTC',
      recoveryMethod: 'email', // 'email', 'phone', 'sms', 'voice'
      verificationMethod: 'email', // 'email', 'sms', 'voice', 'totp'
      preferredContactTime: 'anytime', // 'morning', 'afternoon', 'evening', 'anytime'
      theme: 'dark', // 'light', 'dark', 'auto'
      fontSize: 'medium', // 'small', 'medium', 'large'
      accessibility: {
        screenReader: false,
        highContrast: false,
        reducedMotion: false
      }
    },
    behavior: {
      recoveryCount: 0,
      lastRecovery: null,
      averageRecoveryTime: null,
      preferredFlow: 'standard', // 'standard', 'quick', 'detailed'
      trustLevel: 'medium' // 'low', 'medium', 'high'
    },
    settings: {
      notifications: {
        email: true,
        sms: false,
        push: false
      },
      security: {
        twoFactorEnabled: false,
        biometricEnabled: false,
        requireVerification: true
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Updates user preferences
 * 
 * @param {string} userId - User identifier
 * @param {Object} preferences - Preference updates
 * @returns {Object} Updated profile
 */
const updatePreferences = (userId, preferences) => {
  const profile = getUserProfile(userId);
  
  profile.preferences = {
    ...profile.preferences,
    ...preferences
  };
  profile.updatedAt = new Date();

  logger.info('User preferences updated', {
    userId,
    preferences: Object.keys(preferences)
  });

  return profile;
};

/**
 * Gets personalized recovery configuration
 * 
 * @param {string} userId - User identifier
 * @returns {Object} Personalized recovery config
 */
const getPersonalizedRecoveryConfig = (userId) => {
  const profile = getUserProfile(userId);
  
  return {
    language: profile.preferences.language,
    locale: profile.preferences.locale,
    recoveryMethod: profile.preferences.recoveryMethod,
    verificationMethod: profile.preferences.verificationMethod,
    flowType: profile.behavior.preferredFlow,
    theme: profile.preferences.theme,
    accessibility: profile.preferences.accessibility,
    trustLevel: profile.behavior.trustLevel,
    estimatedTime: estimateRecoveryTime(profile),
    customizations: getCustomizations(profile)
  };
};

/**
 * Estimates recovery time based on user profile
 * 
 * @param {Object} profile - User profile
 * @returns {number} Estimated time in minutes
 */
const estimateRecoveryTime = (profile) => {
  const baseTime = 5; // minutes
  const methodFactor = {
    email: 1.0,
    phone: 0.8,
    sms: 0.7,
    voice: 1.2
  };
  const flowFactor = {
    quick: 0.7,
    standard: 1.0,
    detailed: 1.5
  };

  const method = methodFactor[profile.preferences.recoveryMethod] || 1.0;
  const flow = flowFactor[profile.behavior.preferredFlow] || 1.0;
  const experienceFactor = profile.behavior.recoveryCount > 0 ? 0.9 : 1.1;

  return Math.ceil(baseTime * method * flow * experienceFactor);
};

/**
 * Gets UI/UX customizations for user
 * 
 * @param {Object} profile - User profile
 * @returns {Object} Customizations
 */
const getCustomizations = (profile) => {
  return {
    theme: profile.preferences.theme,
    fontSize: profile.preferences.fontSize,
    accessibility: profile.preferences.accessibility,
    language: profile.preferences.language,
    locale: profile.preferences.locale,
    timezone: profile.preferences.timezone,
    preferredContactTime: profile.preferences.preferredContactTime
  };
};

/**
 * Records recovery behavior for personalization
 * 
 * @param {string} userId - User identifier
 * @param {Object} behaviorData - Behavior data
 */
const recordRecoveryBehavior = (userId, behaviorData) => {
  const profile = getUserProfile(userId);
  
  profile.behavior.recoveryCount += 1;
  profile.behavior.lastRecovery = new Date();
  
  if (behaviorData.recoveryTime) {
    const currentAvg = profile.behavior.averageRecoveryTime || behaviorData.recoveryTime;
    profile.behavior.averageRecoveryTime = (currentAvg + behaviorData.recoveryTime) / 2;
  }

  if (behaviorData.flowType) {
    profile.behavior.preferredFlow = behaviorData.flowType;
  }

  if (behaviorData.success) {
    // Increase trust level on successful recovery
    if (profile.behavior.trustLevel === 'low') {
      profile.behavior.trustLevel = 'medium';
    } else if (profile.behavior.trustLevel === 'medium' && profile.behavior.recoveryCount > 3) {
      profile.behavior.trustLevel = 'high';
    }
  }

  profile.updatedAt = new Date();

  logger.info('Recovery behavior recorded', {
    userId,
    recoveryCount: profile.behavior.recoveryCount
  });
};

/**
 * Gets user's preferred language
 * 
 * @param {string} userId - User identifier
 * @returns {string} Language code
 */
const getPreferredLanguage = (userId) => {
  const profile = getUserProfile(userId);
  return profile.preferences.language;
};

/**
 * Gets user's accessibility preferences
 * 
 * @param {string} userId - User identifier
 * @returns {Object} Accessibility preferences
 */
const getAccessibilityPreferences = (userId) => {
  const profile = getUserProfile(userId);
  return profile.preferences.accessibility;
};

/**
 * Checks if user prefers voice verification
 * 
 * @param {string} userId - User identifier
 * @returns {boolean} True if voice verification preferred
 */
const prefersVoiceVerification = (userId) => {
  const profile = getUserProfile(userId);
  return profile.preferences.verificationMethod === 'voice';
};

/**
 * Gets all user profiles (for admin/debugging)
 * 
 * @returns {Object} All user profiles
 */
const getAllProfiles = () => {
  return userProfiles;
};

module.exports = {
  getUserProfile,
  updatePreferences,
  getPersonalizedRecoveryConfig,
  recordRecoveryBehavior,
  getPreferredLanguage,
  getAccessibilityPreferences,
  prefersVoiceVerification,
  getAllProfiles
};

