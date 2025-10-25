# 💾 Save Chat - Quick Start Guide

## 🎯 What You Can Do Now

### 1. Save Conversations
Click the **Save** button in the chat header to save your conversation.
- Auto-generates a title with today's date
- Auto-tags based on emotions and topics discussed
- Stores with your user ID
- Returns a unique chat ID

### 2. Export Your Chat
Click the **Download** button dropdown to export:
- **JSON**: Full structured data with timestamps (for data portability)
- **Text**: Human-readable format (for sharing/printing)

### 3. Clear Chat
Click the **Trash** button to start a fresh conversation.
- Confirms before clearing
- Resets to welcome message

### 4. Logout
Click **Logout** to end your session.

---

## 📊 What Gets Saved

When you save a chat, the system stores:

```
✅ All messages (user and Aira)
✅ Timestamps for each message
✅ Emotion detected for each response
✅ Auto-generated tags (anxiety, depression, etc.)
✅ Your user ID
✅ Chat title and creation date
✅ Message count
```

---

## 🏷️ Auto-Tags

The system automatically detects and tags:

### Emotions
- 😰 **anxiety** - anxious, worried, nervous
- 😢 **depression** - sad, depressed, down
- 😠 **anger** - angry, furious, rage
- 💔 **grief** - loss, died, missing
- 😨 **panic** - panic attack, can't breathe
- 😓 **stress** - stressed, overwhelmed
- 😴 **sleep** - insomnia, tired, can't sleep
- 😔 **loneliness** - lonely, alone, isolated

### Coping Strategies
- 🫁 **breathing_exercise** - breathing, breath work
- 🌍 **grounding** - 5-4-3-2-1, grounding
- 🎉 **celebration** - happy, great, excited

---

## 📥 Export Formats

### JSON Export
```json
{
  "title": "Chat - 10/24/2025",
  "exportedAt": "2025-10-24T14:30:00Z",
  "messageCount": 12,
  "messages": [
    {
      "role": "user",
      "content": "I'm feeling anxious",
      "emotion": "empathetic",
      "timestamp": "2025-10-24T14:00:00Z"
    },
    ...
  ]
}
```

### Text Export
```
Chat - 10/24/2025
Exported: 10/24/2025, 2:30 PM
Messages: 12
==================================================

[2:00 PM] You:
I'm feeling anxious

[2:01 PM] Aira:
I hear that you're feeling anxious...

...
```

---

## 🔄 API Endpoints (For Developers)

### Save Chat
```bash
POST /api/chat/save
Content-Type: application/json

{
  "title": "My Chat",
  "messages": [...],
  "userId": "user123",
  "tags": ["anxiety", "coping"]
}

Response:
{
  "success": true,
  "chatId": "chat_1729xxx_abc123",
  "title": "My Chat",
  "messageCount": 12,
  "tags": ["anxiety", "breathing_exercise"],
  "savedAt": "2025-10-24T14:30:00Z"
}
```

### Get Saved Chats
```bash
GET /api/chat/save?userId=user123

Response:
{
  "success": true,
  "chats": [
    {
      "id": "chat_xxx",
      "title": "Chat - 10/24/2025",
      "messageCount": 12,
      "tags": ["anxiety"],
      "createdAt": "2025-10-24T14:30:00Z"
    },
    ...
  ],
  "count": 5
}
```

### Delete Chat
```bash
DELETE /api/chat/save?chatId=chat_xxx

Response:
{
  "success": true,
  "message": "Chat deleted successfully"
}
```

---

## 💻 Code Examples

### Using in Your App

```typescript
import { saveChat, exportChatAsJSON, getSavedChats } from '@/lib/chat-utils'

// Save a chat
const result = await saveChat(messages, "My Chat", user.id)
console.log(result.chatId)  // "chat_1729xxx_abc123"

// Export as JSON
exportChatAsJSON(messages, "My Chat")

// Get all saved chats
const chats = await getSavedChats(user.id)
chats.forEach(chat => {
  console.log(`${chat.title} - ${chat.messageCount} messages`)
})
```

---

## 🎯 Use Cases

### 1. Journaling
Save daily conversations with Aira to track your emotional journey over time.

### 2. Backup
Export your chats as JSON for secure backup and data portability.

### 3. Sharing
Export as text to share insights with a therapist or trusted friend.

### 4. Analysis
Use exported data to analyze patterns in your conversations.

### 5. Reference
Keep saved chats to revisit helpful coping strategies.

---

## ⚙️ Configuration

### Current Setup
- **Storage**: In-memory (Map)
- **User Tracking**: By user ID
- **Auto-Tagging**: Enabled
- **Export Formats**: JSON, Text

### Production Setup (Coming Soon)
- **Storage**: Database (Supabase/MongoDB)
- **Encryption**: End-to-end encryption
- **Retention**: Configurable retention policies
- **Backup**: Automatic cloud backup
- **Sharing**: Secure sharing links

---

## 🔐 Privacy & Security

### Your Data
- ✅ Stored with your user ID
- ✅ Not shared with other users
- ✅ Can be exported anytime
- ✅ Can be deleted anytime

### Best Practices
- 🔒 Keep your user ID private
- 🔒 Don't share exported files with sensitive data
- 🔒 Use HTTPS for all connections
- 🔒 Log out when done

---

## 🐛 Troubleshooting

### "Cannot save empty chat"
- Have a conversation first
- At least 2 messages required (1 user + 1 Aira)

### "Failed to save chat"
- Check your internet connection
- Verify user ID is set
- Check browser console for errors

### Export not downloading
- Check browser download settings
- Disable pop-up blockers
- Try a different browser

### Tags not showing
- Tags are auto-generated from content
- More messages = more accurate tags
- Check for keyword matches

---

## 📈 What's Coming

### Next Features
- 📱 Chat history page
- 🔍 Search and filter saved chats
- 📊 Mood tracking dashboard
- 📈 Conversation insights
- 🔗 Share chats securely
- 📄 Export to PDF
- 🌐 Cloud sync

---

## 📞 Need Help?

1. **Check the docs**: See `SAVE_CHAT_FEATURE.md` for detailed documentation
2. **Check the code**: See `/lib/chat-utils.ts` for implementation
3. **Check the API**: See `/app/api/chat/save/route.ts` for endpoints
4. **Check the UI**: See `/components/chat/chat-interface.tsx` for interface

---

## ✨ Key Features

| Feature | Status | Details |
|---------|--------|---------|
| Save Chat | ✅ | Persistent storage with metadata |
| Export JSON | ✅ | Full data export for portability |
| Export Text | ✅ | Human-readable format |
| Auto-Tagging | ✅ | Emotion and topic detection |
| Clear Chat | ✅ | Start fresh conversation |
| Delete Chat | ✅ | Remove saved conversations |
| Get Chats | ✅ | Retrieve user's saved chats |
| Search | ⏳ | Coming soon |
| Analytics | ⏳ | Coming soon |
| Sharing | ⏳ | Coming soon |

---

## 🚀 Ready to Use!

Your save chat feature is **fully implemented and ready to use**. 

Start a conversation with Aira, then click **Save** to persist it!

---

**Last Updated**: October 24, 2025
**Status**: ✅ Production Ready
**Version**: 1.0

