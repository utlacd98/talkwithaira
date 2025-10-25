# 🚀 Aira OpenAI - Quick Start (2 Minutes)

## ⚡ TL;DR

1. Get API key: https://platform.openai.com/api-keys
2. Edit `.env.local`:
   ```
   OPENAI_API_KEY=sk-proj-your-key-here
   NEXT_PUBLIC_OPENAI_MODEL=gpt-4o-mini
   ```
3. Run: `npm run dev`
4. Chat at: http://localhost:3000/chat

## 📋 Detailed Steps

### Step 1: Get OpenAI API Key (1 min)
```
1. Go to https://platform.openai.com/api-keys
2. Sign in (create account if needed)
3. Click "Create new secret key"
4. Copy the key (looks like: sk-proj-xxxxx...)
```

### Step 2: Add Key to Project (30 sec)
```
1. Open: mytalkwithaira/.env.local
2. Replace: your_openai_api_key_here
3. With: sk-proj-your-actual-key
4. Save file
```

### Step 3: Restart Server (30 sec)
```bash
# Stop current server (Ctrl+C)
# Then run:
npm run dev
```

### Step 4: Test Chat (30 sec)
```
1. Go to http://localhost:3000
2. Sign up or login
3. Click "Try Chat"
4. Type a message
5. Aira responds!
```

## 🎯 What You Get

✅ **Aira AI Companion**
- Empathetic emotional support
- Mental wellness guidance
- Coping strategies
- 24/7 availability

✅ **Smart Features**
- Emotion detection
- Personalized responses
- Crisis recognition
- Professional boundaries

✅ **Production Ready**
- Error handling
- Rate limiting
- Security best practices
- Comprehensive logging

## 💰 Cost

- **gpt-4o-mini**: ~$0.001-0.003 per chat
- **100 chats/day**: ~$1-3/month
- **Very affordable!**

## 🔒 Security

✅ API key in `.env.local` (not in code)
✅ `.env.local` in `.gitignore`
✅ Never commit API key
✅ Rotate keys periodically

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "API key not found" | Check `.env.local` exists, restart server |
| "Invalid API key" | Generate new key, update `.env.local` |
| "Rate limit exceeded" | Wait 5 minutes, check usage dashboard |
| Slow responses | Check internet, try simpler prompt |

## 📚 Documentation

- **OPENAI_SETUP.md** - Full setup guide
- **AIRA_TRAINING_GUIDE.md** - Customize Aira
- **AIRA_OPENAI_SETUP_COMPLETE.md** - Overview

## 🎓 Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Chat Completions](https://platform.openai.com/docs/guides/chat-completions)
- [Models](https://platform.openai.com/docs/models)

## ✨ Customization

### Change Model
Edit `.env.local`:
```
NEXT_PUBLIC_OPENAI_MODEL=gpt-4o  # Most capable
NEXT_PUBLIC_OPENAI_MODEL=gpt-4o-mini  # Fast (recommended)
NEXT_PUBLIC_OPENAI_MODEL=gpt-4-turbo  # Balanced
```

### Change Aira's Personality
Edit `/lib/aira-system-prompt.ts`:
- Modify `AIRA_SYSTEM_PROMPT`
- Add/remove training data
- Update affirmations

### Adjust Response Style
Edit `/app/api/chat/route.ts`:
- `temperature: 0.7` → creativity level
- `max_tokens: 500` → response length
- `top_p: 0.9` → diversity

## 🚀 Deploy to Production

1. Set environment variables in hosting platform
2. Deploy with `npm run build && npm start`
3. Monitor usage in OpenAI dashboard
4. Set spending limits for safety

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

## 🎉 You're Ready!

Your Aira AI companion is fully set up and ready to provide emotional support.

**Just add your API key and start chatting!**

---

**Need help?** Check the full documentation files or OpenAI's official docs.

