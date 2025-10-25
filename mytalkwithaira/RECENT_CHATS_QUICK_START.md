# 📋 Recent Chats - Quick Start Guide

## 🎯 What You Can Do Now

### 1. View Recent Chats
Click the **History** button (📋 icon) in the top left of the chat header to open the sidebar.

### 2. Load a Chat
Click on any chat in the sidebar to load it.
- All messages restore
- Timestamps preserved
- Chat title shows in header
- Sidebar closes automatically

### 3. Delete a Chat
Hover over a chat and click the **Trash** button to delete it.
- Confirms before deletion
- Removes immediately
- Permanent deletion

### 4. See Chat Details
Each chat shows:
- **Title**: Auto-generated from date
- **Message Count**: Number of messages
- **Tags**: Auto-detected emotions/topics

### 5. Refresh List
Click **Refresh** button at bottom of sidebar to reload chat list.

---

## 🎨 UI Overview

```
┌─────────────────────────────────────────────────────┐
│ [History] [Menu] [Aira Logo] [Save] [Export] [Clear]│
├─────────────────────────────────────────────────────┤
│                                                       │
│  Chat messages display here                          │
│                                                       │
│                                                       │
└─────────────────────────────────────────────────────┘

Sidebar (when open):
┌──────────────────┐
│ Recent Chats  [X]│
├──────────────────┤
│ Chat - 10/24     │
│ 12 messages      │
│ [anxiety] [calm] │
│                  │
│ Chat - 10/23     │
│ 8 messages       │
│ [stress]         │
│                  │
│ [Refresh]        │
└──────────────────┘
```

---

## 🚀 Step-by-Step Usage

### Load a Previous Chat
1. Click **History** button (top left)
2. Sidebar opens showing recent chats
3. Click on the chat you want to load
4. Messages load and sidebar closes
5. Chat title appears in header

### Delete a Chat
1. Click **History** button
2. Hover over the chat to delete
3. Click the **Trash** icon
4. Confirm deletion
5. Chat removed from list

### Refresh Chat List
1. Click **History** button
2. Scroll to bottom of sidebar
3. Click **Refresh** button
4. List updates with latest chats

---

## 💡 Tips & Tricks

### Desktop
- Click History button to toggle sidebar
- Hover over chats to see delete button
- Click chat to load and auto-close sidebar
- Sidebar stays open until you click a chat or toggle button

### Mobile
- Click History button to open sidebar
- Sidebar slides in from left
- Click overlay to close sidebar
- Tap chat to load it

### Organization
- Chats are sorted by newest first
- Tags help identify chat topics
- Message count shows conversation length
- Titles auto-generated from date

---

## 🏷️ Understanding Tags

Tags are auto-detected from your conversation:

### Emotion Tags
- 😰 **anxiety** - Anxious, worried, nervous
- 😢 **depression** - Sad, depressed, down
- 😠 **anger** - Angry, furious, rage
- 💔 **grief** - Loss, died, missing
- 😨 **panic** - Panic attack, can't breathe
- 😓 **stress** - Stressed, overwhelmed
- 😴 **sleep** - Insomnia, tired, can't sleep
- 😔 **loneliness** - Lonely, alone, isolated

### Coping Tags
- 🫁 **breathing_exercise** - Breathing, breath work
- 🌍 **grounding** - 5-4-3-2-1, grounding
- 🎉 **celebration** - Happy, great, excited

---

## 📊 Chat Metadata

### Title
- Auto-generated: "Chat - MM/DD/YYYY"
- Shows date chat was created
- Helps identify when conversation happened

### Message Count
- Total messages in chat
- Includes both user and Aira messages
- Helps gauge conversation length

### Tags
- Up to 2 tags shown
- "+N more" if more than 2
- Click to see all tags (future feature)

---

## ⚙️ Settings & Options

### Sidebar Position
- Fixed on left side
- Slides in/out smoothly
- Mobile: Full width with overlay

### Auto-Refresh
- Manual refresh via button
- Auto-loads on sidebar open
- Updates with latest chats

### Sorting
- Newest first (by creation date)
- Can't change sort order yet (coming soon)

---

## 🔐 Privacy & Security

### Your Data
- ✅ Only you can see your chats
- ✅ Chats stored with your user ID
- ✅ Deletion is permanent
- ✅ No sharing with other users

### Best Practices
- 🔒 Don't share chat links
- 🔒 Log out when done
- 🔒 Delete sensitive chats if needed
- 🔒 Use strong passwords

---

## 🐛 Troubleshooting

### Sidebar Won't Open
- Check if History button is visible
- Try refreshing the page
- Check browser console for errors

### Chat Won't Load
- Verify internet connection
- Check if chat still exists
- Try refreshing sidebar
- Check browser console

### Delete Not Working
- Confirm deletion in dialog
- Check internet connection
- Try refreshing sidebar
- Check browser console

### Tags Not Showing
- Tags auto-generated from content
- More messages = more accurate tags
- Check for keyword matches
- Refresh sidebar to update

---

## 📱 Mobile Experience

### Opening Sidebar
- Tap History button
- Sidebar slides in from left
- Overlay covers main content

### Closing Sidebar
- Tap overlay to close
- Tap History button again
- Tap a chat to load and close

### Selecting Chat
- Tap chat to load
- Sidebar closes automatically
- Messages appear in main area

---

## 🎯 Common Tasks

### Find a Specific Chat
1. Click History button
2. Look through recent chats
3. Check tags for topic
4. Click to load

### Delete Old Chats
1. Click History button
2. Hover over chat
3. Click Trash icon
4. Confirm deletion

### Load Yesterday's Chat
1. Click History button
2. Look for chat from yesterday
3. Check message count
4. Click to load

### See All Your Chats
1. Click History button
2. Scroll through list
3. Refresh to see latest
4. Click any to load

---

## 📈 What's Coming

### Soon
- [ ] Search chats
- [ ] Filter by tags
- [ ] Sort options
- [ ] Rename chats
- [ ] Pin favorites

### Later
- [ ] Chat folders
- [ ] Bulk delete
- [ ] Export multiple
- [ ] Share chats
- [ ] Collaboration

---

## ✨ Key Features

| Feature | Status | Details |
|---------|--------|---------|
| View Chats | ✅ | See all saved conversations |
| Load Chat | ✅ | Click to restore |
| Delete Chat | ✅ | Remove unwanted chats |
| Chat Metadata | ✅ | Title, count, tags |
| Responsive | ✅ | Works on all devices |
| Auto-Tags | ✅ | Emotion detection |
| Refresh | ✅ | Update chat list |
| Empty State | ✅ | Helpful message |

---

## 🎉 Ready to Use!

Your recent chats feature is **fully implemented and ready to use**.

Click the **History** button to view and load your saved conversations!

---

## 📞 Need Help?

1. **Check the docs**: See `RECENT_CHATS_FEATURE.md` for detailed documentation
2. **Check the code**: See `/components/chat/chat-sidebar.tsx` for implementation
3. **Check the API**: See `/app/api/chat/save/route.ts` for endpoints
4. **Check the UI**: See `/components/chat/chat-interface.tsx` for integration

---

**Last Updated**: October 24, 2025
**Status**: ✅ Production Ready
**Version**: 1.0

