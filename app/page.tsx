"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { TopNav } from "@/components/top-nav"
import { FloatingCartButton } from "@/components/floating-cart-button"
import { HeroSection } from "@/components/home/hero-section"
import { QuickActions } from "@/components/home/quick-actions"
import { FeaturedItems } from "@/components/home/featured-items"
import { PromoBanner } from "@/components/home/promo-banner"

export default function HomePage() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const mode = searchParams.get("mode")
    const branchId = searchParams.get("branchId")
    const table = searchParams.get("table")

    if (mode === "dinein" && branchId && table) {
      localStorage.setItem(
        "dineInParams",
        JSON.stringify({
          mode,
          branchId,
          tableNumber: table,
        }),
      )
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background md:block">
      {/* Desktop: Normal scrolling layout */}
      <div className="hidden md:block">
        <TopNav />
        <main className="pb-8">
          <HeroSection />
          <QuickActions />
          <PromoBanner />
          <FeaturedItems />
        </main>
      </div>

      {/* Mobile: Fixed header + featured, scrollable content */}
      <div className="md:hidden flex flex-col h-screen overflow-hidden">
        {/* Fixed Header */}
        <div className="flex-shrink-0 z-40">
          <TopNav />
        </div>

        {/* Fixed Hero/Featured Section */}
        <div className="flex-shrink-0 z-30">
          <HeroSection />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain pb-20">
          <QuickActions />
          <PromoBanner />
          <FeaturedItems />
        </div>
      </div>

      <FloatingCartButton />
    </div>
  )
}
