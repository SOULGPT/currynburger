"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2, Loader2, Tag, ChevronDown, ChevronUp, Flame } from "lucide-react"
import type { CartItem } from "@/types"
import { useCart } from "@/contexts/cart-context"
import { useState, useCallback, memo } from "react"

interface CartItemCardProps {
  item: CartItem
}

const SPICE_LEVEL_DISPLAY = {
  "no-spicy": { label: "No Spicy", icon: "🌱", color: "bg-green-100 text-green-700 border-green-300" },
  mild: { label: "Mild Spicy", icon: "🌶️", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  regular: { label: "Regular Spicy", icon: "🌶️🌶️", color: "bg-orange-100 text-orange-700 border-orange-300" },
  extra: { label: "Extra Spicy", icon: "🔥🔥🔥", color: "bg-red-100 text-red-700 border-red-300" },
} as const

export const CartItemCard = memo(function CartItemCard({ item }: CartItemCardProps) {
  const { updateQuantity, removeItem } = useCart()
  const [isRemoving, setIsRemoving] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleRemove = useCallback(() => {
    setIsRemoving(true)
    setTimeout(() => {
      removeItem(item.id)
    }, 150)
  }, [item.id, removeItem])

  const handleDecrement = useCallback(() => {
    setIsUpdating(true)
    updateQuantity(item.id, item.quantity - 1)
    setTimeout(() => setIsUpdating(false), 100)
  }, [item.id, item.quantity, updateQuantity])

  const handleIncrement = useCallback(() => {
    setIsUpdating(true)
    updateQuantity(item.id, item.quantity + 1)
    setTimeout(() => setIsUpdating(false), 100)
  }, [item.id, item.quantity, updateQuantity])

  const isDeal = item.isDeal || item.menuItem?.name?.includes("Deal")
  const spiceLevelInfo = item.spiceLevel ? SPICE_LEVEL_DISPLAY[item.spiceLevel] : null

  return (
    <Card
      className={`p-3 md:p-4 transition-all hover:shadow-md ${
        isRemoving ? "opacity-50 scale-95 pointer-events-none" : ""
      } ${isDeal ? "border-[#E78A00]/30 bg-[#E78A00]/5" : ""}`}
    >
      <div className="flex gap-3 md:gap-4">
        {/* Image */}
        <div className="relative">
          <img
            src={item.menuItem.imageUrl || "/placeholder.svg"}
            alt={item.menuItem.name}
            className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg flex-shrink-0"
            loading="lazy"
          />
          {isDeal && (
            <Badge className="absolute -top-2 -left-2 bg-[#E78A00]">
              <Tag className="w-3 h-3 mr-1" />
              Deal
            </Badge>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2 gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground text-sm md:text-base text-balance truncate">
                {item.menuItem?.name || "Unknown item"}
              </h3>

              {spiceLevelInfo && (
                <Badge variant="outline" className={`mt-1 text-xs font-semibold ${spiceLevelInfo.color} border`}>
                  <Flame className="w-3 h-3 mr-1" />
                  {spiceLevelInfo.icon} {spiceLevelInfo.label}
                </Badge>
              )}

              {item.customizations && item.customizations.length > 0 && (
                <div className="mt-1">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-1 text-xs text-[#E78A00] hover:underline"
                  >
                    {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {showDetails ? "Hide" : "Show"} details
                  </button>

                  {showDetails && (
                    <div className="mt-2 p-2 bg-muted/50 rounded-lg text-xs space-y-1">
                      {item.customizations.map((custom, idx) => (
                        <div key={custom.customizationId || idx}>
                          <span className="font-medium">{custom.customizationName}:</span>
                          <ul className="ml-2">
                            {custom.options
                              ?.filter((opt) => opt && opt.name)
                              .map((opt, i) => (
                                <li key={i} className="flex justify-between">
                                  <span>{opt.name}</span>
                                  {opt.priceEur > 0 && (
                                    <span className="text-[#E78A00]">+€{opt.priceEur.toFixed(2)}</span>
                                  )}
                                </li>
                              ))}
                          </ul>
                        </div>
                      ))}

                      {item.removedItems && item.removedItems.length > 0 && (
                        <div className="text-red-600">
                          <span className="font-medium">Removed:</span> {item.removedItems.join(", ")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!showDetails && item.customizations && item.customizations.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {item.customizations
                    .flatMap((c) => c.options?.map((o) => o.name) || [])
                    .filter(Boolean)
                    .slice(0, 3)
                    .join(", ")}
                  {item.customizations.flatMap((c) => c.options || []).length > 3 && "..."}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              disabled={isRemoving}
              className="text-destructive hover:text-destructive h-8 w-8 flex-shrink-0"
            >
              {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 md:h-8 md:w-8 bg-transparent"
                onClick={handleDecrement}
                disabled={isUpdating}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className={`text-sm font-semibold w-6 md:w-8 text-center ${isUpdating ? "opacity-50" : ""}`}>
                {item.quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 md:h-8 md:w-8 bg-transparent"
                onClick={handleIncrement}
                disabled={isUpdating}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            <span className="text-base md:text-lg font-bold text-[#E78A00]">
              €{(Number(item.totalPrice) || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
})
