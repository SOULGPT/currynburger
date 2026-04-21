"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Tag, Package, Check } from "lucide-react"
import type { Deal } from "@/types"
import { format } from "@/lib/date-utils"
import { useState } from "react"
import { DealCustomizationDialog } from "./deal-customization-dialog"

interface DealCardProps {
  deal: Deal
}

export function DealCard({ deal }: DealCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const dealItems = Array.isArray(deal.items) ? deal.items : []

  const safePrice = (price: number | undefined | null) => (Number(price) || 0).toFixed(2)
  const originalPrice = Number(deal.originalPriceEur) || 0
  const currentPrice = Number(deal.priceEur) || 0

  return (
    <>
      <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-[#E78A00]/20">
        <div className="relative overflow-hidden">
          <img
            src={deal.imageUrl || "/placeholder.svg"}
            alt={deal.title}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
          <Badge className="absolute top-3 right-3 bg-[#E78A00] text-white text-sm font-bold px-3 py-1">
            <Tag className="w-3 h-3 mr-1" />
            {deal.discount}
          </Badge>
          {originalPrice > currentPrice && (
            <Badge className="absolute top-3 left-3 bg-red-600 text-white text-sm font-bold px-3 py-1">
              Save €{(originalPrice - currentPrice).toFixed(2)}
            </Badge>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-2 text-balance">{deal.title}</h3>
          <p className="text-sm text-muted-foreground mb-4 text-pretty">{deal.description}</p>

          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-[#E78A00]" />
              <span className="text-sm font-semibold">Includes:</span>
            </div>
            <div className="space-y-1.5">
              {dealItems.map((item, idx) => (
                <div key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  <span>
                    {item.quantity}× {item.name}
                    {!item.includedInPrice && item.extraPrice && item.extraPrice > 0 && (
                      <span className="text-xs ml-1 text-[#E78A00]">(+€{safePrice(item.extraPrice)})</span>
                    )}
                    {!item.required && <span className="text-xs ml-1 text-muted-foreground">(optional)</span>}
                  </span>
                </div>
              ))}
              {dealItems.length === 0 && <div className="text-xs text-muted-foreground">No items specified</div>}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {originalPrice > currentPrice && (
                <span className="text-sm text-muted-foreground line-through">€{safePrice(originalPrice)}</span>
              )}
              <span className="text-2xl font-bold text-[#E78A00]">€{safePrice(currentPrice)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Calendar className="w-4 h-4" />
            <span>Valid until {deal.validUntil && format(deal.validUntil)}</span>
          </div>

          <Button className="w-full bg-[#E78A00] hover:bg-[#C67500] text-white" onClick={() => setDialogOpen(true)}>
            Customize & Add to Cart
          </Button>
        </div>
      </Card>

      <DealCustomizationDialog deal={deal} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
