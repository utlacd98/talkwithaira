# 🏆 Leaderboard Feature - Aira Mini Games

## Overview

The Leaderboard system tracks player performance in Noughts & Crosses (Tic-Tac-Toe) and displays rankings based on wins, streaks, and win rates. All data is persisted in Redis for real-time leaderboard updates.

## 📁 File Structure

```
mytalkwithaira/
├── app/
│   ├── api/
│   │   └── games/
│   │       ├── leaderboard/
│   │       │   └── route.ts          # Leaderboard API endpoint
│   │       └── save-stats/
│   │           └── route.ts          # Save game stats endpoint
│   └── games/
│       └── leaderboard/
│           └── page.tsx              # Leaderboard UI page
├── lib/
│   └── updateUserGameStats.ts        # Redis stats helper functions
└── components/
    └── games/
        └── TicTacToe.tsx             # Updated with stats tracking
```

## 🎯 Core Features

### 1. Redis Stats Storage

**Key Structure**: `user:{userId}:games`

```json
{
  "wins": 5,
  "losses": 3,
  "draws": 2,
  "streak": 3,
  "lastPlayedAt": "2025-10-26T16:30:00Z"
}
```

**Features**:
- ✅ Automatic increment on game end
- ✅ Streak tracking (resets on loss/draw)
- ✅ Last played timestamp
- ✅ Win rate calculation

### 2. Game Stats Tracking

When a Tic-Tac-Toe game ends:

1. **Player Wins** → `wins++`, `streak++`
2. **Player Loses** → `losses++`, `streak=0`
3. **Draw** → `draws++`, `streak=0`

Stats are saved immediately via `/api/games/save-stats` endpoint.

### 3. Leaderboard API

**Endpoint**: `GET /api/games/leaderboard`

**Query Parameters**:
- `userId` (optional) - Get current user's rank and stats
- `limit` (default: 10) - Number of results
- `offset` (default: 0) - Pagination offset

**Response**:
```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user123",
      "username": "Andrew",
      "wins": 5,
      "losses": 3,
      "draws": 2,
      "streak": 3,
      "totalGames": 10,
      "winRate": "50.0",
      "lastPlayedAt": "2025-10-26T16:30:00Z"
    }
  ],
  "total": 42,
  "userRank": 5,
  "userStats": {
    "rank": 5,
    "username": "Andrew",
    "wins": 4,
    "losses": 2,
    "draws": 1,
    "totalGames": 7,
    "winRate": "57.1"
  }
}
```

### 4. Leaderboard Page

**Route**: `/games/leaderboard`

**Features**:
- ✅ Top 10 players ranked by wins and streak
- ✅ Current user's stats summary (4 cards)
- ✅ Responsive table with rank badges
- ✅ Aira's contextual messages
- ✅ Highlight current user's row
- ✅ Streak indicator with flame emoji
- ✅ Win rate percentage

**Aira Messages**:
- Top 3 rank: "Wow! You're dominating lately! 🔥"
- Streak ≥ 5: "Unstoppable energy today! Keep it up! 💪"
- Default: "Here's how everyone's doing! You're climbing the board 💚"

## 🔧 Implementation Details

### Save Game Stats Flow

```
TicTacToe Component
    ↓
Game Ends (win/loss/draw)
    ↓
saveGameStats(result)
    ↓
POST /api/games/save-stats
    ↓
updateUserGameStats(userId, result)
    ↓
Redis HSET user:{userId}:games
    ↓
Stats Updated ✅
```

### Fetch Leaderboard Flow

```
Leaderboard Page Loads
    ↓
useEffect fetches /api/games/leaderboard?userId={id}
    ↓
getAllUserGameStats()
    ↓
Query all user:*:games keys from Redis
    ↓
Sort by wins (desc), then streak (desc)
    ↓
Return top 10 + current user's rank
    ↓
Display in table ✅
```

## 📊 Data Structure

### User Profile (Optional)

**Key**: `user:{userId}:profile`

```json
{
  "userId": "user123",
  "username": "Andrew",
  "email": "andrew@example.com",
  "createdAt": "2025-10-26T10:00:00Z"
}
```

### Game Stats

**Key**: `user:{userId}:games`

