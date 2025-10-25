# 🤖 Aira - AI Companion for Emotional Clarity

> Your AI companion that listens, reasons, and reflects with you. Discover emotional clarity and calm in every conversation.

## 🎯 What is Aira?

Aira is a modern web application that provides emotional support and mental wellness guidance through an AI companion powered by OpenAI's GPT-4o-mini model.

### Key Features
- 💬 **24/7 AI Support** - Always available to listen and support
- 🧠 **Emotionally Intelligent** - Recognizes and responds to emotional context
- 🛡️ **Safe & Private** - Non-judgmental, secure conversations
- 📊 **Personalized** - Adapts responses to individual needs
- 🎯 **Evidence-Based** - Uses therapeutic techniques and coping strategies

## 🚀 Quick Start (2 Minutes)

### 1. Get OpenAI API Key
```bash
# Visit: https://platform.openai.com/api-keys
# Create new secret key
# Copy the key (format: sk-proj-xxxxx...)
```

### 2. Add to Project
```bash
# Edit: .env.local
# Replace: your_openai_api_key_here
# With: sk-proj-your-actual-key
```

### 3. Start Server
```bash
npm run dev
```

### 4. Test Chat
```
1. Go to http://localhost:3000
2. Sign up or login
3. Click "Try Chat"
4. Start chatting with Aira!
```

## 📁 Project Structure

```
mytalkwithaira/
├── app/
│   ├── page.tsx                 # Home page
│   ├── about/page.tsx           # About page
│   ├── pricing/page.tsx         # Pricing page
│   ├── blog/page.tsx            # Blog page ✨
│   ├── login/page.tsx           # Login page
│   ├── signup/page.tsx          # Signup page
│   ├── chat/page.tsx            # Chat interface 🤖
│   ├── dashboard/page.tsx       # Dashboard
│   ├── settings/page.tsx        # Settings
│   ├── checkout/page.tsx        # Checkout
│   ├── privacy/page.tsx         # Privacy policy
│   ├── terms/page.tsx           # Terms of service
│   └── api/
│       └── chat/route.ts        # OpenAI integration 🚀
├── components/
│   ├── chat/
│   │   ├── chat-interface.tsx   # Main chat UI
│   │   ├── chat-message.tsx     # Message display
│   │   └── emotion-ring.tsx     # Emotion indicator
│   ├── dashboard/
│   ├── settings/
│   ├── navigation.tsx           # Header navigation
│   ├── footer.tsx               # Footer
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── aira-system-prompt.ts    # Aira's personality 🧠
│   └── auth-context.tsx         # Authentication
├── .env.local                   # API key configuration
└── [Documentation files]
```

## 🧠 Aira's Personality

### Core Values
- **Empathy First** - Validate feelings before offering advice
- **Non-Judgmental** - Safe space for sharing anything
- **Privacy & Security** - Never ask for personal identifying information
- **Accessibility** - Clear, compassionate language
- **Continuous Growth** - Learn from each conversation

### Capabilities
✅ Empathetic listening
✅ Emotional validation
✅ Coping strategy suggestions
✅ Reflective questioning
✅ Affirmations & encouragement
✅ Crisis recognition
✅ Professional boundaries

### Limitations
❌ Not a replacement for therapy
❌ Cannot diagnose conditions
❌ Cannot prescribe medications
❌ Cannot provide crisis intervention (but directs to resources)

## 💰 Pricing

Using **gpt-4o-mini** (recommended):
- **Per chat**: ~$0.001-0.003
- **100 chats/day**: ~$1-3/month
- **1000 chats/day**: ~$10-30/month

Very affordable for personal use!

## 🔒 Security

✅ **Implemented**
- API key in `.env.local` (not in code)
- `.env.local` in `.gitignore`
- Error handling without exposing secrets
- Rate limit detection
- Input validation

