# AI Risk Scoring Integration Guide

## 📋 Overview

The recovery verification system uses AI/ML risk scoring to detect fraudulent recovery attempts. Currently implemented as a **mock** that simulates risk scoring, this document explains how to replace it with a real AI/ML model.

---

## 🎯 Current Implementation (Mock)

### Mock Behavior

The current implementation (`services/riskScoringService.js`) simulates AI risk scoring using:

- **Random risk scores** for demonstration
- **Basic heuristics** (IP analysis, velocity checks, time patterns)
- **Hardcoded patterns** (disposable emails, unusual times)

### Risk Levels

- **LOW** (0-39): Safe recovery attempt, allow to proceed
- **MEDIUM** (40-69): Suspicious but not blocked, may require additional verification
- **HIGH** (70-100): High risk of fraud, **BLOCK recovery attempt**

---

## 🤖 AI Integration Architecture

### Current Flow (Mock)

```
POST /api/recovery/verify
  ↓
assessRecoveryRisk(sessionId)
  ↓
calculateRiskScore(context) [MOCK]
  ↓
Return: { riskLevel, score, factors, blocked }
```

### Future Flow (Real AI)

```
POST /api/recovery/verify
  ↓
assessRecoveryRisk(sessionId)
  ↓
calculateRiskScore(context)
  ↓
Collect features from context
  ↓
Call AI/ML Model API
  ├─ Option 1: Internal ML Model (TensorFlow Serving, PyTorch)
  ├─ Option 2: Third-party Service (Sift, Riskified, AWS Fraud Detector)
  └─ Option 3: Custom ML Endpoint
  ↓
Parse model response
  ↓
Return: { riskLevel, score, factors, blocked }
```

---

## 🔄 Migration Steps

### Step 1: Prepare Feature Engineering

Identify all features needed for the ML model:

```javascript
const features = {
  // User Features
  userId: string,
  accountAge: number, // Days since account creation
  recoveryAttemptsLast24h: number,
  recoveryAttemptsLastHour: number,
  
  // Request Features
  requestMethod: 'email' | 'phone',
  identifier: string, // Email or phone
  clientIp: string,
  userAgent: string,
  deviceFingerprint: string,
  
  // Temporal Features
  requestHour: number, // 0-23
  requestDayOfWeek: number, // 0-6
  timeSinceLastAttempt: number, // Seconds
  
  // IP Features
  ipCountry: string,
  ipCity: string,
  ipIsVPN: boolean,
  ipIsProxy: boolean,
  ipReputationScore: number,
  
  // Identifier Features
  emailDomain: string,
  emailIsDisposable: boolean,
  phoneCountryCode: string,
  
  // Behavioral Features
  uniqueIPsLast24h: number,
  uniqueDevicesLast24h: number,
  typicalActivityHours: number[], // User's typical active hours
  lastKnownLocation: { lat, lon },
  currentLocation: { lat, lon },
  distanceFromLastLocation: number, // Kilometers
};
```

### Step 2: Choose AI/ML Integration Method

#### Option A: Internal ML Model (Recommended for Full Control)

**Use Cases:**
- Custom ML model trained on your data
- TensorFlow/PyTorch models
- Full control over model and features

**Implementation:**

```javascript
// services/riskScoringService.js

const tf = require('@tensorflow/tfjs-node');
// or
const axios = require('axios'); // For TensorFlow Serving

const calculateRiskScore = async (context) => {
  // 1. Engineer features
  const features = await engineerFeatures(context);
  
  // 2. Load/prepare model
  const model = await tf.loadLayersModel('file://./models/risk-scoring-model/model.json');
  
  // 3. Prepare input tensor
  const input = tf.tensor2d([featuresArray]);
  
  // 4. Run prediction
  const prediction = model.predict(input);
  const riskScore = await prediction.data()[0]; // 0-1 probability
  
  // 5. Convert to risk level
  const score = riskScore * 100;
  const riskLevel = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';
  
  return {
    riskLevel,
    score,
    confidence: Math.abs(prediction.data()[0] - 0.5) * 2, // Distance from 0.5
    factors: extractFactors(features, prediction)
  };
};
```

**TensorFlow Serving Example:**

```javascript
const axios = require('axios');

const calculateRiskScore = async (context) => {
  const features = await engineerFeatures(context);
  
  const response = await axios.post('http://ml-service:8501/v1/models/risk-scoring:predict', {
    instances: [features]
  });
  
  const prediction = response.data.predictions[0];
  const riskScore = prediction.risk_score * 100;
  
  return {
    riskLevel: riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW',
    score: riskScore,
    confidence: prediction.confidence,
    factors: prediction.explainability?.factors || []
  };
};
```

