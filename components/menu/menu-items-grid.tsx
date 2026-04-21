"use client"

import { Button } from "@/components/ui/button"
import { Plus, Settings } from "lucide-react"
import Link from "next/link"
import { useMenuItems } from "@/hooks/use-menu-items"
import { useMenuContext } from "@/contexts/menu-context"
import { useCart } from "@/contexts/cart-context"
import { useState, useMemo } from "react"
import { MealCustomizationDialog } from "./meal-customization-dialog"
import type { MenuItem } from "@/types"

export function MenuItemsGrid() {
  const { selectedCategory } = useMenuContext()
  const { addItem } = useCart()
  const { items: allItems, loading } = useMenuItems()
  const [addingItem, setAddingItem] = useState<string | null>(null)
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null)

  const items = useMemo(() => {
    const filtered = allItems.filter((item) => item.categoryId === selectedCategory && item.published !== false)
    return Array.from(new Map(filtered.map(item => [item.id, item])).values())
  }, [allItems, selectedCategory])

  const handleQuickAdd = (item: MenuItem) => {
    setAddingItem(item.id)
    addItem({
      id: item.id,
      name: item.name,
      price: item.priceEur,
      quantity: 1,
      imageUrl: item.imageUrl,
      customizations: [],
    })
    setTimeout(() => setAddingItem(null), 500)
  }

  const handleAddCustomizedToCart = (item: MenuItem, customizations: any, finalPrice: number) => {
    addItem(item, 1, customizations, finalPrice)
    setCustomizingItem(null)
  }

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No items in this category</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Image */}
            <Link href={`/menu/${item.id}`} className="block">
              <div className="aspect-[16/10] relative bg-gray-100">
                <img
                  src={item.imageUrl || "/placeholder.svg?height=200&width=320"}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {!item.available && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                      Unavailable
                    </span>
                  </div>
                )}
              </div>
            </Link>

            {/* Content */}
            <div className="p-4">
              <Link href={`/menu/${item.id}`}>
                <h3 className="font-bold text-gray-900 text-lg leading-tight hover:text-[#E78A00] transition-colors">
                  {item.name}
                </h3>
              </Link>
              
              {item.description && (
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}

              {/* Price and Actions */}
              <div className="flex items-center justify-between mt-4">
                <span className="text-xl font-bold text-[#E78A00]">
                  €{(Number(item.priceEur) || 0).toFixed(2)}
                </span>

                <div className="flex gap-2">
                  {item.customizable && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCustomizingItem(item)}
                      disabled={!item.available}
                      className="h-9 px-3 border-[#E78A00] text-[#E78A00] hover:bg-[#E78A00]/10"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleQuickAdd(item)}
                    disabled={!item.available || addingItem === item.id}
                    className="h-9 px-4 bg-[#E78A00] hover:bg-[#C67500] text-white"
                  >
                    {addingItem === item.id ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <MealCustomizationDialog
        item={customizingItem}
        open={!!customizingItem}
        onClose={() => setCustomizingItem(null)}
        onAddToCart={handleAddCustomizedToCart}
      />
    </>
  )
}
