"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, ArrowLeft, ShoppingCart, Tag, X, Flame, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import type { MenuItem, SelectedCustomization } from "@/types"
import { CUSTOMIZATION_OPTIONS, REMOVABLE_ITEMS } from "@/lib/constants"
import { useCart } from "@/contexts/cart-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { DealBuilderDialog } from "@/components/deals/deal-builder-dialog"

interface ItemDetailsProps {
  item: MenuItem
}

const FAST_FOOD_CATEGORIES = ["burgers", "wraps", "tacos", "featured"]
const DESI_FOOD_CATEGORIES = ["indpak", "curries", "tandoori", "rice"]
const BREAD_CATEGORIES = ["naan"]

const SPICE_LEVELS = [
  { value: "no-spicy", label: "No Spicy", icon: "🌱", description: "No heat" },
  { value: "mild", label: "Mild Spicy", icon: "🌶️", description: "Light heat" },
  { value: "regular", label: "Regular Spicy", icon: "🌶️🌶️", description: "Medium heat" },
  { value: "extra", label: "Extra Spicy", icon: "🔥🔥🔥", description: "Maximum heat" },
] as const

export function ItemDetails({ item }: ItemDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>({})
  const [removedItems, setRemovedItems] = useState<string[]>([])
  const [spiceLevel, setSpiceLevel] = useState<"no-spicy" | "mild" | "regular" | "extra" | null>(null)
  const [showDealBuilder, setShowDealBuilder] = useState(false)
  const [note, setNote] = useState("")
  const { addItem } = useCart()
  const router = useRouter()
  const { toast } = useToast()

  const isFastFood = useMemo(() => {
    return FAST_FOOD_CATEGORIES.includes(item.categoryId || "")
  }, [item.categoryId])

  const isDesiFood = useMemo(() => {
    return DESI_FOOD_CATEGORIES.includes(item.categoryId || "") && !BREAD_CATEGORIES.includes(item.categoryId || "")
  }, [item.categoryId])

  const availableExtras = useMemo(() => {
    return item.customOptions?.length ? item.customOptions : CUSTOMIZATION_OPTIONS
  }, [item.customOptions])

  const removableItems = useMemo(() => {
    return (
      item.allowedRemovals?.map((id) => REMOVABLE_ITEMS.find((r) => r.id === id)).filter(Boolean) || REMOVABLE_ITEMS
    )
  }, [item.allowedRemovals])

  const handleExtraToggle = (optionId: string, increment: boolean) => {
    setSelectedExtras((prev) => {
      const current = prev[optionId] || 0
      const newValue = increment ? current + 1 : Math.max(0, current - 1)
      if (newValue === 0) {
        const { [optionId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [optionId]: newValue }
    })
  }

  const handleRemovalToggle = (itemId: string) => {
    setRemovedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const calculateTotalPrice = useMemo(() => {
    let total = item.priceEur

    if (isFastFood) {
      Object.entries(selectedExtras).forEach(([id, qty]) => {
        const option = availableExtras.find((opt) => opt.id === id)
        if (option) {
          total += option.priceEur * qty
        }
      })
    }

    return total * quantity
  }, [item.priceEur, selectedExtras, quantity, availableExtras, isFastFood])

  const extrasTotal = useMemo(() => {
    if (!isFastFood) return 0
    let total = 0
    Object.entries(selectedExtras).forEach(([id, qty]) => {
      const option = availableExtras.find((opt) => opt.id === id)
      if (option) {
        total += option.priceEur * qty
      }
    })
    return total
  }, [selectedExtras, availableExtras, isFastFood])

  const handleAddToCart = () => {
    if (isDesiFood && !spiceLevel) {
      toast({
        title: "Spice Level Required",
        description: "Please select your preferred spice level before adding to cart",
        variant: "destructive",
      })
      return
    }

    const customizations: SelectedCustomization[] = []

    if (isFastFood) {
      const extrasOptions = Object.entries(selectedExtras)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => {
          const option = availableExtras.find((opt) => opt.id === id)
          return option ? { ...option, quantity: qty } : null
        })
        .filter(Boolean)

      if (extrasOptions.length > 0) {
        customizations.push({
          customizationId: "extras",
          customizationName: "Extras",
          options: extrasOptions.map((opt) => ({
            id: opt!.id,
            name: `${opt!.name}${(opt as any).quantity > 1 ? ` x${(opt as any).quantity}` : ""}`,
            priceEur: opt!.priceEur * ((opt as any).quantity || 1),
          })),
        })
      }

      if (removedItems.length > 0) {
        customizations.push({
          customizationId: "removals",
          customizationName: "Removed",
          options: removedItems.map((id) => {
            const item = REMOVABLE_ITEMS.find((r) => r.id === id)
            return { id, name: `No ${item?.name || id}`, priceEur: 0 }
          }),
        })
      }
    }

    const cartItem: any = {
      id: `${item.id}-${Date.now()}`,
      menuItem: item,
      quantity,
      customizations,
      totalPrice: calculateTotalPrice,
    }

    if (isDesiFood && spiceLevel) {
      cartItem.spiceLevel = spiceLevel
    }

    if (note.trim()) {
      cartItem.note = note.trim()
    }

    addItem(cartItem, quantity, customizations, calculateTotalPrice)

    toast({
      title: "Added to cart!",
      description: `${quantity}x ${item.name} added to your cart`,
    })

    router.push("/menu")
  }

  const safePrice = (price: number | undefined | null) => (Number(price) || 0).toFixed(2)

  return (
    <div className="container px-4 py-6 mx-auto max-w-6xl">
      <Link href="/menu">
        <Button variant="ghost" className="mb-4 -ml-4 hover:bg-[#E78A00]/10">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-[#FFF9F3] shadow-lg">
          <div className="aspect-square">
            <img
              src={item.imageUrl || "/placeholder.svg?height=800&width=800"}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          {!item.available && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-xl px-6 py-3 bg-red-600 rounded-full">
                Currently Unavailable
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3 text-balance leading-tight">
              {item.name}
            </h1>
            {item.description && (
              <p className="text-base text-muted-foreground text-pretty leading-relaxed">{item.description}</p>
            )}
          </div>

          <div className="flex items-baseline gap-3 py-3 border-y border-border">
            <span className="text-4xl font-bold text-[#E78A00]">€{safePrice(item.priceEur)}</span>
            {item.notes && <span className="text-sm text-muted-foreground">({item.notes})</span>}
          </div>

          {item.ingredients && item.ingredients.length > 0 && (
            <Card className="p-4 bg-muted/30">
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Includes:</h3>
              <div className="flex flex-wrap gap-2">
                {item.ingredients.map((ing) => (
                  <Badge key={ing} variant="secondary" className="text-xs">
                    {ing}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {isDesiFood && (
            <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-bold text-[#7B1E2D]">
                  Select Spice Level <span className="text-red-600">*</span>
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Choose your preferred heat level</p>
              <div className="grid grid-cols-2 gap-3">
                {SPICE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setSpiceLevel(level.value)}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                      spiceLevel === level.value
                        ? "bg-gradient-to-br from-orange-100 to-red-100 border-orange-500 shadow-lg scale-105"
                        : "bg-white border-gray-200 hover:border-orange-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{level.icon}</span>
                      <span className="text-sm font-bold">{level.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{level.description}</p>
                    {spiceLevel === level.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {!spiceLevel && (
                <p className="text-xs text-red-600 font-medium mt-2 flex items-center gap-1">
                  <span>⚠️</span> Please select a spice level to continue
                </p>
              )}
            </Card>
          )}

          {isFastFood && (
            <Card className="p-4 bg-[#FFF9F3] border-2 border-[#E78A00]/20">
              <h3 className="text-lg font-bold mb-3 text-[#7B1E2D] flex items-center gap-2">
                <X className="w-5 h-5" />
                Remove Items (Free)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {removableItems.map(
                  (item) =>
                    item && (
                      <button
                        key={item.id}
                        onClick={() => handleRemovalToggle(item.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                          removedItems.includes(item.id)
                            ? "bg-red-100 border-red-300 text-red-700"
                            : "bg-white border-gray-200 hover:border-[#E78A00]"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            removedItems.includes(item.id) ? "bg-red-500 border-red-500" : "border-gray-300"
                          }`}
                        >
                          {removedItems.includes(item.id) && <X className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm font-medium">No {item.name}</span>
                      </button>
                    ),
                )}
              </div>
            </Card>
          )}

          {isFastFood && (
            <Card className="p-4 bg-[#FFF9F3] border-2 border-[#E78A00]/20">
              <h3 className="text-lg font-bold mb-3 text-[#7B1E2D] flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Extras
              </h3>
              <div className="space-y-2">
                {availableExtras.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white border hover:border-[#E78A00] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{option.name}</span>
                      {(Number(option.priceEur) || 0) > 0 && (
                        <Badge className="bg-[#E78A00]/10 text-[#E78A00] hover:bg-[#E78A00]/20">
                          +€{safePrice(option.priceEur)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => handleExtraToggle(option.id, false)}
                        disabled={!selectedExtras[option.id]}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{selectedExtras[option.id] || 0}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 hover:border-[#E78A00] hover:bg-[#E78A00]/10 bg-transparent"
                        onClick={() => handleExtraToggle(option.id, true)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {extrasTotal > 0 && (
                <div className="mt-3 pt-3 border-t flex justify-between items-center">
                  <span className="text-sm font-medium">Extras Total:</span>
                  <span className="text-lg font-bold text-[#E78A00]">+€{safePrice(extrasTotal)}</span>
                </div>
              )}
            </Card>
          )}

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <span className="text-base font-bold">Quantity:</span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10 border-2 hover:border-[#E78A00] hover:bg-[#E78A00]/10"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-xl font-bold w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10 border-2 hover:border-[#E78A00] hover:bg-[#E78A00]/10"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Card className="p-4 bg-gradient-to-r from-[#E78A00]/5 to-[#7B1E2D]/5 border-2 border-[#E78A00]/30">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Base Price:</span>
              <span>€{safePrice(item.priceEur)}</span>
            </div>
            {isFastFood && extrasTotal > 0 && (
              <div className="flex justify-between items-center mb-2 text-[#E78A00]">
                <span className="font-medium">Extras:</span>
                <span>+€{safePrice(extrasTotal)}</span>
              </div>
            )}
            {quantity > 1 && (
              <div className="flex justify-between items-center mb-2 text-muted-foreground">
                <span className="font-medium">Quantity:</span>
                <span>×{quantity}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-2xl font-bold text-[#E78A00]">€{safePrice(calculateTotalPrice)}</span>
            </div>
          </Card>

          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full bg-[#E78A00] hover:bg-[#C67500] text-white text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              onClick={handleAddToCart}
              disabled={!item.available || (isDesiFood && !spiceLevel)}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart - €{safePrice(calculateTotalPrice)}
            </Button>

            {isFastFood && (
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-[#7B1E2D] text-[#7B1E2D] hover:bg-[#7B1E2D] hover:text-white text-lg py-6 rounded-xl transition-all bg-transparent"
                onClick={() => setShowDealBuilder(true)}
                disabled={!item.available}
              >
                <Tag className="w-5 h-5 mr-2" />
                Order As Deal - Save More!
              </Button>
            )}
          </div>

          {!item.available && (
            <p className="text-center text-sm text-destructive font-bold bg-destructive/10 p-3 rounded-xl">
              This item is currently unavailable
            </p>
          )}

          <Card className="p-4 bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-[#E78A00]" />
              <h3 className="text-base font-bold text-foreground">Special Instructions (Optional)</h3>
            </div>
            <Textarea
              placeholder="Add any special requests... (e.g., No onions, Extra spicy, Call when outside)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-2">{note.length}/500 characters</p>
          </Card>
        </div>
      </div>

      {isFastFood && (
        <DealBuilderDialog
          open={showDealBuilder}
          onOpenChange={setShowDealBuilder}
          mainItem={item}
          selectedExtras={selectedExtras}
          removedItems={removedItems}
        />
      )}
    </div>
  )
}
