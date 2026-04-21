"use client"

import { useEffect, useState } from "react"
import type { Promotion, Deal } from "@/types"
import { PromotionCard } from "./promotion-card"
import { DealCard } from "./deal-card"
import { LoyaltyRewards } from "./loyalty-rewards"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { subscribeToDeals, subscribeToPromotions } from "@/lib/firebase-deals"

export function DealsContent() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribeDeals = subscribeToDeals((newDeals) => {
      setDeals(newDeals)
      setLoading(false)
    })

    const unsubscribePromotions = subscribeToPromotions((newPromotions) => {
      setPromotions(newPromotions)
    })

    return () => {
      unsubscribeDeals()
      unsubscribePromotions()
    }
  }, [])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="w-full h-48" />
            <div className="p-6 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <Tabs defaultValue="deals" className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
        <TabsTrigger value="deals">Deals</TabsTrigger>
        <TabsTrigger value="promotions">Promotions</TabsTrigger>
        <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
      </TabsList>

      <TabsContent value="deals" className="space-y-6">
        {deals.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No active deals at the moment</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="promotions" className="space-y-6">
        {promotions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No active promotions at the moment</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promo) => (
              <PromotionCard key={promo.id} promotion={promo} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="loyalty">
        <LoyaltyRewards />
      </TabsContent>
    </Tabs>
  )
}
