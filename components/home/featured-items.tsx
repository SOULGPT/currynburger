"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { useMenuItems } from "@/hooks/use-menu-items"
import { useCart } from "@/contexts/cart-context"
import { useState } from "react"

export function FeaturedItems() {
  const { items: allItems, loading } = useMenuItems()
  const { addItem } = useCart()
  const [addingItem, setAddingItem] = useState<string | null>(null)

  const featuredItems = allItems
    .filter((item) => item.categoryId === "featured" && item.available !== false)
    .slice(0, 4)

  const handleQuickAdd = (item: any) => {
    setAddingItem(item.id)
    addItem({
      id: item.id,
      name: item.name,
      price: item.priceEur,
      quantity: 1,
      imageUrl: item.imageUrl,
      customizations: [],
    })
    setTimeout(() => setAddingItem(null), 600)
  }

  if (loading) {
    return (
      <section className="container px-4 py-12 mx-auto">
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-muted rounded-2xl h-80" />
          ))}
        </div>
      </section>
    )
  }

  if (featuredItems.length === 0) {
    return null
  }

  return (
    <section className="container px-4 py-12 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Featured Items</h2>
          <p className="text-sm md:text-base text-muted-foreground">Our most popular dishes</p>
        </div>
        <Link href="/menu">
          <Button
            variant="outline"
            className="hidden md:flex bg-transparent border-[#E78A00]/30 hover:bg-[#E78A00]/10 hover:border-[#E78A00]"
          >
            View All Menu
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {featuredItems.map((item, index) => (
          <Card
            key={item.id}
            className="overflow-hidden group hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-[#E78A00]/30 bg-white rounded-2xl"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="relative overflow-hidden bg-[#FFF9F3]">
              <Link href={`/menu/${item.id}`}>
                <div className="aspect-[4/3] relative">
                  <img
                    src={item.imageUrl || "/placeholder.svg?height=400&width=600"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              </Link>
              <div className="absolute top-3 left-3 bg-[#7B1E2D] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                Featured
              </div>
            </div>

            <div className="p-4 md:p-5">
              <Link href={`/menu/${item.id}`}>
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 hover:text-[#E78A00] transition-colors text-balance leading-tight line-clamp-2">
                  {item.name}
                </h3>
              </Link>
              <p className="text-xs md:text-sm text-muted-foreground mb-4 text-pretty line-clamp-2 leading-relaxed">
                {item.description || "Delicious menu item"}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xl md:text-2xl font-bold text-[#E78A00]">
                  €{(Number(item.priceEur) || 0).toFixed(2)}
                </span>
                <Button
                  size="sm"
                  className="bg-[#E78A00] hover:bg-[#C67500] text-white shadow-md hover:shadow-lg transition-all"
                  onClick={() => handleQuickAdd(item)}
                  disabled={addingItem === item.id}
                >
                  {addingItem === item.id ? (
                    <span className="animate-spin">⟳</span>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center md:hidden">
        <Link href="/menu">
          <Button
            variant="outline"
            className="w-full bg-transparent border-[#E78A00]/30 hover:bg-[#E78A00]/10 hover:border-[#E78A00]"
          >
            View All Menu
          </Button>
        </Link>
      </div>
    </section>
  )
}