✅ **Best Practices**
- Never commit API keys
- Rotate keys periodically
- Monitor usage dashboard
- Set spending limits

## 📚 Documentation

- **QUICK_START.md** - 2-minute setup guide
- **OPENAI_SETUP.md** - Complete setup with troubleshooting
- **AIRA_TRAINING_GUIDE.md** - How to customize Aira
- **SETUP_CHECKLIST.md** - Verification checklist
- **IMPLEMENTATION_SUMMARY.md** - Project overview

## 🛠️ Technology Stack

### Frontend
- Next.js 16.0.0
- React 19.2.0
- Tailwind CSS
- shadcn/ui components
- TypeScript

### Backend
- Next.js API Routes
- OpenAI SDK
- Node.js

### AI
- OpenAI GPT-4o-mini
- Custom system prompt
- Training data for emotional support

## 🧪 Testing

### Manual Test
```bash
1. Go to http://localhost:3000
2. Sign up
3. Go to /chat
4. Type: "I'm feeling anxious"
5. Aira responds with empathetic support
```

### API Test
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "I am feeling anxious"}
    ]
  }'
```

## ⚙️ Configuration

### Change Model
Edit `.env.local`:
```
NEXT_PUBLIC_OPENAI_MODEL=gpt-4o  # Most capable
NEXT_PUBLIC_OPENAI_MODEL=gpt-4o-mini  # Fast (recommended)
NEXT_PUBLIC_OPENAI_MODEL=gpt-4-turbo  # Balanced
```

### Customize Aira
Edit `/lib/aira-system-prompt.ts`:
- Modify system prompt
- Add/remove training data
- Update affirmations
- Change coping strategies

### Adjust Responses
Edit `/app/api/chat/route.ts`:
- `temperature: 0.7` - Creativity level
- `max_tokens: 500` - Response length
- `top_p: 0.9` - Response diversity

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "API key not found" | Check `.env.local` exists, restart server |
| "Invalid API key" | Generate new key, update `.env.local` |
| "Rate limit exceeded" | Wait 5 minutes, check usage dashboard |
| Slow responses | Check internet, try simpler prompt |

## 📊 Monitoring

### OpenAI Dashboard
- Visit: https://platform.openai.com/account/usage/overview
- Monitor API calls and costs
- Set usage limits

### Application Logs
- Check browser console for client errors
- Check server logs for API errors
- Errors logged with `[Aira Chat API]` prefix

## 🚀 Deployment

### Environment Variables
Set in your hosting platform:
```
OPENAI_API_KEY=your_production_key
NEXT_PUBLIC_OPENAI_MODEL=gpt-4o-mini
```

### Build & Deploy
```bash
npm run build
npm start
```

## 📚 Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Chat Completions](https://platform.openai.com/docs/guides/chat-completions)
- [Models](https://platform.openai.com/docs/models)
- [Rate Limits](https://platform.openai.com/docs/guides/rate-limits)

## ❓ FAQ

**Q: Do I need a paid OpenAI account?**
A: Yes, but you need to add a payment method. Free trial credits expire after 3 months.

**Q: How do I know if it's working?**
A: Sign up, go to /chat, type a message. If Aira responds, it's working!

**Q: Can I use a different AI provider?**
A: Yes! The code is modular. You can swap OpenAI for Anthropic, Google, etc.

**Q: Is my data stored?**
A: OpenAI stores conversations for 30 days for safety. See their privacy policy.

**Q: Can I make Aira more clinical?**
A: Yes, modify the system prompt in `/lib/aira-system-prompt.ts`.

## 🎉 Getting Started

1. **Get API Key** - https://platform.openai.com/api-keys
2. **Add to Project** - Edit `.env.local`
3. **Restart Server** - `npm run dev`
4. **Test Chat** - Go to http://localhost:3000/chat
5. **Enjoy!** - Start chatting with Aira

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: October 2024

**Ready to provide emotional support and mental wellness guidance!** 🚀

