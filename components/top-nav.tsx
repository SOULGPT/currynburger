"use client"

import Link from "next/link"
import { ShoppingCart, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function TopNav() {
  const { totalItems } = useCart()
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="md:sticky md:top-0 z-40 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-gray-200 safe-top">
      <div className="container flex items-center justify-between h-14 md:h-16 px-4 mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-select">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#E78A00] to-[#7B1E2D] flex items-center justify-center shadow-md">
            <span className="text-lg md:text-xl font-bold text-white">C&B</span>
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-gray-900">Curry&Burger</h1>
            <p className="text-xs text-gray-600">Taste the Fusion!</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-[#E78A00] transition-colors">
            Home
          </Link>
          <Link href="/menu" className="text-sm font-medium text-gray-700 hover:text-[#E78A00] transition-colors">
            Menu
          </Link>
          <Link href="/deals" className="text-sm font-medium text-gray-700 hover:text-[#E78A00] transition-colors">
            Deals
          </Link>
          <Link href="/orders" className="text-sm font-medium text-gray-700 hover:text-[#E78A00] transition-colors">
            Track Order
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="text-sm font-medium text-gray-700 hover:text-[#E78A00] transition-colors">
              Admin
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="relative tap-target hover:scale-105 active:scale-95 transition-transform"
            >
              <ShoppingCart className="w-5 h-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E78A00] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md animate-bounce-in">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Button>
          </Link>

          {mounted && !user ? (
            <Link href="/auth/login" className="hidden md:block">
              <Button className="bg-[#E78A00] hover:bg-[#C67500] text-white transition-colors">Sign In</Button>
            </Link>
          ) : mounted && user ? (
            <Link href="/profile" className="hidden md:block">
              <Button variant="outline" className="border-gray-300 bg-transparent hover:bg-gray-50 transition-colors">
                {user.name}
              </Button>
            </Link>
          ) : (
            <div className="hidden md:block w-20 h-10"></div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="tap-target">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="/"
                  className="text-lg font-medium text-gray-900 hover:text-[#E78A00] transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/menu"
                  className="text-lg font-medium text-gray-900 hover:text-[#E78A00] transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Menu
                </Link>
                <Link
                  href="/deals"
                  className="text-lg font-medium text-gray-900 hover:text-[#E78A00] transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Deals
                </Link>
                <Link
                  href="/orders"
                  className="text-lg font-medium text-gray-900 hover:text-[#E78A00] transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Track Order
                </Link>
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-lg font-medium text-gray-900 hover:text-[#E78A00] transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <div className="border-t border-gray-200 mt-4 pt-4">
                  {mounted && !user ? (
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-[#E78A00] hover:bg-[#C67500] text-white">Sign In</Button>
                    </Link>
                  ) : mounted && user ? (
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-gray-300 bg-transparent">
                        {user.name}
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
