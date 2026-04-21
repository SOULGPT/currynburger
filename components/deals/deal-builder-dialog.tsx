"use client"

import { useState, useMemo } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Check, X, Minus, Plus, Utensils, MessageSquare } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import type { MenuItem } from "@/types"
import {
  FRIES_OPTIONS,
  DRINKS_OPTIONS,
  CUSTOMIZATION_OPTIONS,
  MAX_REMOVAL_DISCOUNT,
  EXTRA_FRIES_PRICE,
  EXTRA_DRINKS_PRICE,
} from "@/lib/constants"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"

interface DealBuilderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mainItem: MenuItem
  selectedExtras?: Record<string, number>
  removedItems?: string[]
}

const safePrice = (price: number | undefined | null) => (Number(price) || 0).toFixed(2)

export function DealBuilderDialog({
  open,
  onOpenChange,
  mainItem,
  selectedExtras = {},
  removedItems = [],
}: DealBuilderDialogProps) {
  const { addItem } = useCart()
  const { toast } = useToast()

  // Deal selections
  const [friesSize, setFriesSize] = useState<"small" | "medium" | "large">("medium")
  const [selectedDrink, setSelectedDrink] = useState(DRINKS_OPTIONS[0])
  const [removeFries, setRemoveFries] = useState(false)
  const [removeDrink, setRemoveDrink] = useState(false)
  const [extraFries, setExtraFries] = useState(0)
  const [extraDrinks, setExtraDrinks] = useState(0)
  const [note, setNote] = useState("")

  // Base deal price (main item + fries + drink combo discount)
  const baseDealPrice = useMemo(() => {
    return (Number(mainItem.priceEur) || 0) + 3.5
  }, [mainItem.priceEur])

  // Calculate extras from main item customization
  const mainItemExtrasTotal = useMemo(() => {
    let total = 0
    Object.entries(selectedExtras).forEach(([id, qty]) => {
      const option = CUSTOMIZATION_OPTIONS.find((opt) => opt.id === id)
      if (option) {
        total += (Number(option.priceEur) || 0) * qty
      }
    })
    return total
  }, [selectedExtras])

  // Calculate removal discount
  const removalDiscount = useMemo(() => {
    if (removeFries || removeDrink) {
      return MAX_REMOVAL_DISCOUNT
    }
    return 0
  }, [removeFries, removeDrink])

  // Calculate fries upgrade cost
  const friesUpgrade = useMemo(() => {
    if (removeFries) return 0
    const option = FRIES_OPTIONS.find((f) => f.size === friesSize)
    return Number(option?.extraPrice) || 0
  }, [friesSize, removeFries])

  // Calculate extra items cost
  const extraItemsCost = useMemo(() => {
    const extraFriesCost = extraFries * EXTRA_FRIES_PRICE
    const extraDrinksCost = extraDrinks * EXTRA_DRINKS_PRICE
    return extraFriesCost + extraDrinksCost
  }, [extraFries, extraDrinks])

  // Total deal price
  const finalPrice = useMemo(() => {
    return baseDealPrice + mainItemExtrasTotal + friesUpgrade + extraItemsCost - removalDiscount
  }, [baseDealPrice, mainItemExtrasTotal, friesUpgrade, extraItemsCost, removalDiscount])

  // Savings compared to ordering separately
  const savedAmount = useMemo(() => {
    const separatePrice = (Number(mainItem.priceEur) || 0) + mainItemExtrasTotal + 3.0 + 2.5
    return Math.max(0, separatePrice - finalPrice)
  }, [mainItem.priceEur, mainItemExtrasTotal, finalPrice])

  const handleAddDeal = () => {
    const dealItem: any = {
      id: `deal-${mainItem.id}-${Date.now()}`,
      menuItem: mainItem,
      quantity: 1,
      customizations: [],
      note: note || undefined,
      isDeal: true,
      dealId: `deal-${mainItem.id}`,
      dealTitle: `${mainItem.name} Deal`,
      dealSelections: [
        !removeFries && {
          category: "Fries",
          itemName: friesSize.charAt(0).toUpperCase() + friesSize.slice(1),
          size: friesSize,
          extraPrice: friesUpgrade,
        },
        !removeDrink && {
          category: "Drink",
          itemName: selectedDrink,
          extraPrice: 0,
        },
      ].filter(Boolean),
      removedItems: [removeFries && "Fries", removeDrink && "Drink"].filter(Boolean),
      totalPrice: finalPrice,
    }

    addItem(dealItem)
    onOpenChange(false)
    setNote("")

    toast({
      title: "Deal Added",
      description: `${mainItem.name} deal added to your cart`,
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] max-h-[85vh] rounded-t-3xl flex flex-col p-0 gap-0">
        {/* Drag handle for mobile */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-1" />

        {/* Fixed Header */}
        <SheetHeader className="px-4 pb-3 pt-2 border-b flex-shrink-0 bg-white rounded-t-3xl text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E78A00]/10 flex items-center justify-center flex-shrink-0">
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-[#E78A00]" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base sm:text-lg font-bold">Build Your Deal</SheetTitle>
              <SheetDescription className="text-xs mt-0.5 truncate">
                Customize your {mainItem.name} combo
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3">
          {/* Step 1: Main Item */}
          <Card className="border-2 border-[#E78A00]/30 bg-gradient-to-br from-[#FFF9F3] to-white">
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-[#E78A00] hover:bg-[#E78A00] text-xs px-2 py-0.5">Step 1</Badge>
                <span className="font-semibold text-sm">Your Main Item</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-white flex-shrink-0 border">
                  <img
                    src={mainItem.imageUrl || "/placeholder.svg?height=56&width=56"}
                    alt={mainItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{mainItem.name}</p>
                  <p className="text-[#E78A00] font-bold">€{safePrice(mainItem.priceEur)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Step 2: Fries */}
          <Card className={removeFries ? "opacity-50" : ""}>
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={removeFries ? "secondary" : "default"}
                    className={`${!removeFries && "bg-[#7B1E2D]"} text-xs px-2 py-0.5`}
                  >
                    Step 2
                  </Badge>
                  <span className="font-semibold text-sm">Choose Fries</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRemoveFries(!removeFries)}
                  className="h-7 px-2 text-xs"
                >
                  {removeFries ? (
                    <>
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3 mr-1" />
                      Remove
                    </>
                  )}
                </Button>
              </div>

              {!removeFries && (
                <>
                  <RadioGroup value={friesSize} onValueChange={(v) => setFriesSize(v as typeof friesSize)}>
                    <div className="grid grid-cols-3 gap-2">
                      {FRIES_OPTIONS.map((option) => (
                        <label
                          key={option.size}
                          className={`relative flex flex-col items-center p-2 border-2 rounded-lg cursor-pointer transition-all ${
                            friesSize === option.size ? "border-[#E78A00] bg-[#E78A00]/10" : "border-gray-200"
                          }`}
                        >
                          <RadioGroupItem value={option.size} className="sr-only" />
                          <p className="font-medium text-xs">
                            {option.size.charAt(0).toUpperCase() + option.size.slice(1)}
                          </p>
                          <p className={`text-xs ${option.extraPrice === 0 ? "text-green-600" : "text-[#E78A00]"}`}>
                            {option.extraPrice === 0 ? "Included" : `+€${safePrice(option.extraPrice)}`}
                          </p>
                          {friesSize === option.size && (
                            <Check className="absolute top-1 right-1 w-3 h-3 text-[#E78A00]" />
                          )}
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                  <div className="mt-2 p-2 bg-muted/50 rounded-lg flex items-center justify-between">
                    <span className="text-xs">Extra Fries (+€{EXTRA_FRIES_PRICE})</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 bg-transparent"
                        onClick={() => setExtraFries(Math.max(0, extraFries - 1))}
                        disabled={extraFries === 0}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-5 text-center text-sm font-bold">{extraFries}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 bg-transparent"
                        onClick={() => setExtraFries(extraFries + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Step 3: Drink */}
          <Card className={removeDrink ? "opacity-50" : ""}>
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={removeDrink ? "secondary" : "default"}
                    className={`${!removeDrink && "bg-[#7B1E2D]"} text-xs px-2 py-0.5`}
                  >
                    Step 3
                  </Badge>
                  <span className="font-semibold text-sm">Choose Drink</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRemoveDrink(!removeDrink)}
                  className="h-7 px-2 text-xs"
                >
                  {removeDrink ? (
                    <>
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3 mr-1" />
                      Remove
                    </>
                  )}
                </Button>
              </div>

              {!removeDrink && (
                <>
                  <RadioGroup value={selectedDrink} onValueChange={setSelectedDrink}>
                    <div className="grid grid-cols-3 gap-1.5">
                      {DRINKS_OPTIONS.map((drink) => (
                        <label
                          key={drink}
                          className={`relative flex items-center justify-center p-2 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedDrink === drink ? "border-[#E78A00] bg-[#E78A00]/10" : "border-gray-200"
                          }`}
                        >
                          <RadioGroupItem value={drink} className="sr-only" />
                          <p className="font-medium text-xs text-center leading-tight">{drink}</p>
                          {selectedDrink === drink && (
                            <Check className="absolute top-0.5 right-0.5 w-3 h-3 text-[#E78A00]" />
                          )}
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                  <div className="mt-2 p-2 bg-muted/50 rounded-lg flex items-center justify-between">
                    <span className="text-xs">Extra Drinks (+€{EXTRA_DRINKS_PRICE})</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 bg-transparent"
                        onClick={() => setExtraDrinks(Math.max(0, extraDrinks - 1))}
                        disabled={extraDrinks === 0}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-5 text-center text-sm font-bold">{extraDrinks}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 bg-transparent"
                        onClick={() => setExtraDrinks(extraDrinks + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Special Instructions */}
          <Card className="border-dashed">
            <div className="p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">Special Instructions (Optional)</span>
              </div>
              <Textarea
                placeholder="e.g., No onions, extra sauce..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="resize-none text-xs h-16"
                rows={2}
              />
            </div>
          </Card>

          {/* Summary */}
          <Card className="bg-gradient-to-br from-[#FFF9F3] to-white border-2 border-[#E78A00]/30">
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="font-bold text-sm">Deal Summary</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Main Item:</span>
                  <span className="font-medium truncate ml-2 max-w-[150px]">{mainItem.name}</span>
                </div>
                {(removeFries || removeDrink) && (
                  <div className="flex justify-between text-red-600">
                    <span>Removed:</span>
                    <span>{[removeFries && "Fries", removeDrink && "Drink"].filter(Boolean).join(", ")}</span>
                  </div>
                )}
                {removalDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-€{safePrice(removalDiscount)}</span>
                  </div>
                )}
                <Separator className="my-1.5" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm">Total:</span>
                  <div className="flex items-center gap-2">
                    {savedAmount > 0 && (
                      <Badge className="bg-green-600 text-white text-[10px] px-1.5">
                        Save €{safePrice(savedAmount)}
                      </Badge>
                    )}
                    <span className="font-bold text-xl text-[#E78A00]">€{safePrice(finalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-4 pt-3 border-t bg-white pb-8">
          <Button
            onClick={handleAddDeal}
            className="w-full bg-[#E78A00] hover:bg-[#C67500] text-white h-12 text-base font-semibold shadow-lg rounded-xl"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add Deal - €{safePrice(finalPrice)}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
