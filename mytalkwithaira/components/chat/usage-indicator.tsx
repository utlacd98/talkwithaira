"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Crown, MessageSquare } from "lucide-react"
import Link from "next/link"

interface UsageIndicatorProps {
  refreshTrigger?: number // Add a prop to trigger refresh
}

export function UsageIndicator({ refreshTrigger }: UsageIndicatorProps) {
  const { user } = useAuth()
  const [usage, setUsage] = useState<{ remaining: number; limit: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("[Usage Indicator] Effect triggered - user:", user?.id, "plan:", user?.plan, "refreshTrigger:", refreshTrigger)

    if (!user?.id || user.plan === "premium") {
      setLoading(false)
      return
    }

    const fetchUsage = async () => {
      try {
        console.log("[Usage Indicator] Fetching usage for user:", user.id)
        const response = await fetch(`/api/user/usage?userId=${user.id}`)
        const data = await response.json()

        console.log("[Usage Indicator] Usage data received:", data)

        if (data.success) {
          setUsage({
            remaining: data.remaining,
            limit: data.limit,
          })
          console.log("[Usage Indicator] Updated usage state:", data.remaining, "/", data.limit)
        }
      } catch (error) {
        console.error("[Usage Indicator] Error fetching usage:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()
  }, [user, refreshTrigger]) // Add refreshTrigger to dependencies

  // Don't show for premium users
  if (user?.plan === "premium") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
        <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
          Premium - Unlimited Chats
        </span>
      </div>
    )
  }

  // Don't show while loading
  if (loading || !usage) {
    return null
  }

  const percentage = (usage.remaining / usage.limit) * 100
  const isLow = percentage < 30

  return (
    <div className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg border ${
      isLow 
        ? "bg-orange-500/10 border-orange-500/20" 
        : "bg-primary/10 border-primary/20"
    }`}>
      <div className="flex items-center gap-2">
        <MessageSquare className={`w-4 h-4 ${isLow ? "text-orange-500" : "text-primary"}`} />
        <span className="text-sm font-medium">
          {usage.remaining} / {usage.limit} chats remaining today
        </span>
      </div>
      
      {isLow && (
        <Link 
          href="/pricing"
          className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
        >
          Upgrade
        </Link>
      )}
    </div>
  )
}

