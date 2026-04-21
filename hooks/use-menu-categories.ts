"use client"

import { useState, useEffect, useRef } from "react"
import { subscribeToMenuCategories } from "@/lib/firebase-menu"
import type { MenuCategory } from "@/types"

export function useMenuCategories() {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const updateCountRef = useRef(0)

  useEffect(() => {
    let mounted = true

    const unsubscribe = subscribeToMenuCategories((newCategories) => {
      if (!mounted) return
      updateCountRef.current++
      console.log("[v0] useMenuCategories: Received update #" + updateCountRef.current + " with", newCategories.length, "categories")

      const validCategories = newCategories.filter(
        (cat) => cat.id && cat.id.trim() !== "" && cat.name && cat.name.trim() !== "",
      )
      const uniqueCategories = Array.from(new Map(validCategories.map((cat) => [cat.id, cat])).values())

      if (uniqueCategories.length > 0) {
        setCategories(uniqueCategories)
      }
      setLoading(false)
    })

    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.log("[v0] useMenuCategories: Timeout - using current categories")
        setLoading(false)
      }
    }, 3000)

    return () => {
      mounted = false
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  const getCategoryById = (id: string) => {
    return categories.find((cat) => cat.id === id)
  }

  return {
    categories,
    loading,
    getCategoryById,
  }
}
