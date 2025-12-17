# AI Verification System Documentation

## 📋 Overview

The AI Verification system performs real-time risk assessment of recovery attempts using multiple factors and adaptive questioning to verify user identity.

---

## 🎯 Key Features

1. **Multi-Factor Risk Analysis**
   - IP reputation scoring
   - Device fingerprinting
   - Velocity checks (request frequency)
   - Location anomaly detection
   - Request pattern analysis
   - Time pattern analysis

2. **Adaptive Questioning**
   - Questions generated based on risk factors
   - Different questions for different risk scenarios
   - Answers adjust final risk score

3. **Risk-Based Flow Control**
   - LOW risk: Proceed immediately
   - MEDIUM risk: Ask adaptive questions
   - HIGH risk: Block recovery attempt

4. **Mock AI Responses**
   - Simulated risk factor analysis
   - Realistic delays and responses
   - Configurable risk scenarios

---

## 🔍 Risk Factors

### IP Reputation (25% weight)
- Checks IP address against reputation databases
- Scores: 0-100 (100 = trusted IP)
- Factors: VPN usage, known malicious IPs, geolocation

### Device Fingerprint (20% weight)
- Analyzes device characteristics
- Scores: 0-100 (100 = known device)
- Factors: Browser fingerprint, OS, hardware info

### Velocity Check (20% weight)
- Analyzes request frequency
- Scores: 0-100 (100 = normal frequency)
- Factors: Recent recovery attempts, request rate

### Location Anomaly (15% weight)
- Detects unusual location patterns
- Scores: 0-100 (100 = expected location)
- Factors: Geographic distance, travel patterns

### Request Pattern (10% weight)
- Analyzes request characteristics
- Scores: 0-100 (100 = normal pattern)
- Factors: Request timing, sequence patterns

### Time Pattern (10% weight)
- Checks temporal patterns
- Scores: 0-100 (100 = expected time)
- Factors: Time of day, day of week patterns

---

## 📊 Risk Scoring

### Calculation

```typescript
riskScore = 
  (100 - ipReputation) * 0.25 +
  (100 - deviceFingerprint) * 0.20 +
  (100 - velocityCheck) * 0.20 +
  (100 - locationAnomaly) * 0.15 +
  (100 - requestPattern) * 0.10 +
  (100 - timePattern) * 0.10
```

### Risk Levels

- **LOW**: Score < 30
  - Proceed immediately
  - No questions required
  - Auto-advance to Step 3

- **MEDIUM**: Score 30-70
  - Ask adaptive questions
  - Adjust score based on answers
  - Proceed if score improves

- **HIGH**: Score > 70
  - Block recovery attempt
  - Show error message
  - Provide recommendations

---

## ❓ Adaptive Questions

### Question Types

1. **Location Question**
   - Triggered by: Low IP reputation
   - Question: "What city did you create your account in?"
   - Type: Text input

2. **Device Question**
   - Triggered by: Low device fingerprint
   - Question: "What type of device are you using?"
   - Type: Multiple choice

3. **Velocity Question**
   - Triggered by: Low velocity check (too many requests)
   - Question: "Did you attempt to recover your account recently?"
   - Type: Multiple choice

4. **Security Question**
   - Triggered by: Location anomaly
   - Question: "When did you last successfully log in?"
   - Type: Text input (optional)

5. **Account Creation Question**
   - Triggered by: Suspicious request pattern
   - Question: "When did you create this account?"
   - Type: Text input (optional)

6. **Verification Question**
   - Always asked if no other questions
   - Question: "Confirm this recovery is for your own account"
   - Type: Checkbox

### Answer Evaluation

- Answers adjust risk score
- Correct/plausible answers: -5 to -10 points
- Missing required answers: +20 points
- Confidence calculated based on answer quality

---

## 🔄 Flow Control

### Step 2: AI Verification Flow

```
1. Start Verification
   ↓
2. Analyze Risk Factors
   ↓
3. Calculate Risk Score
   ↓
4. Determine Risk Level
   ├─→ LOW: Proceed to Step 3
   ├─→ MEDIUM: Show Questions
   │   ↓
   │   User Answers Questions
   │   ↓
   │   Re-evaluate Risk
   │   ├─→ Improved: Proceed to Step 3
   │   └─→ Still HIGH: Block
   └─→ HIGH: Block Recovery
```

---

## 🎭 Mock AI Responses

### Current Implementation

The system uses mock responses for development. Mock responses simulate:

1. **Random Risk Factors**
   - Most scenarios return good factors (70-95)
   - Some scenarios return low factors (25-50)
   - Realistic distribution

2. **Realistic Delays**
   - 500ms for risk factor analysis
   - 500ms for risk assessment
   - Total ~1-2 seconds

3. **Configurable Scenarios**
   - `getMockRiskAssessment('LOW')` - Low risk scenario
   - `getMockRiskAssessment('MEDIUM')` - Medium risk scenario
   - `getMockRiskAssessment('HIGH')` - High risk scenario

### Production Integration

Replace mock functions with real API calls:

```typescript
// Replace this:
const factors = await analyzeRiskFactors(identifier);

// With this:
const response = await fetch('/api/recovery/verify', {
  method: 'POST',
  body: JSON.stringify({ identifier, sessionId }),
});
const factors = await response.json();
```

---

## 📈 Recommendations

### For LOW IP Reputation
- "Request from a trusted network"
- "Try from a device you've used before"

### For LOW Device Fingerprint
- "Use a device you've used before"
- "Disable VPN if using one"

### For LOW Velocity Check
- "Wait before attempting recovery again"
- "If you recently requested recovery, wait a few minutes"

---

## 🔒 Security Considerations

1. **Rate Limiting**
   - Already implemented at route level
   - Prevents brute force attempts

2. **Session Management**
   - Each verification has a session ID
   - Sessions tracked for audit

3. **Answer Storage**
   - Answers evaluated but not stored
   - Only risk score stored

4. **Fraud Detection**
   - Multiple factors prevent single-point failures
   - Adaptive questions catch suspicious patterns

---

## 🧪 Testing

### Test Scenarios

1. **Low Risk Scenario**
   ```typescript
   const assessment = getMockRiskAssessment('LOW');
   // Should: Proceed immediately, no questions
   ```

2. **Medium Risk Scenario**
   ```typescript
   const assessment = getMockRiskAssessment('MEDIUM');
   // Should: Show questions, adjust score based on answers
   ```

3. **High Risk Scenario**
   ```typescript
   const assessment = getMockRiskAssessment('HIGH');
   // Should: Block recovery, show recommendations
   ```

---

## 📝 API Integration (Future)

### Endpoints to Integrate

1. **Risk Factor Analysis**
   - `/api/recovery/verify/factors`
   - Input: identifier, IP, userAgent
   - Output: RiskFactors

2. **Risk Assessment**
   - `/api/recovery/verify/assess`
   - Input: factors, sessionId
   - Output: RiskAssessment

3. **Answer Verification**
   - `/api/recovery/verify/answers`
   - Input: questions, answers, sessionId
   - Output: Updated RiskAssessment

---

## 🎨 UI Components

### AdaptiveQuestions Component
- Multi-step question form
- Progress indicator
- Answer validation
- Navigation (Previous/Next)

### Step2AIVerification Component
- Loading state with progress
- Risk assessment display
- Risk factor visualization
- Question integration
- Blocked state handling

---

## 📊 Metrics to Track

- Average risk scores
- Question completion rates
- Block rate (HIGH risk)
- Time to verification
- Answer accuracy patterns
- False positive/negative rates
