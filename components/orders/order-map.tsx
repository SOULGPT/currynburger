"use client"

import { useEffect, useState } from "react"
import type { Order } from "@/types"

interface OrderMapProps {
  order: Order
}

export function OrderMap({ order }: OrderMapProps) {
  const [courierLocation, setCourierLocation] = useState(order.courierLocation || { lat: 41.9028, lng: 12.4964 })

  // Simulate courier movement (in real app, this would come from Firebase real-time updates)
  useEffect(() => {
    const interval = setInterval(() => {
      setCourierLocation((prev) => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
      {/* Placeholder map - In production, integrate Google Maps or Mapbox */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#E78A00] flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground">Your order is on the way!</p>
          <p className="text-xs text-muted-foreground mt-1">
            Courier location: {courierLocation.lat.toFixed(4)}, {courierLocation.lng.toFixed(4)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">Estimated arrival: 15-20 minutes</p>
        </div>
      </div>

      {/* In production, replace with actual map component */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 400 400">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="400" height="400" fill="url(#grid)" />
        </svg>
      </div>
    </div>
  )
}
