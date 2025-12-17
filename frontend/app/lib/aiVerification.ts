/**
 * AI Verification Service
 * 
 * Mock AI-powered risk assessment and adaptive questioning system
 * 
 * In production, this would call actual AI/ML APIs for:
 * - IP reputation analysis
 * - Device fingerprinting
 * - Behavioral pattern analysis
 * - Fraud detection models
 * - Adaptive question generation
 */

export interface RiskFactors {
  ipReputation: number; // 0-100 (0 = suspicious, 100 = trusted)
  deviceFingerprint: number; // 0-100
  velocityCheck: number; // 0-100 (frequency of requests)
  locationAnomaly: number; // 0-100 (0 = anomaly, 100 = normal)
  requestPattern: number; // 0-100
  timePattern: number; // 0-100
}

export interface AdaptiveQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'text' | 'verification';
  options?: string[];
  hint?: string;
  required: boolean;
}

export interface RiskAssessment {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  score: number; // 0-100 (0 = low risk, 100 = high risk)
  confidence: number; // 0-1
  factors: RiskFactors;
  blocked: boolean;
  needsQuestions: boolean;
  questions?: AdaptiveQuestion[];
  recommendations?: string[];
}

export interface VerificationResponse {
  assessment: RiskAssessment;
  answers?: Record<string, string>;
  nextStep: 'proceed' | 'questions' | 'blocked';
}

/**
 * Calculate base risk score from factors
 */
function calculateRiskScore(factors: RiskFactors): number {
  // Weighted risk calculation
  // Lower factor scores = higher risk
  const weights = {
    ipReputation: 0.25,
    deviceFingerprint: 0.20,
    velocityCheck: 0.20,
    locationAnomaly: 0.15,
    requestPattern: 0.10,
    timePattern: 0.10,
  };

  // Convert factor scores to risk scores (inverse)
  // Factor score of 100 = risk score of 0, Factor score of 0 = risk score of 100
  const riskScore = 
    (100 - factors.ipReputation) * weights.ipReputation +
    (100 - factors.deviceFingerprint) * weights.deviceFingerprint +
    (100 - factors.velocityCheck) * weights.velocityCheck +
    (100 - factors.locationAnomaly) * weights.locationAnomaly +
    (100 - factors.requestPattern) * weights.requestPattern +
    (100 - factors.timePattern) * weights.timePattern;

  return Math.round(riskScore);
}

/**
 * Determine risk level from score
 */
function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (score < 30) return 'LOW';
  if (score < 70) return 'MEDIUM';
  return 'HIGH';
}

/**
 * Generate adaptive questions based on risk factors
 */
function generateAdaptiveQuestions(
  factors: RiskFactors,
  identifier: string
): AdaptiveQuestion[] {
  const questions: AdaptiveQuestion[] = [];

  // If IP reputation is low, ask about location
  if (factors.ipReputation < 50) {
    questions.push({
      id: 'location',
      question: 'What city did you create your account in?',
      type: 'text',
      required: true,
      hint: 'This helps verify your identity',
    });
  }

  // If device fingerprint is low, ask about device
  if (factors.deviceFingerprint < 50) {
    questions.push({
      id: 'device',
      question: 'What type of device are you using to recover your account?',
      type: 'multiple-choice',
      options: ['Desktop/Laptop', 'Mobile Phone', 'Tablet', 'Other'],
      required: true,
    });
  }

  // If velocity check is low (too many requests), ask about recent activity
  if (factors.velocityCheck < 50) {
    questions.push({
      id: 'recent_activity',
      question: 'Did you attempt to recover your account recently?',
      type: 'multiple-choice',
      options: ['Yes, just now', 'Yes, earlier today', 'No, this is my first attempt', "I don't remember"],
      required: true,
    });
  }

  // If location anomaly detected, ask security question
  if (factors.locationAnomaly < 50) {
    questions.push({
      id: 'security_question',
      question: 'What was the approximate date when you last successfully logged into your account?',
      type: 'text',
      required: false,
      hint: 'Approximate date is fine (e.g., "Last week", "2 weeks ago")',
    });
  }

  // If request pattern is suspicious, ask about account creation
  if (factors.requestPattern < 50 && identifier.includes('@')) {
    questions.push({
      id: 'account_creation',
      question: 'What month and year did you create this account?',
      type: 'text',
      required: false,
      hint: 'Approximate is fine (e.g., "January 2024")',
    });
  }

  // Always ask at least one question for MEDIUM risk
  if (questions.length === 0) {
    questions.push({
      id: 'verification',
      question: 'To help verify your identity, please confirm: This recovery request is for your own account.',
      type: 'verification',
      required: true,
    });
  }

  return questions;
}

/**
 * Evaluate answers and adjust risk score
 */
function evaluateAnswers(
  questions: AdaptiveQuestion[],
  answers: Record<string, string>,
  baseRiskScore: number
): { adjustedScore: number; confidence: number } {
  // In production, this would use ML models to evaluate answer patterns
  // Mock implementation uses simple heuristics

  let adjustment = 0;
  let correctAnswers = 0;
  let totalAnswers = 0;

  // Check if verification question was answered affirmatively
  if (questions.some(q => q.id === 'verification') && answers['verification']) {
    if (answers['verification'].toLowerCase().includes('yes') || answers['verification'] === 'true') {
      adjustment -= 10; // Lower risk
      correctAnswers++;
    } else {
      adjustment += 20; // Higher risk
    }
    totalAnswers++;
  }

  // Check if location question makes sense (basic validation)
  if (answers['location'] && answers['location'].length > 2) {
    adjustment -= 5;
    correctAnswers++;
    totalAnswers++;
  }

  // Check if device question is answered
  if (answers['device']) {
    adjustment -= 5;
    correctAnswers++;
    totalAnswers++;
  }

  // Calculate confidence based on answer quality
  const confidence = totalAnswers > 0 ? correctAnswers / totalAnswers : 0.5;

  const adjustedScore = Math.max(0, Math.min(100, baseRiskScore + adjustment));

  return { adjustedScore, confidence: Math.max(0.5, confidence) };
}

