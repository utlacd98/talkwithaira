"use client"

import { Button } from "@/components/ui/button"
import { Crown, Lock, Sparkles } from "lucide-react"
import Link from "next/link"

interface GameLimitModalProps {
  gameName: string
  onClose?: () => void
}

export function GameLimitModal({ gameName, onClose }: GameLimitModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-violet-500/30 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-violet-500/20">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2">Daily Limit Reached</h2>
        
        {/* Message */}
        <p className="text-muted-foreground text-center mb-4">
          You've used your free play for <span className="text-violet-400 font-semibold">{gameName}</span> today.
        </p>

        {/* Benefits */}
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold text-violet-300">Upgrade to Premium</span>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Unlimited ADHD cognitive games</span>
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Unlimited chats with Aira</span>
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Advanced mood insights</span>
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Priority support</span>
            </li>
          </ul>
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <span className="text-3xl font-bold text-white">£2.99</span>
          <span className="text-muted-foreground">/month</span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Link href="/pricing" className="w-full">
            <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold py-3">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </Link>
          <Link href="/adhd-games" className="w-full">
            <Button variant="outline" className="w-full border-violet-500/30 py-3">
              Back to Games
            </Button>
          </Link>
          {onClose && (
            <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
              Maybe Later
            </Button>
          )}
        </div>

        {/* Come back tomorrow note */}
        <p className="text-xs text-center text-muted-foreground mt-4">
          Or come back tomorrow for another free play!
        </p>
      </div>
    </div>
  )
}

