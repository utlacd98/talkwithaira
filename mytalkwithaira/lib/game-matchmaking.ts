/**
 * Game Matchmaking System using Redis
 * Handles player waiting list, matching, and game session management
 */

import { redis } from "./redis"

export interface WaitingPlayer {
  userId: string
  username: string
  timestamp: number
  gameType: "noughts-crosses" | "memory"
}

export interface GameSession {
  gameId: string
  gameType: "noughts-crosses" | "memory"
  player1: {
    userId: string
    username: string
  }
  player2: {
    userId: string
    username: string
  }
  currentTurn: string // userId
  board: string[] // For noughts & crosses: ["", "", "", "", "", "", "", "", ""]
  status: "waiting" | "active" | "finished"
  winner?: string
  createdAt: number
  lastMove: number
}

const WAITING_LIST_KEY = (gameType: string) => `game:waiting:${gameType}`
const GAME_SESSION_KEY = (gameId: string) => `game:session:${gameId}`
const USER_GAME_KEY = (userId: string) => `user:game:${userId}`
const WAITING_EXPIRY = 60 // 1 minute in seconds

/**
 * Add user to waiting list for matchmaking
 */
export async function joinWaitingList(
  userId: string,
  username: string,
  gameType: "noughts-crosses" | "memory"
): Promise<{ matched: boolean; gameId?: string; opponent?: string }> {
  try {
    const waitingKey = WAITING_LIST_KEY(gameType)
    
    // Check if user is already in a game
    const existingGameId = await redis.get(USER_GAME_KEY(userId))
    if (existingGameId) {
      return { matched: true, gameId: existingGameId as string }
    }

    // Get all waiting players
    const waitingPlayers = await redis.zrange(waitingKey, 0, -1)
    
    // Find a match (first player in queue who isn't this user)
    for (const playerData of waitingPlayers) {
      const player = JSON.parse(playerData as string) as WaitingPlayer
      
      if (player.userId !== userId) {
        // Found a match! Remove both from waiting list
        await redis.zrem(waitingKey, playerData)
        
        // Create game session
        const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const session: GameSession = {
          gameId,
          gameType,
          player1: { userId: player.userId, username: player.username },
          player2: { userId, username },
          currentTurn: player.userId, // Player 1 goes first
          board: ["", "", "", "", "", "", "", "", ""],
          status: "active",
          createdAt: Date.now(),
          lastMove: Date.now(),
        }
        
        // Save game session
        await redis.set(GAME_SESSION_KEY(gameId), JSON.stringify(session), { ex: 3600 }) // 1 hour expiry
        
        // Link users to game
        await redis.set(USER_GAME_KEY(player.userId), gameId, { ex: 3600 })
        await redis.set(USER_GAME_KEY(userId), gameId, { ex: 3600 })
        
        console.log(`[Matchmaking] Matched ${userId} with ${player.userId} in game ${gameId}`)
        
        return { matched: true, gameId, opponent: player.username }
      }
    }
    
    // No match found, add to waiting list
    const waitingPlayer: WaitingPlayer = {
      userId,
      username,
      timestamp: Date.now(),
      gameType,
    }
    
    await redis.zadd(waitingKey, {
      score: Date.now(),
      member: JSON.stringify(waitingPlayer),
    })
    
    // Set expiry on waiting list entry
    await redis.expire(waitingKey, WAITING_EXPIRY)
    
    console.log(`[Matchmaking] Added ${userId} to waiting list for ${gameType}`)
    
    return { matched: false }
  } catch (error) {
    console.error("[Matchmaking] Error joining waiting list:", error)
    throw error
  }
}

/**
 * Remove user from waiting list
 */
export async function leaveWaitingList(userId: string, gameType: "noughts-crosses" | "memory"): Promise<void> {
  try {
    const waitingKey = WAITING_LIST_KEY(gameType)
    const waitingPlayers = await redis.zrange(waitingKey, 0, -1)
    
    for (const playerData of waitingPlayers) {
      const player = JSON.parse(playerData as string) as WaitingPlayer
      if (player.userId === userId) {
        await redis.zrem(waitingKey, playerData)
        console.log(`[Matchmaking] Removed ${userId} from waiting list`)
        break
      }
    }
  } catch (error) {
    console.error("[Matchmaking] Error leaving waiting list:", error)
  }
}