/**
 * Analyze risk factors (MOCK - In production, call AI/ML APIs)
 */
export async function analyzeRiskFactors(
  identifier: string,
  ipAddress?: string,
  userAgent?: string
): Promise<RiskFactors> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock risk factor analysis
  // In production, this would call:
  // - IP reputation APIs (e.g., MaxMind, AbuseIPDB)
  // - Device fingerprinting services
  // - Behavioral analytics APIs
  // - Fraud detection ML models

  const mockFactors: RiskFactors = {
    // Simulate different scenarios
    ipReputation: Math.random() > 0.3 ? 75 + Math.random() * 20 : 30 + Math.random() * 20, // Usually good, sometimes low
    deviceFingerprint: Math.random() > 0.2 ? 70 + Math.random() * 25 : 40 + Math.random() * 20,
    velocityCheck: Math.random() > 0.25 ? 80 + Math.random() * 15 : 35 + Math.random() * 30, // Check request frequency
    locationAnomaly: Math.random() > 0.3 ? 75 + Math.random() * 20 : 25 + Math.random() * 30,
    requestPattern: Math.random() > 0.2 ? 70 + Math.random() * 25 : 30 + Math.random() * 35,
    timePattern: Math.random() > 0.15 ? 65 + Math.random() * 30 : 40 + Math.random() * 25,
  };

  return mockFactors;
}

/**
 * Perform AI risk assessment
 */
export async function assessRisk(
  identifier: string,
  factors: RiskFactors,
  answers?: Record<string, string>
): Promise<RiskAssessment> {
  // Calculate base risk score
  let riskScore = calculateRiskScore(factors);
  
  // Adjust score based on answers if provided
  let confidence = 0.85;
  if (answers) {
    // In real implementation, generate questions first, then evaluate
    // For mock, we'll use a simplified approach
    const questionCount = Object.keys(answers).length;
    if (questionCount > 0) {
      // Mock: Having answers reduces risk slightly
      riskScore = Math.max(0, riskScore - (questionCount * 5));
      confidence = 0.9;
    }
  }

  // Determine risk level
  const riskLevel = getRiskLevel(riskScore);

  // Determine if questions are needed
  const needsQuestions = riskLevel === 'MEDIUM' || (riskLevel === 'LOW' && riskScore > 20);

  // Generate questions if needed
  let questions: AdaptiveQuestion[] | undefined;
  if (needsQuestions && !answers) {
    questions = generateAdaptiveQuestions(factors, identifier);
  }

  // Block if HIGH risk
  const blocked = riskLevel === 'HIGH';

  // Generate recommendations
  const recommendations: string[] = [];
  if (factors.ipReputation < 50) {
    recommendations.push('Request from a trusted network');
  }
  if (factors.deviceFingerprint < 50) {
    recommendations.push('Use a device you\'ve used before');
  }
  if (factors.velocityCheck < 50) {
    recommendations.push('Wait before attempting recovery again');
  }

  return {
    riskLevel,
    score: Math.round(riskScore),
    confidence,
    factors,
    blocked,
    needsQuestions,
    questions,
    recommendations: recommendations.length > 0 ? recommendations : undefined,
  };
}

/**
 * Verify answers to adaptive questions
 */
export async function verifyAnswers(
  questions: AdaptiveQuestion[],
  answers: Record<string, string>,
  originalAssessment: RiskAssessment
): Promise<RiskAssessment> {
  // Evaluate answers and adjust risk
  const { adjustedScore, confidence } = evaluateAnswers(questions, answers, originalAssessment.score);
  
  // Determine new risk level
  const riskLevel = getRiskLevel(adjustedScore);
  
  // Update assessment
  return {
    ...originalAssessment,
    riskLevel,
    score: adjustedScore,
    confidence,
    blocked: riskLevel === 'HIGH',
    needsQuestions: false, // Questions have been answered
    questions: undefined,
  };
}

/**
 * Get mock risk assessment for testing
 */
export function getMockRiskAssessment(riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'): RiskAssessment {
  const scores = {
    LOW: { score: 15, factors: { ipReputation: 90, deviceFingerprint: 85, velocityCheck: 95, locationAnomaly: 90, requestPattern: 85, timePattern: 90 } },
    MEDIUM: { score: 50, factors: { ipReputation: 60, deviceFingerprint: 55, velocityCheck: 65, locationAnomaly: 50, requestPattern: 60, timePattern: 55 } },
    HIGH: { score: 85, factors: { ipReputation: 25, deviceFingerprint: 30, velocityCheck: 20, locationAnomaly: 15, requestPattern: 25, timePattern: 30 } },
  };

  const config = scores[riskLevel];
  const factors = config.factors as RiskFactors;

  return {
    riskLevel,
    score: config.score,
    confidence: riskLevel === 'LOW' ? 0.95 : riskLevel === 'MEDIUM' ? 0.80 : 0.70,
    factors,
    blocked: riskLevel === 'HIGH',
    needsQuestions: riskLevel === 'MEDIUM',
    questions: riskLevel === 'MEDIUM' ? generateAdaptiveQuestions(factors, 'test@example.com') : undefined,
  };
}
