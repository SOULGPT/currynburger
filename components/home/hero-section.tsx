"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FFF9F3] via-[#FFF5E8] to-[#FFE8CC]">
      {/* Mobile: Compact version */}
      <div className="md:hidden px-4 py-4">
        <div className="flex gap-3 items-center">
          {/* Image - smaller on mobile */}
          <div className="relative flex-shrink-0 w-28 h-28">
            <div className="absolute inset-0 bg-gradient-to-br from-[#E78A00]/20 to-[#7B1E2D]/20 rounded-2xl blur-xl" />
            <img
              src="/delicious-fusion-burger-with-curry-sauce--professi.jpg"
              alt="Curry&Burger Hero"
              className="relative z-10 w-full h-full object-cover rounded-2xl shadow-lg"
            />
          </div>

          {/* Text Content - compact */}
          <div className="flex-1 min-w-0">
            <div className="inline-block px-2 py-1 bg-[#E78A00]/10 rounded-full mb-1">
              <span className="text-xs font-semibold text-[#E78A00]">🔥 New Items</span>
            </div>
            <h1 className="text-lg font-bold leading-tight text-foreground mb-1">
              <span className="text-[#E78A00]">Curry</span> & <span className="text-[#7B1E2D]">Burger</span>
            </h1>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">Experience the perfect fusion. Order now!</p>
            <Link href="/menu">
              <Button size="sm" className="bg-[#E78A00] hover:bg-[#C67500] text-white text-xs h-8 px-3">
                Order Now
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop: Full version */}
      <div className="hidden md:block container px-4 py-12 mx-auto md:py-20">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6 animate-fade-in">
            <div className="inline-block px-4 py-2 bg-[#E78A00]/10 rounded-full">
              <span className="text-sm font-semibold text-[#E78A00]">🔥 New Menu Items Available</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight text-foreground md:text-6xl text-balance">
              Taste the Fusion of <span className="text-[#E78A00]">Curry</span> &{" "}
              <span className="text-[#7B1E2D]">Burger</span>!
            </h1>

            <p className="text-lg text-muted-foreground md:text-xl text-pretty">
              Experience the perfect blend of flavors. Order now for pickup or delivery and earn loyalty points with
              every bite!
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/menu">
                <Button size="lg" className="w-full sm:w-auto bg-[#E78A00] hover:bg-[#C67500] text-white text-lg px-8">
                  Order Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/deals">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 border-2 bg-transparent">
                  View Deals
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-slide-in">
            <div className="absolute inset-0 bg-gradient-to-br from-[#E78A00]/20 to-[#7B1E2D]/20 rounded-3xl blur-3xl" />
            <img
              src="/delicious-fusion-burger-with-curry-sauce--professi.jpg"
              alt="Curry&Burger Hero"
              className="relative z-10 w-full h-auto rounded-3xl shadow-2xl"
            />

            {/* Floating Badge */}
            <div className="absolute top-4 right-4 bg-white rounded-2xl shadow-lg p-4 z-20 animate-fade-in">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-[#00C897] rounded-full flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">4.8 Rating</p>
                  <p className="text-xs text-muted-foreground">2,500+ Reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
