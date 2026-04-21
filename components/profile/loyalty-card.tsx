"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Star, Crown, Sparkles, TrendingUp } from "lucide-react"
import type { User } from "@/types"
import { LOYALTY_TIERS } from "@/lib/constants"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface LoyaltyCardProps {
  user: User
}

export function LoyaltyCard({ user }: LoyaltyCardProps) {
  const currentPoints = user.loyaltyPoints || 0
  const currentTier =
    LOYALTY_TIERS.find((tier, index) => {
      const nextTier = LOYALTY_TIERS[index + 1]
      return currentPoints >= tier.minPoints && (!nextTier || currentPoints < nextTier.minPoints)
    }) || LOYALTY_TIERS[0]

  const nextTier = LOYALTY_TIERS[LOYALTY_TIERS.indexOf(currentTier) + 1]
  const progressToNextTier = nextTier
    ? ((currentPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100

  return (
    <Card className="p-6 bg-gradient-to-br from-[#E78A00] to-[#7B1E2D] text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              {currentTier.name === "Classic" && <Star className="w-6 h-6" />}
              {currentTier.name === "Gold" && <Crown className="w-6 h-6" />}
              {currentTier.name === "Platinum" && <Sparkles className="w-6 h-6" />}
            </div>
            <div>
              <Badge className="bg-white/20 text-white border-0 mb-1">{currentTier.name} Member</Badge>
              <p className="text-sm opacity-90">Loyalty Rewards</p>
            </div>
          </div>

          <Link href="/deals">
            <Button variant="ghost" className="text-white hover:bg-white/20">
              View Rewards
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm opacity-90 mb-1">Total Points</p>
            <p className="text-4xl font-bold">{currentPoints}</p>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">Redeemable Value</p>
            <p className="text-4xl font-bold">€{(currentPoints / 100).toFixed(2)}</p>
          </div>
        </div>

        {nextTier && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm opacity-90">Progress to {nextTier.name}</span>
              <span className="text-sm font-semibold">
                {currentPoints} / {nextTier.minPoints}
              </span>
            </div>
            <Progress value={progressToNextTier} className="h-2 bg-white/20" />
            <div className="flex items-center gap-2 mt-2 text-sm opacity-90">
              <TrendingUp className="w-4 h-4" />
              <span>{nextTier.minPoints - currentPoints} points to next tier</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