/**
 * Get game session by ID
 */
export async function getGameSession(gameId: string): Promise<GameSession | null> {
  try {
    const sessionData = await redis.get(GAME_SESSION_KEY(gameId))
    if (!sessionData) return null
    
    return JSON.parse(sessionData as string) as GameSession
  } catch (error) {
    console.error("[Matchmaking] Error getting game session:", error)
    return null
  }
}

/**
 * Get user's current game
 */
export async function getUserGame(userId: string): Promise<GameSession | null> {
  try {
    const gameId = await redis.get(USER_GAME_KEY(userId))
    if (!gameId) return null
    
    return await getGameSession(gameId as string)
  } catch (error) {
    console.error("[Matchmaking] Error getting user game:", error)
    return null
  }
}

/**
 * Make a move in Noughts & Crosses
 */
export async function makeMove(
  gameId: string,
  userId: string,
  position: number
): Promise<{ success: boolean; session?: GameSession; error?: string }> {
  try {
    const session = await getGameSession(gameId)
    if (!session) {
      return { success: false, error: "Game not found" }
    }
    
    // Validate it's the player's turn
    if (session.currentTurn !== userId) {
      return { success: false, error: "Not your turn" }
    }
    
    // Validate position is empty
    if (session.board[position] !== "") {
      return { success: false, error: "Position already taken" }
    }
    
    // Determine player symbol
    const symbol = session.player1.userId === userId ? "X" : "O"
    
    // Make the move
    session.board[position] = symbol
    session.lastMove = Date.now()
    
    // Check for winner
    const winner = checkWinner(session.board)
    if (winner) {
      session.status = "finished"
      session.winner = winner === "X" ? session.player1.userId : session.player2.userId
    } else if (session.board.every(cell => cell !== "")) {
      // Draw
      session.status = "finished"
      session.winner = "draw"
    } else {
      // Switch turns
      session.currentTurn = session.currentTurn === session.player1.userId 
        ? session.player2.userId 
        : session.player1.userId
    }
    
    // Save updated session
    await redis.set(GAME_SESSION_KEY(gameId), JSON.stringify(session), { ex: 3600 })
    
    return { success: true, session }
  } catch (error) {
    console.error("[Matchmaking] Error making move:", error)
    return { success: false, error: "Failed to make move" }
  }
}

/**
 * Check for winner in Noughts & Crosses
 */
function checkWinner(board: string[]): string | null {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6], // Diagonals
  ]
  
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }
  
  return null
}

/**
 * Clean up game session
 */
export async function endGame(gameId: string): Promise<void> {
  try {
    const session = await getGameSession(gameId)
    if (!session) return
    
    // Remove user-game links
    await redis.del(USER_GAME_KEY(session.player1.userId))
    await redis.del(USER_GAME_KEY(session.player2.userId))
    
    // Mark session as finished but keep for history
    session.status = "finished"
    await redis.set(GAME_SESSION_KEY(gameId), JSON.stringify(session), { ex: 300 }) // Keep for 5 minutes
    
    console.log(`[Matchmaking] Ended game ${gameId}`)
  } catch (error) {
    console.error("[Matchmaking] Error ending game:", error)
  }
}

/**
 * Clean up expired waiting list entries
 */
export async function cleanupExpiredWaiting(): Promise<void> {
  try {
    const gameTypes: Array<"noughts-crosses" | "memory"> = ["noughts-crosses", "memory"]
    const now = Date.now()
    const expiryTime = now - (WAITING_EXPIRY * 1000)
    
    for (const gameType of gameTypes) {
      const waitingKey = WAITING_LIST_KEY(gameType)
      await redis.zremrangebyscore(waitingKey, 0, expiryTime)
    }
  } catch (error) {
    console.error("[Matchmaking] Error cleaning up expired waiting:", error)
  }
}

