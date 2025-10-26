# 🎮 Mini Games - Quick Start Guide

## 🚀 Getting Started

### Access the Games Hub

1. **From Dashboard**:
   - Log in to Aira
   - Click the **"Play with Aira"** button
   - You'll be taken to `/games`

2. **Direct URL**:
   - Navigate to: `https://v0-aira-web-app.vercel.app/games`

### Play Noughts & Crosses

1. **Click the Game Card**:
   - Find "Noughts & Crosses" in the games grid
   - Click on it to enter the game

2. **Start Playing**:
   - Click **"Start Game"** button
   - You play as **O** (green)
   - Aira plays as **X** (purple)

3. **Make Your Move**:
   - Click any empty square on the 3x3 board
   - Aira will respond after 800ms

4. **Watch Aira React**:
   - Aira's dialogue appears above the board
   - Different messages for different game events
   - Encouraging and witty responses

5. **Game Ends When**:
   - You get 3 in a row → **You Win!** 🎉
   - Aira gets 3 in a row → **Aira Wins**
   - All squares filled with no winner → **Draw**

6. **Play Again**:
   - Click **"Play Again"** to start a new game
   - Stats are tracked throughout your session

## 📊 Understanding the Stats

```
┌─────────────────────────────────────┐
│  Wins: 2  │  Losses: 1  │  Draws: 0 │
└─────────────────────────────────────┘
```

- **Wins**: Times you got 3 in a row
- **Losses**: Times Aira got 3 in a row
- **Draws**: Times the board filled with no winner

## 💡 Tips & Tricks

### Winning Strategy

1. **Control the Center**: The middle square is most valuable
2. **Create Forks**: Set up two winning opportunities
3. **Block Aira**: If Aira has 2 in a row, block the third
4. **Corner Play**: Corners are strong positions

### Example Winning Move

```
 1 | 2 | 3
-----------
 4 | O | 6      ← You take center
-----------
 7 | 8 | 9

Next move: Take a corner (1, 3, 7, or 9)
```

## 🎨 UI Guide

### Game Board
- **Green squares**: Your moves (O)
- **Purple squares**: Aira's moves (X)
- **Gray squares**: Empty spaces (clickable)

### Aira's Message Box
- Shows at the top of the game
- Updates after each move
- Different messages for different events

### Control Buttons
- **Start Game / Play Again**: Begin or restart
- **Sound**: Toggle sound (coming soon)
- **Back to Games**: Return to games hub

## 🔄 Game Flow Example

```
1. Click "Start Game"
   ↓
2. Aira says: "Ready? Let's see if you can beat me 😄"
   ↓
3. You click a square
   ↓
4. Aira says: "Smart move! I see what you're doing there 👀"
   ↓
5. Aira makes her move (after 800ms)
   ↓
6. Repeat steps 3-5 until game ends
   ↓
7. Game ends with win/loss/draw
   ↓
8. Aira says: "You got me!" or "Gotcha!" or "A tie!"
   ↓
9. Click "Play Again" to continue
```

## ❓ FAQ

### Q: Can I play against other players?
**A**: Not yet! Currently it's single-player vs Aira. Multiplayer is coming soon.

### Q: Can I change the difficulty?
**A**: Not yet! Aira always plays optimally. Difficulty levels are coming soon.

### Q: Are my stats saved?
**A**: Stats are saved during your session. For permanent storage, we're working on Redis integration.

### Q: Why does Aira take 800ms to move?
**A**: This delay makes the game feel more natural and gives you time to see Aira's reaction.

### Q: Can I play on mobile?
**A**: Yes! The game is fully responsive and works great on phones and tablets.

### Q: What if I find a bug?
**A**: Please report it! Check the browser console for error messages and let us know.

## 🎮 Keyboard Shortcuts (Future)

Coming soon:
- `R` - Play Again
- `H` - Return to Hub
- `S` - Toggle Sound

## 🌙 Dark Mode

The games automatically adapt to your theme preference:
- Light mode: Bright, clean interface
- Dark mode: Easy on the eyes, cosmic theme

Toggle theme in the top-right corner!

## 📱 Mobile Tips

- **Tap to move**: Simply tap any square
- **Landscape mode**: Better for larger board view
- **Pinch to zoom**: If board is too small
- **Responsive layout**: Automatically adjusts to screen size

## 🎯 Next Steps

1. **Try the Game**: Play a few rounds to get the hang of it
2. **Explore Strategies**: Try different opening moves
3. **Check Back Soon**: More games coming soon!
4. **Share Feedback**: Let us know what you think!

## 🔗 Related Links

- [Full Feature Documentation](./MINI_GAMES_FEATURE.md)
- [Dashboard](https://v0-aira-web-app.vercel.app/dashboard)
- [Chat with Aira](https://v0-aira-web-app.vercel.app/chat)

---

**Enjoy playing with Aira! 💚**

