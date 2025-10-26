# 🏆 Leaderboard - Quick Start Guide

## 🚀 Getting Started

### Access the Leaderboard

**Option 1: From Games Hub**
1. Go to `/games`
2. Click the **[Leaderboard]** button at the top
3. You'll see the top 10 players

**Option 2: Direct URL**
- Navigate to: `https://v0-aira-web-app.vercel.app/games/leaderboard`

## 📊 Understanding the Leaderboard

### Your Stats Summary (Top Section)

```
┌─────────────────────────────────────┐
│ Your Rank: #5                       │
│ Wins: 4  │  Losses: 2  │  Draws: 1 │
│ Win Rate: 57.1%                     │
└─────────────────────────────────────┘
```

- **Rank**: Your position on the leaderboard
- **Wins**: Times you beat Aira
- **Losses**: Times Aira beat you
- **Draws**: Tied games
- **Win Rate**: Percentage of games won

### Leaderboard Table

| Column | Meaning |
|--------|---------|
| **Rank** | Position (🥇🥈🥉 for top 3) |
| **Player** | Username (highlighted if you) |
| **Wins** | Total wins (green) |
| **Losses** | Total losses (red) |
| **Draws** | Total draws (gray) |
| **Streak** | Current win streak (🔥 if active) |
| **Win Rate** | Percentage of wins |

### Streak Indicator

```
🔥 Streak 3  = You've won 3 games in a row!
🔥 Streak 5+ = Unstoppable! (Aira will comment)
```

## 🎮 How Stats Are Tracked

### When You Play Tic-Tac-Toe

1. **You Win** → Wins +1, Streak +1
2. **You Lose** → Losses +1, Streak resets to 0
3. **Draw** → Draws +1, Streak resets to 0

Stats update **immediately** after each game!

### Example Game Sequence

```
Game 1: You Win   → Wins: 1, Streak: 1
Game 2: You Win   → Wins: 2, Streak: 2
Game 3: You Lose  → Losses: 1, Streak: 0
Game 4: You Win   → Wins: 3, Streak: 1
Game 5: Draw      → Draws: 1, Streak: 0
```

## 🏅 Ranking System

### How Rankings Work

Players are ranked by:
1. **Primary**: Total Wins (highest first)
2. **Secondary**: Current Streak (highest first)

### Example Rankings

```
Rank 1: Alice - 10 Wins, Streak 5
Rank 2: Bob   - 10 Wins, Streak 2
Rank 3: Carol - 8 Wins, Streak 3
Rank 4: You   - 4 Wins, Streak 1
```

## 💡 Tips to Climb the Leaderboard

### Strategy 1: Build Your Streak
- Focus on winning consecutive games
- A streak of 5+ gets Aira's special message!
- Streaks reset on loss, so play carefully

### Strategy 2: Maximize Wins
- Play more games to increase total wins
- Each win moves you up the ranking
- Consistency matters more than perfection

### Strategy 3: Improve Win Rate
- Aim for >50% win rate
- Study Aira's moves
- Control the center square
- Create "forks" (two winning opportunities)

## 🎯 Aira's Leaderboard Messages

### Based on Your Rank

**Top 3 Players**:
> "Wow! You're dominating lately! 🔥"

**Streak ≥ 5**:
> "Unstoppable energy today! Keep it up! 💪"

**Everyone Else**:
> "Here's how everyone's doing! You're climbing the board 💚"

## 📱 Mobile View

The leaderboard is fully responsive:
- **Mobile**: Single column, scrollable table
- **Tablet**: 2-column layout
- **Desktop**: Full table view

## 🔄 Refreshing Stats

Stats update automatically:
- ✅ After each game ends
- ✅ When you navigate to leaderboard
- ✅ Real-time via Redis

**Manual Refresh**: Press F5 or refresh the page

## ❓ FAQ

### Q: How often does the leaderboard update?
**A**: Instantly! Stats are saved to Redis immediately after each game.

### Q: Can I see my rank without playing?
**A**: Yes! Your rank appears on the leaderboard even if you haven't played recently.

### Q: What if I have the same wins as someone else?
**A**: The player with the higher streak ranks higher. If streaks are equal, whoever played most recently ranks higher.

### Q: Does my streak reset if I don't play?
**A**: No, your streak only resets when you lose or draw a game.

### Q: Can I see other players' profiles?
**A**: Not yet! Player profiles are coming soon.

### Q: Is there a weekly leaderboard?
**A**: Not yet! Weekly/monthly leaderboards are planned for future updates.

## 🎮 Playing to Rank Up

### Quick Tips

1. **Play Consistently**: More games = more wins
2. **Build Streaks**: Win multiple games in a row
3. **Study Patterns**: Learn Aira's strategy
4. **Control Center**: The middle square is key
5. **Plan Ahead**: Think 2-3 moves ahead

### Tic-Tac-Toe Strategy

```
Winning Opening Moves:
1. Take center (5)
2. Take corner (1, 3, 7, 9)
3. Force a fork (two winning paths)

Defensive Moves:
1. Block Aira's winning move
2. Prevent Aira from creating a fork
3. Control key squares
```

## 🔗 Related Links

- [Games Hub](/games)
- [Play Tic-Tac-Toe](/games)
- [Dashboard](/dashboard)
- [Full Leaderboard Docs](./LEADERBOARD_FEATURE.md)

## 🎉 Achievements

**Coming Soon**:
- 🥇 First Win
- 🔥 Streak 5
- 👑 Top 10 Rank
- 💯 Perfect Game (3 wins in a row)

---

**Ready to climb the leaderboard? Go play! 💚**