#### Option B: Third-Party Fraud Detection Service

**Use Cases:**
- Quick integration
- Industry-tested models
- Managed service

**Popular Services:**
- **Sift Science** - Real-time fraud detection
- **Riskified** - E-commerce fraud prevention
- **AWS Fraud Detector** - Managed ML fraud detection
- **Kount** - Digital fraud prevention

**Sift Science Example:**

```javascript
const SiftClient = require('@sift/sift-node');

const sift = new SiftClient(process.env.SIFT_API_KEY);

const calculateRiskScore = async (context) => {
  const response = await sift.track('$create_order', {
    '$user_id': context.userId,
    '$session_id': context.sessionId,
    '$ip': context.clientIp,
    '$user_email': context.identifier,
    '$type': 'recovery_attempt',
    '$time': Math.floor(context.createdAt.getTime() / 1000)
  });
  
  const score = response.score || 0; // 0-100
  const riskLevel = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';
  
  return {
    riskLevel,
    score,
    confidence: response.confidence || 0.8,
    factors: response.reasons || []
  };
};
```

**AWS Fraud Detector Example:**

```javascript
const { FraudDetectorClient, GetEventPredictionCommand } = require('@aws-sdk/client-frauddetector');

const client = new FraudDetectorClient({ region: 'us-east-1' });

const calculateRiskScore = async (context) => {
  const features = await engineerFeatures(context);
  
  const command = new GetEventPredictionCommand({
    detectorId: 'recovery-risk-detector',
    eventId: context.sessionId,
    eventTypeName: 'recovery_attempt',
    eventVariables: {
      ip_address: context.clientIp,
      email_address: context.identifier,
      user_id: context.userId,
      // ... other features
    }
  });
  
  const response = await client.send(command);
  
  const riskScore = response.modelScores[0].scores?.FRAUDULENT || 0;
  const riskLevel = riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW';
  
  return {
    riskLevel,
    score: riskScore,
    confidence: response.modelScores[0].score || 0.8,
    factors: response.outcomes || []
  };
};
```

#### Option C: Custom ML Endpoint

**Use Cases:**
- Separate ML service/team
- Microservices architecture
- Language flexibility (Python ML, Node.js API)

**Implementation:**

```javascript
const axios = require('axios');

const calculateRiskScore = async (context) => {
  const features = await engineerFeatures(context);
  
  const response = await axios.post(
    process.env.ML_SERVICE_URL + '/predict/risk-score',
    {
      sessionId: context.sessionId,
      features: features
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.ML_SERVICE_API_KEY}`
      },
      timeout: 5000 // 5 second timeout
    }
  );
  
  return {
    riskLevel: response.data.risk_level,
    score: response.data.score,
    confidence: response.data.confidence,
    factors: response.data.factors
  };
};
```

**Python ML Service Example:**

```python
# ml_service/app.py (Flask/FastAPI)
from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)
model = joblib.load('risk_scoring_model.pkl')

@app.route('/predict/risk-score', methods=['POST'])
def predict_risk():
    data = request.json
    features = extract_features(data['features'])
    
    # Predict
    risk_probability = model.predict_proba([features])[0][1]
    risk_score = risk_probability * 100
    
    # Determine risk level
    if risk_score >= 70:
        risk_level = 'HIGH'
    elif risk_score >= 40:
        risk_level = 'MEDIUM'
    else:
        risk_level = 'LOW'
    
    return jsonify({
        'risk_level': risk_level,
        'score': float(risk_score),
        'confidence': float(abs(risk_probability - 0.5) * 2),
        'factors': extract_important_features(features, model)
    })
```

### Step 3: Update Feature Engineering

Replace mock feature extraction with real data collection:

```javascript
// services/riskScoringService.js

