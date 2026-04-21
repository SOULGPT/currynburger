"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Check, ShoppingCart, X } from "lucide-react"
import type { MenuItem } from "@/types"

interface Option {
  id: string
  name: string
  price: number
  selected: boolean
  category: string
}

interface MealCustomizationDialogProps {
  item: MenuItem | null
  open: boolean
  onClose: () => void
  onAddToCart: (item: MenuItem, customizations: any, finalPrice: number) => void
}

const defaultOptions: Omit<Option, "selected">[] = [
  // Proteins
  { id: "extra-patty", name: "Extra Patty", price: 3.00, category: "Protein" },
  { id: "bacon", name: "Bacon", price: 1.50, category: "Protein" },
  { id: "chicken", name: "Grilled Chicken", price: 2.50, category: "Protein" },
  { id: "egg", name: "Fried Egg", price: 1.00, category: "Protein" },
  // Cheese
  { id: "extra-cheese", name: "Extra Cheese", price: 1.00, category: "Cheese" },
  { id: "cheddar", name: "Cheddar", price: 0.80, category: "Cheese" },
  { id: "mozzarella", name: "Mozzarella", price: 0.80, category: "Cheese" },
  { id: "gorgonzola", name: "Gorgonzola", price: 1.20, category: "Cheese" },
  // Veggies
  { id: "extra-lettuce", name: "Extra Lettuce", price: 0, category: "Veggies" },
  { id: "extra-tomato", name: "Extra Tomato", price: 0, category: "Veggies" },
  { id: "onion", name: "Onion", price: 0, category: "Veggies" },
  { id: "pickles", name: "Pickles", price: 0, category: "Veggies" },
  { id: "jalapenos", name: "Jalapenos", price: 0.50, category: "Veggies" },
  { id: "mushrooms", name: "Mushrooms", price: 0.80, category: "Veggies" },
  { id: "avocado", name: "Avocado", price: 1.50, category: "Veggies" },
  // Sauces
  { id: "bbq", name: "BBQ Sauce", price: 0.50, category: "Sauces" },
  { id: "curry", name: "Curry Sauce", price: 0.50, category: "Sauces" },
  { id: "garlic", name: "Garlic Sauce", price: 0.50, category: "Sauces" },
  { id: "mayo", name: "Extra Mayo", price: 0, category: "Sauces" },
  { id: "ketchup", name: "Extra Ketchup", price: 0, category: "Sauces" },
  { id: "mustard", name: "Mustard", price: 0, category: "Sauces" },
]

const categories = ["Protein", "Cheese", "Veggies", "Sauces"]

export function MealCustomizationDialog({ item, open, onClose, onAddToCart }: MealCustomizationDialogProps) {
  const [options, setOptions] = useState<Option[]>([])
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (open) {
      setOptions(defaultOptions.map(opt => ({ ...opt, selected: false })))
      setQuantity(1)
    }
  }, [open])

  const toggleOption = (id: string) => {
    setOptions(prev => prev.map(opt => 
      opt.id === id ? { ...opt, selected: !opt.selected } : opt
    ))
  }

  const calculateTotal = () => {
    if (!item) return 0
    const extrasTotal = options.filter(o => o.selected).reduce((sum, o) => sum + o.price, 0)
    return (item.priceEur + extrasTotal) * quantity
  }

  const handleAddToCart = () => {
    if (!item) return
    const selected = options.filter(o => o.selected)
    onAddToCart(item, { added: selected }, calculateTotal())
    onClose()
  }

  if (!item) return null

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[75vh] rounded-t-2xl p-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white rounded-t-2xl">
          <div>
            <h2 className="font-bold text-lg text-gray-900">Customize</h2>
            <p className="text-sm text-gray-500">{item.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Options */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {categories.map(category => {
            const categoryOptions = options.filter(o => o.category === category)
            return (
              <div key={category} className="mb-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {category}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {categoryOptions.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleOption(option.id)}
                      className={`
                        flex items-center gap-2 p-3 rounded-xl text-left transition-all
                        ${option.selected 
                          ? "bg-[#E78A00]/10 border-2 border-[#E78A00]" 
                          : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                        }
                      `}
                    >
                      <div className={`
                        w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                        ${option.selected 
                          ? "bg-[#E78A00]" 
                          : "border-2 border-gray-300"
                        }
                      `}>
                        {option.selected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{option.name}</p>
                        {option.price > 0 && (
                          <p className="text-xs text-[#E78A00] font-semibold">+€{option.price.toFixed(2)}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="border-t bg-white px-4 py-4 pb-8">
          <div className="flex items-center gap-4">
            {/* Quantity */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-lg">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full bg-[#E78A00] flex items-center justify-center text-white"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* Add Button */}
            <Button 
              onClick={handleAddToCart}
              className="flex-1 h-12 bg-[#E78A00] hover:bg-[#C67500] text-white text-base font-bold rounded-xl"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart - €{calculateTotal().toFixed(2)}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
