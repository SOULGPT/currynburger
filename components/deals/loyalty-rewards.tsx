"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Star, Gift, Crown, Sparkles } from "lucide-react"
import { LOYALTY_TIERS } from "@/lib/constants"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function LoyaltyRewards() {
  const { user } = useAuth()
  const router = useRouter()

  if (!user) {
    return (
      <Card className="p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#E78A00] to-[#7B1E2D] flex items-center justify-center">
          <Star className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Join Our Loyalty Program</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Sign in to start earning points with every order and unlock exclusive rewards!
        </p>
        <Button
          size="lg"
          className="bg-[#E78A00] hover:bg-[#C67500] text-white"
          onClick={() => router.push("/auth/login?redirect=/deals")}
        >
          Sign In to Join
        </Button>
      </Card>
    )
  }

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
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="p-8 bg-gradient-to-br from-[#FFF9F3] to-[#FFF5E8] border-2 border-[#E78A00]/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: currentTier.color }}
            >
              {currentTier.name === "Classic" && <Star className="w-10 h-10 text-white" />}
              {currentTier.name === "Gold" && <Crown className="w-10 h-10 text-white" />}
              {currentTier.name === "Platinum" && <Sparkles className="w-10 h-10 text-white" />}
            </div>
            <div>
              <Badge className="mb-2" style={{ backgroundColor: currentTier.color }}>
                {currentTier.name} Member
              </Badge>
              <h2 className="text-3xl font-bold text-foreground">{currentPoints} Points</h2>
              <p className="text-sm text-muted-foreground">Keep ordering to earn more!</p>
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground mb-2">Redeem for rewards</p>
            <p className="text-2xl font-bold text-[#E78A00]">€{(currentPoints / 100).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">100 points = €1 discount</p>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">Progress to {nextTier.name}</span>
              <span className="text-sm text-muted-foreground">
                {currentPoints} / {nextTier.minPoints} points
              </span>
            </div>
            <Progress value={progressToNextTier} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {nextTier.minPoints - currentPoints} points until {nextTier.name} tier
            </p>
          </div>
        )}
      </Card>

      {/* Tier Benefits */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4">Loyalty Tiers</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {LOYALTY_TIERS.map((tier) => {
            const isCurrentTier = tier.name === currentTier.name
            const isUnlocked = currentPoints >= tier.minPoints

            return (
              <Card
                key={tier.name}
                className={`p-6 ${isCurrentTier ? "border-2 border-[#E78A00] shadow-lg" : ""} ${!isUnlocked ? "opacity-60" : ""}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: tier.color }}
                  >
                    {tier.name === "Classic" && <Star className="w-6 h-6 text-white" />}
                    {tier.name === "Gold" && <Crown className="w-6 h-6 text-white" />}
                    {tier.name === "Platinum" && <Sparkles className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{tier.name}</h4>
                    <p className="text-xs text-muted-foreground">{tier.minPoints}+ points</p>
                  </div>
                </div>

                <ul className="space-y-2">
                  {tier.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <Gift className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: tier.color }} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentTier && (
                  <Badge className="mt-4 w-full justify-center" style={{ backgroundColor: tier.color }}>
                    Current Tier
                  </Badge>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* How to Earn */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-4">How to Earn Points</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E78A00]/10 flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-[#E78A00]" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Every Order</h4>
              <p className="text-sm text-muted-foreground">Earn 1 point for every €1 spent</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E78A00]/10 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-[#E78A00]" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Birthday Bonus</h4>
              <p className="text-sm text-muted-foreground">Get 100 bonus points on your birthday</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E78A00]/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#E78A00]" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Referral Rewards</h4>
              <p className="text-sm text-muted-foreground">Earn 200 points for each friend you refer</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E78A00]/10 flex items-center justify-center flex-shrink-0">
              <Crown className="w-5 h-5 text-[#E78A00]" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Tier Multipliers</h4>
              <p className="text-sm text-muted-foreground">Gold: 1.5x points, Platinum: 2x points</p>
            </div>
          </div>
        </div>
      </Card>

      {/* CTA */}
      <Card className="p-8 text-center bg-gradient-to-r from-[#E78A00] to-[#7B1E2D]">
        <h3 className="text-2xl font-bold text-white mb-2">Ready to Earn More?</h3>
        <p className="text-white/90 mb-6">Place an order now and watch your points grow!</p>
        <Link href="/menu">
          <Button size="lg" className="bg-white text-[#E78A00] hover:bg-white/90">
            Order Now
          </Button>
        </Link>
      </Card>
    </div>
  )
}