const engineerFeatures = async (context) => {
  // Get session data from database
  const sessionData = await getSessionData(context.sessionId);
  
  // Get user data
  const userData = sessionData.userId 
    ? await getUserData(sessionData.userId)
    : null;
  
  // Get historical data
  const historical = await getHistoricalData(
    sessionData.userId,
    sessionData.identifier
  );
  
  // Get IP reputation data
  const ipData = await getIPReputation(sessionData.clientIp);
  
  // Get device fingerprint (from request headers)
  const deviceFingerprint = extractDeviceFingerprint(context.request);
  
  // Combine all features
  return {
    // User features
    accountAge: userData ? calculateAccountAge(userData.createdAt) : 0,
    recoveryAttemptsLast24h: historical.attemptsLast24h,
    recoveryAttemptsLastHour: historical.attemptsLastHour,
    
    // Request features
    requestMethod: sessionData.requestMethod === 'email' ? 1 : 0,
    identifierHash: hashIdentifier(sessionData.identifier),
    
    // IP features
    ipCountry: ipData.country,
    ipCity: ipData.city,
    ipIsVPN: ipData.isVPN,
    ipReputationScore: ipData.reputationScore,
    
    // Temporal features
    requestHour: sessionData.createdAt.getHours(),
    requestDayOfWeek: sessionData.createdAt.getDay(),
    timeSinceLastAttempt: calculateTimeSince(historical.lastAttempt),
    
    // Behavioral features
    uniqueIPsLast24h: historical.uniqueIPs,
    
    // ... more features
  };
};
```

### Step 4: Update Service Function

Replace the mock `calculateRiskScore` function:

```javascript
// services/riskScoringService.js

const calculateRiskScore = async (context) => {
  try {
    // Engineer features
    const features = await engineerFeatures(context);
    
    // Call AI/ML model (choose one method)
    const prediction = await callMLModel(features); // Option A, B, or C
    
    // Parse response
    const score = prediction.score || prediction.risk_score * 100;
    const riskLevel = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';
    
    return {
      riskLevel,
      score,
      factors: prediction.factors || [],
      confidence: prediction.confidence || 0.8
    };
  } catch (error) {
    logger.error('AI risk scoring failed', { error, sessionId: context.sessionId });
    
    // Fallback: Return MEDIUM risk if AI fails (fail-secure)
    return {
      riskLevel: 'MEDIUM',
      score: 50,
      factors: ['AI scoring unavailable'],
      confidence: 0.5
    };
  }
};
```

### Step 5: Add Configuration

Update `.env` for AI/ML configuration:

```env
# AI/ML Risk Scoring Configuration
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_API_KEY=your-api-key-here
ML_MODEL_PATH=./models/risk-scoring-model

# Or for third-party services
SIFT_API_KEY=your-sift-key
AWS_FRAUD_DETECTOR_DETECTOR_ID=recovery-risk-detector
```

---

## 📊 Model Training Considerations

### Training Data

Collect labeled data:
- **Features**: IP, timestamp, user behavior, device info
- **Labels**: Fraud (1) or Legitimate (0)
- **Sources**: Manual reviews, user reports, confirmed fraud cases

### Model Types

- **Logistic Regression**: Baseline, interpretable
- **Random Forest**: Good for feature importance
- **XGBoost**: High performance, handles non-linear patterns
- **Neural Networks**: Complex patterns, requires more data
- **Ensemble Methods**: Combine multiple models

### Features to Consider

1. **IP Reputation**: Known bad IPs, VPNs, proxies
2. **Velocity**: Requests per time window
3. **Geolocation**: Unusual locations, impossible travel
4. **Device Fingerprinting**: Device consistency, bot detection
5. **Behavioral Patterns**: Typing patterns, mouse movements
6. **Historical Patterns**: User's typical behavior
7. **Network Analysis**: Graph-based fraud detection

---

## 🔒 Security Considerations

1. **API Keys**: Store securely, rotate regularly
2. **Rate Limiting**: Limit ML service calls to prevent abuse
3. **Timeout Handling**: Fail-secure if ML service unavailable
4. **Data Privacy**: Ensure ML service complies with data regulations
5. **Feature Hashing**: Hash sensitive identifiers before sending to ML

---

## ✅ Testing Strategy

1. **Unit Tests**: Test feature engineering
2. **Integration Tests**: Test ML service calls
3. **A/B Testing**: Compare mock vs. real AI performance
4. **Performance Tests**: Ensure ML calls don't slow down API
5. **Fallback Tests**: Test behavior when ML service is down

---

## 📈 Monitoring

Monitor:
- ML service response times
- Risk score distributions
- False positive/negative rates
- Model confidence scores
- Feature importance changes

---

## 🚀 Deployment Checklist

- [ ] ML model trained and validated
- [ ] Feature engineering implemented
- [ ] ML service deployed and tested
- [ ] API keys configured
- [ ] Fallback behavior tested
- [ ] Monitoring set up
- [ ] Performance benchmarks met
- [ ] A/B testing plan ready
- [ ] Rollback plan prepared
