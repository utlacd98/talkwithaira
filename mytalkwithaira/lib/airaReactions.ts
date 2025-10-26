/**
 * Aira Reactions - Dialogue system for mini-games
 * Provides contextual responses based on game events
 */

export const AiraTalk = {
  start: [
    "Ready? Let's see if you can beat me 😄",
    "Let's play a round to unwind your mind a bit.",
    "I'm excited to play with you! Let's go! 🎮",
    "Time to have some fun together! Your move first.",
  ],
  move: [
    "Smart move! I see what you're doing there 👀",
    "Hmm, strategic… I like your style.",
    "Interesting choice! Let me think...",
    "Ooh, I like where your head's at! 🤔",
    "Nice placement! You're keeping me on my toes.",
  ],
  win: [
    "You got me! I'll have to train harder next time 😅",
    "Well played — I'm proud of you!",
    "Wow! You really outsmarted me there! 🎉",
    "That was impressive! You deserve this win.",
    "You're getting better at this! Great job! 💚",
  ],
  lose: [
    "Gotcha! That was a fun match 💚",
    "You almost had me — that last move was tricky.",
    "I got lucky this time! Want to play again?",
    "That was close! You're a worthy opponent.",
    "Better luck next time! You played well though.",
  ],
  draw: [
    "A tie! We're equally matched, aren't we?",
    "No losers here — just balance of minds.",
    "Great minds think alike! 🧠",
    "We're perfectly balanced! That was fun.",
    "A draw! We're more similar than I thought.",
  ],
  gameOver: [
    "Want to play again? I'm ready for round 2!",
    "That was fun! Let's go again?",
    "Rematch? I think you've got another one in you.",
    "Great game! Ready for another?",
  ],
}

/**
 * Get a random reaction from a category
 */
export function getRandomReaction(category: keyof typeof AiraTalk): string {
  const reactions = AiraTalk[category]
  return reactions[Math.floor(Math.random() * reactions.length)]
}

/**
 * Get a reaction with context
 */
export function getContextualReaction(
  event: "start" | "move" | "win" | "lose" | "draw" | "gameOver",
  context?: { moveCount?: number; difficulty?: string }
): string {
  let reaction = getRandomReaction(event)

  // Add context-aware variations
  if (event === "move" && context?.moveCount && context.moveCount > 5) {
    const advancedMoves = [
      "You're really thinking ahead now! 🧠",
      "This game is getting intense!",
      "I can see you're in the zone!",
    ]
    reaction = advancedMoves[Math.floor(Math.random() * advancedMoves.length)]
  }

  return reaction
}

