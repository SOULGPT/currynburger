"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { subscribeToMenuItems } from "@/lib/firebase-menu"
import type { MenuItem } from "@/types"

export function useMenuItems() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const updateCountRef = useRef(0)

  useEffect(() => {
    let mounted = true

    const unsubscribe = subscribeToMenuItems((newItems) => {
      if (!mounted) return
      updateCountRef.current++
      console.log("[v0] useMenuItems: Received update #" + updateCountRef.current + " with", newItems.length, "items")
      
      // Always update with new items if we have any
      if (newItems.length > 0) {
        setItems(newItems)
      }
      setLoading(false)
    })

    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.log("[v0] useMenuItems: Timeout - using current items")
        setLoading(false)
      }
    }, 3000)

    return () => {
      mounted = false
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  const getItemsByCategory = useCallback(
    (categoryId: string) => {
      return items.filter((item) => item.categoryId === categoryId)
    },
    [items],
  )

  const getItemById = useCallback(
    (id: string) => {
      return items.find((item) => item.id === id)
    },
    [items],
  )

  return useMemo(
    () => ({
      items,
      loading,
      error: null,
      getItemsByCategory,
      getItemById,
    }),
    [items, loading, getItemsByCategory, getItemById],
  )
}
