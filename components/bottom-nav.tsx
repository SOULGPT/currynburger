"use client"

import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Home, UtensilsCrossed, Tag, ClipboardList, ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import Link from "next/link"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/deals", label: "Deals", icon: Tag },
  { href: "/orders", label: "Track", icon: ClipboardList },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
]

export function BottomNav() {
  const pathname = usePathname()
  const { totalItems } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Hide on admin and auth pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/auth")) {
    return null
  }

  return (
    <nav 
      className="md:hidden bg-white border-t border-gray-200"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex h-14">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
          const isCart = item.href === "/cart"

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex-1 flex flex-col items-center justify-center gap-0.5
                ${isActive ? "text-[#E78A00]" : "text-gray-400"}
              `}
            >
              <div className="relative">
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {mounted && isCart && totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-[#E78A00] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? "font-semibold" : "font-normal"}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
