"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { PLAN_LIMITS } from "@/lib/usage-limits"

interface GameLimitState {
  canPlay: boolean
  playsRemaining: number
  playsUsed: number
  dailyLimit: number
  isPremium: boolean
  isLoading: boolean
  recordPlay: () => void
  resetForNewGame: () => void
}

function getTodayKey(): string {
  const now = new Date()
  return now.toISOString().split("T")[0]
}

function getStorageKey(gameId: string): string {
  return `adhd_game_plays_${gameId}`
}

interface GamePlayData {
  date: string
  count: number
}

export function useGameLimit(gameId: string): GameLimitState {
  const { user } = useAuth()
  const [playsUsed, setPlaysUsed] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const plan = user?.plan || "free"
  const dailyLimit = PLAN_LIMITS[plan].dailyADHDGames
  const isPremium = plan === "plus" || plan === "premium"

  // Load plays from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    const storageKey = getStorageKey(gameId)
    const today = getTodayKey()

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const data: GamePlayData = JSON.parse(stored)
        // Check if it's from today
        if (data.date === today) {
          setPlaysUsed(data.count)
        } else {
          // Reset for new day
          localStorage.setItem(storageKey, JSON.stringify({ date: today, count: 0 }))
          setPlaysUsed(0)
        }
      } else {
        localStorage.setItem(storageKey, JSON.stringify({ date: today, count: 0 }))
        setPlaysUsed(0)
      }
    } catch (error) {
      console.error("[useGameLimit] Error reading localStorage:", error)
      setPlaysUsed(0)
    }

    setIsLoading(false)
  }, [gameId])

  // Record a game play
  const recordPlay = useCallback(() => {
    if (typeof window === "undefined") return
    if (isPremium) return // Don't track for premium users

    const storageKey = getStorageKey(gameId)
    const today = getTodayKey()

    try {
      const newCount = playsUsed + 1
      localStorage.setItem(storageKey, JSON.stringify({ date: today, count: newCount }))
      setPlaysUsed(newCount)
    } catch (error) {
      console.error("[useGameLimit] Error writing to localStorage:", error)
    }
  }, [gameId, playsUsed, isPremium])

  // Reset for when starting a new game (check fresh limit)
  const resetForNewGame = useCallback(() => {
    if (typeof window === "undefined") return

    const storageKey = getStorageKey(gameId)
    const today = getTodayKey()

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const data: GamePlayData = JSON.parse(stored)
        if (data.date === today) {
          setPlaysUsed(data.count)
        } else {
          localStorage.setItem(storageKey, JSON.stringify({ date: today, count: 0 }))
          setPlaysUsed(0)
        }
      }
    } catch (error) {
      console.error("[useGameLimit] Error resetting:", error)
    }
  }, [gameId])

  const canPlay = isPremium || playsUsed < dailyLimit
  const playsRemaining = isPremium ? Infinity : Math.max(0, dailyLimit - playsUsed)

  return {
    canPlay,
    playsRemaining,
    playsUsed,
    dailyLimit,
    isPremium,
    isLoading,
    recordPlay,
    resetForNewGame,
  }
}

