"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import type { Deal } from "@/types"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"

interface DealCustomizationDialogProps {
  deal: Deal
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DealCustomizationDialog({ deal, open, onOpenChange }: DealCustomizationDialogProps) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [totalPrice, setTotalPrice] = useState(deal.priceEur)

  const dealItems = Array.isArray(deal.items) ? deal.items : []

  const handleOptionChange = (itemId: string, optionId: string, optionPrice: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [itemId]: optionId,
    }))

    // Recalculate total price
    let newTotal = deal.priceEur
    Object.entries({ ...selectedOptions, [itemId]: optionId }).forEach(([id, selectedOptionId]) => {
      const item = dealItems.find((i) => i.id === id)
      const option = item?.options?.find((o) => o.id === selectedOptionId)
      if (option && option.priceEur > 0) {
        newTotal += option.priceEur
      }
    })
    setTotalPrice(newTotal)
  }

  const handleAddToCart = () => {
    // Create customization details
    const customizations = dealItems.map((item) => {
      const selectedOptionId = selectedOptions[item.id]
      const selectedOption = item.options?.find((o) => o.id === selectedOptionId)
      return {
        itemName: item.name,
        selectedOption: selectedOption?.name || item.name,
      }
    })

    addItem({
      id: `deal-${deal.id}-${Date.now()}`,
      name: deal.title,
      price: totalPrice,
      quantity: 1,
      imageUrl: deal.imageUrl,
      customizations: customizations.map((c) => ({
        customizationId: c.itemName,
        customizationName: c.itemName,
        options: [{ id: "1", name: c.selectedOption, priceEur: 0 }],
      })),
    })

    toast({
      title: "Deal added to cart!",
      description: `${deal.title} has been added to your cart`,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{deal.title}</DialogTitle>
          <DialogDescription>{deal.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {dealItems.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-lg">{item.name}</h4>
                    {item.required && (
                      <Badge variant="secondary" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
              </div>

              {item.options && item.options.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Choose your option:</Label>
                  <RadioGroup
                    value={selectedOptions[item.id] || item.options[0].id}
                    onValueChange={(value) => {
                      const option = item.options?.find((o) => o.id === value)
                      handleOptionChange(item.id, value, option?.priceEur || 0)
                    }}
                  >
                    {item.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      >
                        <RadioGroupItem value={option.id} id={`${item.id}-${option.id}`} />
                        <Label
                          htmlFor={`${item.id}-${option.id}`}
                          className="flex-1 cursor-pointer flex items-center justify-between"
                        >
                          <span>{option.name}</span>
                          {option.priceEur > 0 && (
                            <span className="text-sm text-[#E78A00] font-semibold">+€{option.priceEur.toFixed(2)}</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total Price:</span>
            <div className="text-right">
              {totalPrice > deal.priceEur && (
                <div className="text-sm text-muted-foreground line-through">€{deal.priceEur.toFixed(2)}</div>
              )}
              <div className="text-2xl font-bold text-[#E78A00]">€{totalPrice.toFixed(2)}</div>
            </div>
          </div>

          <Button className="w-full bg-[#E78A00] hover:bg-[#C67500] text-white" size="lg" onClick={handleAddToCart}>
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
