# POST /api/recovery/verify - Recovery Verification with AI Risk Scoring

## 📋 Overview

The `/api/recovery/verify` endpoint verifies a recovery session using AI-powered risk scoring. It analyzes the recovery attempt for fraud indicators and blocks HIGH risk attempts.

---

## 🔒 Security Features

✅ **AI Risk Scoring** - Analyzes recovery attempts for fraud  
✅ **Risk-Based Blocking** - Blocks HIGH risk attempts  
✅ **Multiple Risk Levels** - LOW, MEDIUM, HIGH  
✅ **Factor Analysis** - Identifies risk factors  
✅ **Session Validation** - Validates recovery session exists  

---

## 📡 API Endpoint

**POST** `/api/recovery/verify`

### Request Body

```json
{
  "sessionId": "xK9mP2nQ7rS4tU8vW1yZ3aB5cD6eF0gH"
}
```

### Success Response (200 OK)

**LOW Risk:**
```json
{
  "success": true,
  "message": "Recovery session verified",
  "riskLevel": "LOW",
  "blocked": false
}
```

**MEDIUM Risk:**
```json
{
  "success": true,
  "message": "Recovery session verified",
  "riskLevel": "MEDIUM",
  "blocked": false
}
```

### Blocked Response (403 Forbidden)

**HIGH Risk:**
```json
{
  "success": false,
  "error": "Recovery attempt blocked due to security risk",
  "riskLevel": "HIGH",
  "blocked": true
}
```

### Development Mode

In development, additional details are included:

```json
{
  "success": true,
  "message": "Recovery session verified",
  "riskLevel": "MEDIUM",
  "blocked": false,
  "score": 45,
  "factors": [
    "Unusual IP location",
    "Multiple recovery attempts detected"
  ],
  "confidence": 0.85
}
```

---

## 🎯 Risk Levels

### LOW (0-39)
- **Action**: Allow recovery to proceed
- **Meaning**: Low risk of fraud, normal recovery attempt
- **Response**: 200 OK with `blocked: false`

### MEDIUM (40-69)
- **Action**: Allow recovery but may require additional verification
- **Meaning**: Some suspicious indicators, but not blocked
- **Response**: 200 OK with `blocked: false`
- **Recommendation**: Consider additional verification steps (CAPTCHA, SMS verification)

### HIGH (70-100)
- **Action**: **BLOCK recovery attempt**
- **Meaning**: High risk of fraud, likely fraudulent attempt
- **Response**: 403 Forbidden with `blocked: true`

---

## 🔄 Behavior Flow

1. **Accept Session ID** - Validate session ID is provided
2. **Fetch Session Data** - Get recovery session from storage
3. **Run AI Risk Scoring** - Analyze session for fraud indicators:
   - IP address reputation
   - Request velocity (frequency of attempts)
   - Time-based patterns
   - Identifier reputation (email/phone)
   - Device/behavior fingerprinting
4. **Calculate Risk Score** - AI model returns risk score (0-100)
5. **Determine Risk Level** - Convert score to LOW/MEDIUM/HIGH
6. **Block if HIGH** - Return 403 if HIGH risk
7. **Allow if LOW/MEDIUM** - Return 200 if LOW or MEDIUM risk

---

## 📝 Example Usage

### Using cURL

```bash
curl -X POST http://localhost:3000/api/recovery/verify \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "xK9mP2nQ7rS4tU8vW1yZ3aB5cD6eF0gH"}'
```

### Using JavaScript (Fetch)

```javascript
const response = await fetch('http://localhost:3000/api/recovery/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionId: 'xK9mP2nQ7rS4tU8vW1yZ3aB5cD6eF0gH'
  })
});

const data = await response.json();

if (data.blocked) {
  console.error('Recovery blocked:', data.error);
} else {
  console.log('Recovery verified, risk level:', data.riskLevel);
}
```

---

## 🤖 AI Risk Scoring (Current: Mock)

### Current Implementation

The risk scoring is currently **mocked** for development. It simulates AI analysis using:
- Random risk scores
- Basic heuristics (IP analysis, velocity checks)
- Pattern matching (disposable emails, unusual times)

### Future AI Integration

See `docs/AI_RISK_SCORING.md` for complete integration guide. Options include:
- Internal ML models (TensorFlow, PyTorch)
- Third-party services (Sift, Riskified, AWS Fraud Detector)
- Custom ML endpoints

---

## ⚠️ Error Cases

### Missing Session ID

```json
// Request: {}
// Response: 400
{
  "success": false,
  "error": {
    "message": "Session ID is required"
  }
}
```

### Session Not Found

```json
// Request: { "sessionId": "invalid-session" }
// Response: 400
{
  "success": false,
  "error": {
    "message": "Recovery session not found"
  }
}
```

---

## 🔐 Security Considerations

### 1. Risk Factor Exposure

In production, don't expose detailed risk factors to prevent attackers from gaming the system. Only show:
- Risk level (LOW/MEDIUM/HIGH)
- Blocked status

Hide in production:
- Exact score
- Specific factors
- Confidence level

### 2. Fail-Secure

If AI risk scoring service is unavailable, the system should:
- Return MEDIUM risk (not HIGH)
- Log the failure
- Allow recovery with additional verification

### 3. Rate Limiting

Consider rate limiting the verify endpoint to prevent:
- Brute force attempts
- Session enumeration
- DoS attacks

---

## 🔄 Complete Recovery Flow

1. **Start Recovery** (`POST /api/recovery/start`)
   - User provides email/phone
   - Returns session ID
   - Token sent via email/SMS

2. **Verify Recovery** (`POST /api/recovery/verify`) ← **This endpoint**
   - Verify session with AI risk scoring
   - Check risk level
   - Block if HIGH risk

3. **Validate Token** (`POST /api/recovery/validate`)
   - User provides token from email/SMS
   - Token validated (single-use, expiration)
   - Returns user ID if valid

4. **Reset Password** (separate endpoint)
   - User provides new password
   - Password updated

---

## 📊 Risk Factors Analyzed

### IP Address Analysis
- IP reputation (known bad IPs, VPNs, proxies)
- Geolocation (unusual locations, impossible travel)
- IP consistency (same IP for user's history)

### Request Velocity
- Recovery attempts per hour
- Recovery attempts per day
- Unique IPs used

### Time Patterns
- Unusual request times (e.g., 3 AM)
- Timezone inconsistencies
- Time since last successful login

### Identifier Reputation
- Disposable email detection
- Phone number reputation
- Domain/email age

### Device/Behavior
- Device fingerprinting
- Browser characteristics
- Behavioral patterns

---

## ✅ Best Practices

1. **Always verify before validating token** - Run risk scoring first
2. **Monitor risk distributions** - Track HIGH risk percentages
3. **Review blocked attempts** - Manually review HIGH risk cases
4. **Tune risk thresholds** - Adjust based on false positive/negative rates
5. **Integrate real AI** - Replace mock with actual ML model (see AI_RISK_SCORING.md)
