# Voice Recovery Documentation

## 📋 Overview

Voice Recovery uses the Web Speech API to convert spoken input to text, providing an alternative input method for account recovery. It includes automatic fallback to text input for unsupported browsers or when voice recognition fails.

---

## 🎯 Features

1. **Voice-to-Text Conversion**
   - Real-time speech recognition
   - Live transcript display
   - Interim and final results

2. **Browser Compatibility**
   - Chrome/Edge: Full support
   - Safari: Partial support (macOS 10.15+, iOS 13+)
   - Firefox: Not supported (automatic fallback)

3. **Error Handling**
   - Graceful fallback on errors
   - Clear error messages
   - Microphone permission handling

4. **User Experience**
   - Visual feedback while listening
   - Ability to switch between voice and text
   - Auto-submission on valid input

---

## 🔧 Browser Support

### Supported Browsers

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome/Edge | ✅ Full | Best support |
| Safari (macOS 10.15+) | ✅ Full | Requires HTTPS |
| Safari (iOS 13+) | ✅ Full | Requires HTTPS |
| Firefox | ❌ Not Supported | Uses text fallback |
| Opera | ✅ Full | Based on Chromium |

### Requirements

- **HTTPS**: Required for microphone access (except localhost)
- **Microphone Permission**: User must grant microphone access
- **Modern Browser**: Chrome 33+, Safari 14.1+, Edge 79+

---

## 🎤 How It Works

### 1. Initialization

```typescript
const SpeechRecognition = 
  window.SpeechRecognition || 
  window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  // Configure recognition
}
```

### 2. Configuration

```typescript
recognition.continuous = true;    // Keep listening
recognition.interimResults = true; // Show partial results
recognition.lang = 'en-US';        // Language
recognition.maxAlternatives = 1;   // Single result
```

### 3. Event Handlers

- **onresult**: Handles speech recognition results
- **onerror**: Handles errors (no-speech, permission denied, etc.)
- **onend**: Called when recognition stops

### 4. Result Processing

```typescript
recognition.onresult = (event) => {
  let finalTranscript = '';
  let interimTranscript = '';
  
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      finalTranscript += transcript + ' ';
    } else {
      interimTranscript += transcript;
    }
  }
  
  // Process final transcript
  if (finalTranscript) {
    onTranscript(finalTranscript.trim());
  }
};
```

---

## 🔄 Error Handling

### Common Errors

1. **no-speech**
   - No speech detected
   - User should try speaking again

2. **audio-capture**
   - No microphone found
   - Falls back to text input

3. **not-allowed**
   - Microphone permission denied
   - Prompts user to enable permissions

4. **network**
   - Network error
   - Falls back to text input

5. **aborted**
   - User stopped recognition
   - Normal operation, no error shown

### Error Recovery

- Automatic fallback to text input
- Clear error messages
- Option to retry voice input
- Guidance on fixing issues

---

## 💡 Usage Example

### Basic Usage

```tsx
<VoiceRecovery
  method="email"
  onTranscript={(text) => {
    console.log('Transcript:', text);
    // Process transcript
  }}
  placeholder="your.email@example.com"
/>
```

### With Method Selection

```tsx
<VoiceRecovery
  method={selectedMethod} // 'email' or 'phone'
  onTranscript={(text) => {
    setIdentifier(text);
    // Auto-validate and submit if valid
  }}
/>
```

---

## 🎨 UI Components

### Voice Input Mode

- **Start/Stop Button**: Controls recognition
- **Transcript Display**: Shows live transcript
- **Listening Indicator**: Visual feedback
- **Clear Button**: Clears transcript
- **Switch to Text**: Manual fallback option

### Text Input Mode

- **Text Input Field**: Standard text input
- **Submit Button**: Submits text
- **Switch to Voice**: Option to use voice

### Error States

- **Error Message**: Clear explanation
- **Fallback Button**: Switch to text input
- **Retry Option**: Try voice again

---

## 🔐 Privacy & Security

### Microphone Access

- Requires explicit user permission
- Only active during voice input
- Automatically stops when done
- No audio data stored

### Data Handling

- Transcript processed locally
- Sent to verification logic only
- No voice recordings saved
- Complies with privacy regulations

---

## 🧪 Testing

### Test Voice Input

1. Grant microphone permission
2. Click "Start Voice Input"
3. Speak clearly
4. Verify transcript appears
5. Check auto-submission on valid input

### Test Fallback

1. Deny microphone permission
2. Verify fallback to text appears
3. Verify text input works
4. Test switching back to voice (if supported)

### Test Error Handling

1. Test with no microphone
2. Test network errors
3. Test permission denial
4. Verify graceful fallback

---

## 📊 Integration Points

### Step 1: Identify Account

Voice input integrated into Step 1 of recovery flow:

```tsx
<VoiceRecovery
  method={method} // 'email' or 'phone'
  onTranscript={(text) => {
    setIdentifier(text);
    if (validateInput(text, method)) {
      onNext(text, method);
    }
  }}
/>
```

### Auto-Validation

- Transcript automatically validated
- Auto-submission on valid input
- Error shown for invalid input

---

## 🎯 Best Practices

1. **Always Provide Fallback**
   - Not all browsers support voice
   - Users may prefer text
   - Errors require fallback

2. **Clear Instructions**
   - Tell users to speak clearly
   - Indicate when listening
   - Show transcript for confirmation

3. **Error Handling**
   - Handle all error types
   - Provide clear messages
   - Offer alternatives

4. **User Control**
   - Allow switching between modes
   - Let users stop listening
   - Clear transcript option

---

## 🔮 Future Enhancements

1. **Multi-language Support**
   - Support for multiple languages
   - Language selection
   - Auto-detection

2. **Improved Accuracy**
   - Custom grammar for emails/phones
   - Context-aware recognition
   - Confidence scoring

3. **Accessibility**
   - Screen reader announcements
   - Keyboard shortcuts
   - Visual indicators

4. **Offline Support**
   - Offline speech recognition
   - On-device processing
   - Reduced network dependency
