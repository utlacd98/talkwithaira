# Aira OpenAI Integration Setup Guide

## 🚀 Quick Start

### Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in with your OpenAI account (create one if needed)
3. Click "Create new secret key"
4. Copy the key (you won't be able to see it again!)

### Step 2: Add API Key to Environment

1. Open the `.env.local` file in the project root
2. Replace `your_openai_api_key_here` with your actual API key:

```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_OPENAI_MODEL=gpt-4o-mini
```

3. Save the file

### Step 3: Restart the Dev Server

```bash
npm run dev
```

The server will automatically reload with your new API key.

## 🧠 Aira's AI Personality

Aira is configured with a comprehensive system prompt that defines her as:

- **Empathetic AI Companion**: Focused on emotional support and mental wellness
- **Non-Judgmental Listener**: Creates a safe space for users to share
- **Supportive Guide**: Offers coping strategies and perspective
- **Ethical AI**: Knows her limitations and directs to professional help when needed

### System Prompt Features

The system prompt includes:
- Core values (Empathy, Privacy, Accessibility, Growth)
- Personality traits (Warm, Thoughtful, Honest, Encouraging)
- Response guidelines (Listen, Validate, Ask, Offer, Suggest)
- Important safety guidelines (Crisis recognition, professional help referrals)
- Emotional tone variations (Calm, Empathetic, Supportive, Reflective)
- Example conversation patterns
- Strengths and limitations

### Training Data

Aira has been trained with:
- **Emotional Support Responses**: For anxiety, depression, stress, loneliness
- **Coping Strategies**: Grounding techniques, mindfulness, self-care
- **Reflective Questions**: To help users gain perspective
- **Affirmations**: Positive reinforcement and encouragement

## 🔧 Configuration

### Model Selection

Currently using `gpt-4o-mini` for:
- Fast response times
- Cost-effective
- Excellent emotional intelligence
- Good context understanding

To change the model, edit `.env.local`:
```
NEXT_PUBLIC_OPENAI_MODEL=gpt-4-turbo
```

Available models:
- `gpt-4o` - Most capable, best for complex emotional reasoning
- `gpt-4o-mini` - Fast and cost-effective (recommended)
- `gpt-4-turbo` - Good balance of capability and speed

### API Parameters

In `/app/api/chat/route.ts`:
- **temperature**: 0.7 (balanced creativity and consistency)
- **max_tokens**: 500 (response length limit)
- **top_p**: 0.9 (diversity in responses)

## 💰 Pricing & Costs

### gpt-4o-mini Pricing (as of Oct 2024)
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens

### Estimated Monthly Costs
- 100 conversations/day × 30 days = 3,000 conversations
- Average 500 tokens per conversation = 1.5M tokens
- Estimated cost: ~$1-2/month

## 🔒 Security Best Practices

✅ **DO:**
- Store API key in `.env.local` (never commit to git)
- Use environment variables for sensitive data
- Implement rate limiting for production
- Monitor API usage in OpenAI dashboard
- Rotate API keys periodically

❌ **DON'T:**
- Hardcode API keys in source files
- Commit `.env.local` to version control
- Share API keys in chat or emails
- Use the same key across multiple projects
- Leave old keys active

### .gitignore Configuration

The `.env.local` file should be in `.gitignore`:
```
.env.local
.env.*.local
```

## 🧪 Testing the Integration

### Test Chat Endpoint

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "I am feeling anxious today"}
    ]
  }'
```

### Expected Response

```json
{
  "message": "I can sense the anxiety you're experiencing. Remember, it's natural to feel worried sometimes. Let's take a moment together - what specific thoughts are causing you the most concern right now?"
}
```

## 🐛 Troubleshooting

### "API key not found" Error
- Check `.env.local` file exists
- Verify `OPENAI_API_KEY` is set correctly
- Restart dev server after adding key

### "Rate limit exceeded" Error
- You've hit OpenAI's rate limits
- Wait a few minutes before retrying
- Consider upgrading your OpenAI plan

### "Invalid API key" Error
- API key is incorrect or expired
- Generate a new key from OpenAI dashboard
- Update `.env.local` with new key

### Slow Responses
- Check your internet connection
- OpenAI API might be experiencing issues
- Try a simpler prompt first

## 📊 Monitoring & Analytics

### OpenAI Dashboard
- Visit [Usage Dashboard](https://platform.openai.com/account/usage/overview)
- Monitor API calls and costs
- Set usage limits to prevent unexpected charges

### Application Logging
- Check browser console for client-side errors
- Check server logs for API errors
- Errors are logged with `[Aira Chat API]` prefix

## 🚀 Production Deployment

### Environment Variables
Set these in your hosting platform (Vercel, Netlify, etc.):
```
OPENAI_API_KEY=your_production_key
NEXT_PUBLIC_OPENAI_MODEL=gpt-4o-mini
```

### Rate Limiting
Implement rate limiting to prevent abuse:
```typescript
// Example: 10 requests per minute per user
const rateLimit = new Map()
```

### Error Handling
- Implement retry logic for failed requests
- Add user-friendly error messages
- Log errors for monitoring

## 📚 Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Chat Completions Guide](https://platform.openai.com/docs/guides/chat-completions)
- [Model Comparison](https://platform.openai.com/docs/models)
- [Rate Limits](https://platform.openai.com/docs/guides/rate-limits)

## ❓ FAQ

**Q: Can I use a free OpenAI account?**
A: Yes, but you need to add a payment method. Free trial credits expire after 3 months.

**Q: How do I know if my API key is working?**
A: Try the test curl command above. If you get a response, it's working!

**Q: Can I change Aira's personality?**
A: Yes! Edit `/lib/aira-system-prompt.ts` to customize her behavior.

**Q: Is my conversation data stored?**
A: OpenAI stores conversations for 30 days for safety/abuse monitoring. See their privacy policy.

**Q: Can I use a different AI provider?**
A: Yes! The code is modular. You can swap OpenAI for Anthropic, Google, etc.

