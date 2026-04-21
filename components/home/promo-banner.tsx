"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { subscribeToBanners, type Banner } from "@/lib/firebase-deals"
import { cn } from "@/lib/utils"

export function PromoBanner() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  useEffect(() => {
    const unsubscribe = subscribeToBanners((newBanners) => {
      // Filter only active banners and sort by priority
      const activeBanners = newBanners.filter((b) => b.active).sort((a, b) => (b.priority || 0) - (a.priority || 0))
      setBanners(activeBanners)
      setIsLoaded(true)
    })

    return () => unsubscribe()
  }, [])

  // Auto-slide every 3 seconds
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 3000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [banners.length, isPaused])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }, [banners.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true)
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      // Resume after a short delay
      setTimeout(() => setIsPaused(false), 1000)
      return
    }

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrevious()
    }

    // Resume auto-slide after interaction
    setTimeout(() => setIsPaused(false), 3000)
  }

  // Mouse handlers for pause on hover
  const onMouseEnter = () => setIsPaused(true)
  const onMouseLeave = () => setIsPaused(false)

  // No banners to show
  if (!isLoaded) {
    return (
      <section className="container px-4 py-6 mx-auto">
        <div className="relative w-full aspect-[21/9] md:aspect-[3/1] bg-muted rounded-xl animate-pulse" />
      </section>
    )
  }

  if (banners.length === 0) {
    return null // No active banners, show nothing
  }

  const currentBanner = banners[currentIndex]

  // Render banner content
  const BannerContent = ({ banner }: { banner: Banner }) => (
    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
      <div className="max-w-2xl">
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 text-balance">{banner.title}</h2>
        {banner.subtitle && (
          <p className="text-base md:text-lg text-white/90 mb-4 text-pretty line-clamp-2">{banner.subtitle}</p>
        )}
        {banner.linkUrl && banner.linkText && (
          <span className="inline-block px-6 py-2 bg-[#E78A00] hover:bg-[#C67500] text-white font-semibold rounded-lg transition-colors">
            {banner.linkText}
          </span>
        )}
      </div>
    </div>
  )

  return (
    <section className="container px-4 py-6 mx-auto">
      <div
        className="relative w-full aspect-[21/9] md:aspect-[3/1] rounded-xl overflow-hidden"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Banner slides */}
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner) => (
            <div key={banner.id} className="relative w-full h-full flex-shrink-0">
              {/* Background image */}
              <Image
                src={banner.imageUrl || "/placeholder.svg?height=400&width=1200"}
                alt={banner.title}
                fill
                className="object-cover"
                priority={banners.indexOf(banner) === 0}
                sizes="(max-width: 768px) 100vw, 1200px"
              />

              {/* Content overlay - clickable if link exists */}
              {banner.linkUrl ? (
                <Link href={banner.linkUrl} className="absolute inset-0">
                  <BannerContent banner={banner} />
                </Link>
              ) : (
                <BannerContent banner={banner} />
              )}
            </div>
          ))}
        </div>

        {/* Navigation arrows (only show if more than 1 banner) */}
        {banners.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault()
                goToPrevious()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors z-10"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                goToNext()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors z-10"
              aria-label="Next banner"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dot indicators (only show if more than 1 banner) */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  index === currentIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/75",
                )}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Pause indicator */}
        {isPaused && banners.length > 1 && (
          <div className="absolute top-4 right-4 px-2 py-1 bg-black/50 rounded text-white text-xs z-10">Paused</div>
        )}
      </div>
    </section>
  )
}