```json
{
  "wins": "5",
  "losses": "3",
  "draws": "2",
  "streak": "3",
  "lastPlayedAt": "2025-10-26T16:30:00Z"
}
```

## 🎨 UI Components

### Leaderboard Page Layout

```
┌─────────────────────────────────────┐
│ [Back] Mini Games Hub    [Theme]    │
├─────────────────────────────────────┤
│ 🏆 Leaderboard                      │
│ See how you rank against others      │
├─────────────────────────────────────┤
│ 💚 Aira says...                     │
│ "Here's how everyone's doing!"      │
├─────────────────────────────────────┤
│ Your Rank: #5                       │
│ Wins: 4  Losses: 2  Draws: 1        │
│ Win Rate: 57.1%                     │
├─────────────────────────────────────┤
│ Rank │ Player │ Wins │ Losses │ ... │
├──────┼────────┼──────┼────────┼─────┤
│ 🥇   │ Andrew │  5   │   3    │ ... │
│ 🥈   │ Sarah  │  4   │   2    │ ... │
│ 🥉   │ Mike   │  3   │   4    │ ... │
│ #4   │ You    │  4   │   2    │ ... │
│ #5   │ Emma   │  2   │   5    │ ... │
└─────────────────────────────────────┘
```

### Games Hub Updates

```
┌─────────────────────────────────────┐
│ [Play Games] [Leaderboard]          │
├─────────────────────────────────────┤
│ 📊 Your Record                      │
│ 4 Wins • 2 Losses • 1 Draw          │
│ 🔥 Streak 3        [View Rank]      │
├─────────────────────────────────────┤
│ Games Grid...                       │
└─────────────────────────────────────┘
```

## 🔐 Security

- ✅ Protected routes (requires authentication)
- ✅ User can only update their own stats
- ✅ Clerk authentication validation
- ✅ Edge-compatible API endpoints
- ✅ No sensitive data exposed

## 📈 Performance

- **Redis Queries**: O(n) for all users, O(1) for individual stats
- **Sorting**: O(n log n) for leaderboard ranking
- **Caching**: Leaderboard fetched on page load
- **Real-time**: Stats update immediately after game ends

## 🚀 API Endpoints

### 1. Save Game Stats

```
POST /api/games/save-stats

Request:
{
  "userId": "user123",
  "game": "tictactoe",
  "result": "win",
  "timestamp": "2025-10-26T16:30:00Z"
}

Response:
{
  "success": true,
  "stats": {
    "wins": 5,
    "losses": 3,
    "draws": 2,
    "streak": 3,
    "lastPlayedAt": "2025-10-26T16:30:00Z"
  }
}
```

### 2. Get Leaderboard

```
GET /api/games/leaderboard?userId=user123&limit=10&offset=0

Response:
{
  "success": true,
  "leaderboard": [...],
  "total": 42,
  "userRank": 5,
  "userStats": {...}
}
```

## 🧪 Testing Checklist

- [ ] Play Tic-Tac-Toe game and win
- [ ] Check Redis for updated stats
- [ ] Verify stats appear on games hub
- [ ] Navigate to leaderboard
- [ ] Verify current user is highlighted
- [ ] Check rank calculation
- [ ] Test streak tracking (win multiple times)
- [ ] Test streak reset (lose a game)
- [ ] Verify Aira messages change based on rank
- [ ] Test pagination (if >10 users)
- [ ] Test on mobile (responsive)
- [ ] Test dark mode

## 🔄 Future Enhancements

- [ ] Pagination for >10 users
- [ ] Filter by game type
- [ ] Time-based leaderboards (weekly, monthly)
- [ ] Achievement badges
- [ ] User profiles with stats history
- [ ] Leaderboard notifications
- [ ] Export leaderboard data
- [ ] Difficulty-based rankings

## 📞 Troubleshooting

### Stats Not Saving

1. Check browser console for errors
2. Verify user is authenticated
3. Check Redis connection
4. Verify `/api/games/save-stats` endpoint is working

### Leaderboard Not Loading

1. Check network tab for API errors
2. Verify Redis has data
3. Check browser console for errors
4. Verify user ID is being passed correctly

### Rank Not Updating

1. Refresh the page
2. Check Redis for latest stats
3. Verify sorting logic (wins desc, streak desc)

---

**Last Updated**: October 26, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready

