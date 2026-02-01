# 🔧 Voice Mode Troubleshooting Guide

## 🐛 Issue: Aira Not Responding Back

### **Symptoms**
- Voice Mode opens successfully ✅
- Microphone works and captures speech ✅
- Transcript appears on screen ✅
- Processing state shows ✅
- **But Aira doesn't speak back** ❌

---

## 🔍 Debugging Steps

### **Step 1: Check Browser Console**

1. Open Voice Mode
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Speak a message
5. Look for these log messages:

```
[Voice Mode] Final transcript: [your message]
[Voice Mode] Sending message: [your message]
[Voice Mode] Calling onSendMessage...
[Chat Interface] Voice message received: [your message]
[Chat Interface] User message added to chat
[Chat Interface] Sending to API with userId: [user-id]
[Chat Interface] API response status: 200
[Chat Interface] API response data: { message: "..." }
[Chat Interface] Got Aira response: [response]
[Chat Interface] Returning response to voice mode
[Voice Mode] Got response: [response]
[Voice Mode] Starting speech: [response]
[Voice Mode] Voices loaded: [number]
[Voice Mode] Using voice: [voice name]
[Voice Mode] Calling speak()
[Voice Mode] Speech started
[Voice Mode] Speech ended
```

### **Step 2: Identify Where It Fails**

#### **If you see "API response status: 429"**
- **Problem**: Daily chat limit reached
- **Solution**: Upgrade to Premium or wait until tomorrow

#### **If you see "API response status: 500"**
- **Problem**: Server error
- **Solution**: Check API logs, try again in a moment

#### **If you see "Speech synthesis not available"**
- **Problem**: Browser doesn't support TTS
- **Solution**: Use Chrome, Edge, or Safari

#### **If you see "Voices loaded: 0"**
- **Problem**: Voices not loaded yet
- **Solution**: Wait a moment and try again

#### **If you don't see "Speech started"**
- **Problem**: Speech synthesis failed to start
- **Solution**: Check browser audio settings

---

## 🔧 Common Fixes

### **Fix 1: Reload Voices**

Some browsers need time to load voices. Try this:

1. Open Voice Mode
2. Wait 2-3 seconds before speaking
3. Try speaking again

### **Fix 2: Check Audio Output**

1. Check system volume (not muted)
2. Check browser audio settings
3. Try using headphones
4. Test with another website (e.g., YouTube)

### **Fix 3: Clear Browser Cache**

1. Press **Ctrl+Shift+Delete** (Windows) or **Cmd+Shift+Delete** (Mac)
2. Select "Cached images and files"
3. Click "Clear data"
4. Reload the page

### **Fix 4: Try Different Browser**

**Recommended browsers:**
- ✅ Chrome (best support)
- ✅ Edge (Chromium-based)
- ✅ Safari (macOS/iOS)

**Not recommended:**
- ⚠️ Firefox (limited TTS support)
- ❌ Internet Explorer (not supported)

### **Fix 5: Check Permissions**

1. Click the **lock icon** in address bar
2. Check **Microphone** permission (should be "Allow")
3. Check **Sound** permission (should be "Allow")
4. Reload the page

---

## 🧪 Test Speech Synthesis

### **Quick Test in Console**

1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Paste this code:

```javascript
const synth = window.speechSynthesis
const utterance = new SpeechSynthesisUtterance("Hello, this is a test")
synth.speak(utterance)
```

4. Press **Enter**

**Expected result:** You should hear "Hello, this is a test"

**If you don't hear anything:**
- Check system volume
- Check browser audio settings
- Try a different browser

---

## 📊 Detailed Logging

### **Enable Verbose Logging**

The latest version (deployed) includes detailed logging. Check console for:

1. **Voice Mode logs** (purple/blue)
   - `[Voice Mode] ...`

2. **Chat Interface logs** (green)
   - `[Chat Interface] ...`

3. **API logs** (yellow)
   - `[Chat API] ...`

### **What to Look For**

#### **✅ Successful Flow:**
```
[Voice Mode] Final transcript: hello
[Voice Mode] Sending message: hello
[Chat Interface] Voice message received: hello
[Chat Interface] API response status: 200
[Chat Interface] Got Aira response: Hello! How can I help...
[Voice Mode] Got response: Hello! How can I help...
[Voice Mode] Starting speech: Hello! How can I help...
[Voice Mode] Speech started
[Voice Mode] Speech ended
```

#### **❌ Failed Flow (No Response):**
```
[Voice Mode] Final transcript: hello
[Voice Mode] Sending message: hello
[Chat Interface] Voice message received: hello
[Chat Interface] API response status: 200
[Chat Interface] Got Aira response: Hello! How can I help...
[Voice Mode] Got response: Hello! How can I help...
[Voice Mode] Starting speech: Hello! How can I help...
[Voice Mode] Speech synthesis not available  ← ERROR HERE
```

---

## 🔍 Advanced Debugging

### **Check Speech Synthesis API**

Run this in console:

```javascript
console.log("Speech Synthesis:", window.speechSynthesis)
console.log("Voices:", window.speechSynthesis.getVoices())
```

**Expected output:**
```
Speech Synthesis: SpeechSynthesis { ... }
Voices: Array(50) [ ... ]
```

**If you see:**
```
Speech Synthesis: undefined
```
→ **Browser doesn't support TTS**

### **Check Voice Loading**

```javascript
window.speechSynthesis.onvoiceschanged = () => {
  console.log("Voices changed:", window.speechSynthesis.getVoices().length)
}
```

---

## 📱 Mobile-Specific Issues

### **iOS Safari**
- ✅ Fully supported
- ⚠️ May require user interaction first
- ⚠️ Volume may be controlled by ringer switch

### **Android Chrome**
- ✅ Fully supported
- ⚠️ May require "Desktop site" mode
- ⚠️ Check "Media" volume (not "Ringer")

---

## 🆘 Still Not Working?

### **Collect Debug Info**

1. Browser name and version
2. Operating system
3. Console logs (screenshot)
4. Network tab (check /api/chat request)

### **Contact Support**

Email: support@airasupport.com

Include:
- Description of issue
- Debug info from above
- Steps to reproduce

---

## ✅ Verification Checklist

Before reporting an issue, verify:

- [ ] Microphone permission granted
- [ ] System volume not muted
- [ ] Browser supports TTS (Chrome/Edge/Safari)
- [ ] Voices loaded (check console)
- [ ] API returns response (check console)
- [ ] No errors in console
- [ ] Tried different browser
- [ ] Tried clearing cache
- [ ] Tried reloading page

---

**Updated**: 2025-12-02
**Version**: 1.1 (with enhanced logging)

