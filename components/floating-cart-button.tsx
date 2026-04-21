"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { memo } from "react"

export const FloatingCartButton = memo(function FloatingCartButton() {
  const { totalItems, totalPrice, isReady } = useCart()

  if (!isReady || totalItems === 0) return null

  return (
    <Link href="/cart">
      <Button
        size="lg"
        className={cn(
          "fixed bottom-20 right-4 md:bottom-6 z-40",
          "bg-[#E78A00] hover:bg-[#C67500] text-white",
          "shadow-xl rounded-full px-6 py-6",
          "flex items-center gap-3",
          "animate-slide-in",
        )}
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#7B1E2D] text-white text-xs font-bold rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs font-medium opacity-90">View Cart</span>
          <span className="text-sm font-bold">€{totalPrice.toFixed(2)}</span>
        </div>
      </Button>
    </Link>
  )
})
