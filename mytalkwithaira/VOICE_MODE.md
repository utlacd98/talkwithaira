# 🎤 Voice Mode for Aira

## Overview

Voice Mode allows users to interact with Aira using their voice instead of typing. It includes:
- **Speech-to-Text (STT)**: Speak your messages to Aira
- **Text-to-Speech (TTS)**: Hear Aira's responses read aloud

## Features

### 🎙️ Speech-to-Text
- Click the microphone button to start recording
- Speak your message naturally
- Real-time transcription appears in the input field
- Click again to stop recording
- Message is automatically populated in the text field

### 🔊 Text-to-Speech
- When Voice Mode is enabled, Aira automatically reads her responses aloud
- Uses a warm, empathetic female voice
- Optimized speech rate and pitch for clarity and comfort
- Stop button appears while Aira is speaking

### 🎛️ Controls
- **Voice Mode Toggle**: Turn voice features on/off
- **Microphone Button**: Start/stop voice recording
- **Stop Speaking Button**: Interrupt Aira's speech
- **Visual Indicators**: 
  - Pulsing red dot when recording
  - Animated border on input field when listening
  - Pulsing stop button when speaking

## Browser Support

Voice Mode uses the Web Speech API, which is supported in:
- ✅ Chrome/Edge (full support)
- ✅ Safari (full support)
- ⚠️ Firefox (limited support)
- ❌ Internet Explorer (not supported)

The feature gracefully degrades - if not supported, the voice controls won't appear.

## Technical Implementation

### Components
- `hooks/use-voice-mode.ts`: Custom React hook managing voice functionality
- `components/chat/chat-interface.tsx`: Integrated voice controls in chat UI

### APIs Used
- **SpeechRecognition API**: For speech-to-text
- **SpeechSynthesis API**: For text-to-speech

### Voice Settings
- **Rate**: 0.95 (slightly slower for clarity)
- **Pitch**: 1.1 (slightly higher for warmth)
- **Volume**: 1.0 (full volume)
- **Language**: English (en-US)

## User Experience

1. **Enable Voice Mode**: Click "Voice Mode Off" button to turn it on
2. **Speak to Aira**: Click the microphone icon and speak your message
3. **Send Message**: Message is transcribed and ready to send
4. **Hear Response**: Aira's response is automatically read aloud
5. **Stop Anytime**: Click "Stop Speaking" to interrupt

## Privacy & Security

- All voice processing happens **locally in the browser**
- No audio is sent to external servers for transcription
- Voice data is not stored or recorded
- Uses browser's native speech APIs

## Future Enhancements

Potential improvements:
- Voice selection (different voices/accents)
- Adjustable speech rate and pitch
- Voice activity detection (auto-stop when silent)
- Multi-language support
- Voice commands (e.g., "send message", "clear chat")
- Offline voice recognition

