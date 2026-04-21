import { getFirebaseDb, isFirebaseConfigured, waitForFirebase } from "./firebase"
import type { Deal, Promotion } from "@/types"

// Types for Banner
export interface Banner {
  id: string
  title: string
  subtitle?: string
  imageUrl: string
  linkUrl?: string // Optional - if not provided, banner is not clickable
  linkText?: string // Optional - button text if link is provided
  active: boolean
  priority: number
  createdAt?: Date
  updatedAt?: Date
}

// Local storage keys
const DEALS_STORAGE_KEY = "cb_deals"
const PROMOTIONS_STORAGE_KEY = "cb_promotions"
const BANNERS_STORAGE_KEY = "cb_banners"

// Listeners for real-time updates
const dealsListeners: Set<(deals: Deal[]) => void> = new Set()
const promotionsListeners: Set<(promotions: Promotion[]) => void> = new Set()
const bannersListeners: Set<(banners: Banner[]) => void> = new Set()

// Helper functions for localStorage
function getFromStorage<T>(key: string, defaultValue: T[]): T[] {
  if (typeof window === "undefined") return defaultValue
  try {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
  } catch {}
  return defaultValue
}

function saveToStorage<T>(key: string, data: T[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {}
}

// Notify all listeners
function notifyDealsListeners(deals: Deal[]) {
  dealsListeners.forEach((cb) => cb(deals))
}

function notifyPromotionsListeners(promotions: Promotion[]) {
  promotionsListeners.forEach((cb) => cb(promotions))
}

function notifyBannersListeners(banners: Banner[]) {
  bannersListeners.forEach((cb) => cb(banners))
}

// ============================================
// DEALS
// ============================================

export function subscribeToDeals(callback: (deals: Deal[]) => void) {
  dealsListeners.add(callback)

  // Return cached data immediately
  const cached = getFromStorage<Deal>(DEALS_STORAGE_KEY, mockDeals)
  callback(cached)

  if (!isFirebaseConfigured()) {
    return () => {
      dealsListeners.delete(callback)
    }
  }

  let unsubscribe: (() => void) | null = null
  ;(async () => {
    try {
      const ready = await waitForFirebase()
      if (!ready) {
        return
      }

      const db = await getFirebaseDb()
      if (!db) {
        return
      }

      const { collection, query, where, orderBy, onSnapshot } = await import("firebase/firestore")
      const q = query(collection(db, "deals"), where("active", "==", true), orderBy("priority", "desc"))

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const deals = snapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              validUntil: data.validUntil?.toDate?.() || data.validUntil,
              validFrom: data.validFrom?.toDate?.() || data.validFrom,
            } as Deal
          })

          const finalDeals = deals.length > 0 ? deals : mockDeals
          saveToStorage(DEALS_STORAGE_KEY, finalDeals)
          notifyDealsListeners(finalDeals)
        },
        (error) => {
          console.error("[v0] Deals snapshot error:", error)
          notifyDealsListeners(mockDeals)
        },
      )
    } catch (error) {
      console.error("[v0] Deals setup error:", error)
      notifyDealsListeners(mockDeals)
    }
  })()

  return () => {
    dealsListeners.delete(callback)
    if (unsubscribe) unsubscribe()
  }
}

export async function saveDeal(deal: Omit<Deal, "id"> & { id?: string }): Promise<string> {
  try {
    const method = deal.id ? "PUT" : "POST"
    const response = await fetch("/api/admin/deals", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(deal),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to save deal")
    }

    const result = await response.json()
    return result.id
  } catch (error) {
    console.error("[v0] Error saving deal:", error)
    throw error
  }
}

export async function deleteDeal(id: string) {
  try {
    const response = await fetch(`/api/admin/deals?id=${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to delete deal")
    }
  } catch (error) {
    console.error("[v0] Error deleting deal:", error)
    throw error
  }
}

// ============================================
// PROMOTIONS
// ============================================

export function subscribeToPromotions(callback: (promotions: Promotion[]) => void) {
  promotionsListeners.add(callback)

  // Return cached data immediately
  const cached = getFromStorage<Promotion>(PROMOTIONS_STORAGE_KEY, mockPromotions)
  callback(cached)

  if (!isFirebaseConfigured()) {
    return () => {
      promotionsListeners.delete(callback)
    }
  }

  let unsubscribe: (() => void) | null = null
  ;(async () => {
    try {
      const ready = await waitForFirebase()
      if (!ready) {
        return
      }

      const db = await getFirebaseDb()
      if (!db) {
        return
      }

      const { collection, query, where, orderBy, onSnapshot } = await import("firebase/firestore")
      const q = query(collection(db, "promotions"), where("active", "==", true), orderBy("priority", "desc"))

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const promotions = snapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              validUntil: data.validUntil?.toDate?.() || data.validUntil,
              validFrom: data.validFrom?.toDate?.() || data.validFrom,
            } as Promotion
          })

          const finalPromotions = promotions.length > 0 ? promotions : mockPromotions
          saveToStorage(PROMOTIONS_STORAGE_KEY, finalPromotions)
          notifyPromotionsListeners(finalPromotions)
        },
        (error) => {
          console.error("[v0] Promotions snapshot error:", error)
          notifyPromotionsListeners(mockPromotions)
        },
      )
    } catch (error) {
      console.error("[v0] Promotions setup error:", error)
      notifyPromotionsListeners(mockPromotions)
    }
  })()

  return () => {
    promotionsListeners.delete(callback)
    if (unsubscribe) unsubscribe()
  }
}

export async function savePromotion(promotion: Omit<Promotion, "id"> & { id?: string }): Promise<string> {
  try {
    const method = promotion.id ? "PUT" : "POST"
    const response = await fetch("/api/admin/promotions", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(promotion),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to save promotion")
    }

    const result = await response.json()
    return result.id
  } catch (error) {
    console.error("[v0] Error saving promotion:", error)
    throw error
  }
}

export async function deletePromotion(id: string) {
  try {
    const response = await fetch(`/api/admin/promotions?id=${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to delete promotion")
    }
  } catch (error) {
    console.error("[v0] Error deleting promotion:", error)
    throw error
  }
}

// ============================================
// BANNERS
// ============================================

export function subscribeToBanners(callback: (banners: Banner[]) => void) {
  bannersListeners.add(callback)

  // Return cached data immediately
  const cached = getFromStorage<Banner>(BANNERS_STORAGE_KEY, mockBanners)
  callback(cached)

  if (!isFirebaseConfigured()) {
    return () => {
      bannersListeners.delete(callback)
    }
  }

  let unsubscribe: (() => void) | null = null
  ;(async () => {
    try {
      const ready = await waitForFirebase()
      if (!ready) {
        return
      }

      const db = await getFirebaseDb()
      if (!db) {
        return
      }

      const { collection, query, where, orderBy, onSnapshot } = await import("firebase/firestore")
      const q = query(collection(db, "banners"), where("active", "==", true), orderBy("priority", "desc"))

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const banners = snapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              validUntil: data.validUntil?.toDate?.() || data.validUntil,
              validFrom: data.validFrom?.toDate?.() || data.validFrom,
            } as Banner
          })

          const finalBanners = banners.length > 0 ? banners : mockBanners
          saveToStorage(BANNERS_STORAGE_KEY, finalBanners)
          notifyBannersListeners(finalBanners)
        },
        (error) => {
          console.error("[v0] Banners snapshot error:", error)
          notifyBannersListeners(mockBanners)
        },
      )
    } catch (error) {
      console.error("[v0] Banners setup error:", error)
      notifyBannersListeners(mockBanners)
    }
  })()

  return () => {
    bannersListeners.delete(callback)
    if (unsubscribe) unsubscribe()
  }
}

export async function saveBanner(banner: Omit<Banner, "id"> & { id?: string }): Promise<string> {
  try {
    const method = banner.id ? "PUT" : "POST"
    const response = await fetch("/api/admin/banners", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(banner),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to save banner")
    }

    const result = await response.json()
    return result.id
  } catch (error) {
    console.error("[v0] Error saving banner:", error)
    throw error
  }
}

export async function deleteBanner(id: string) {
  try {
    const response = await fetch(`/api/admin/banners?id=${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to delete banner")
    }
  } catch (error) {
    console.error("[v0] Error deleting banner:", error)
    throw error
  }
}

// ============================================
// MOCK DATA
// ============================================

const mockDeals: Deal[] = [
  {
    id: "1",
    title: "Family Feast Deal",
    description: "Perfect for the whole family - 4 burgers, 4 drinks, and large fries",
    imageUrl: "/family-burger-meal-deal--professional-food-photogr.jpg",
    priceEur: 39.99,
    originalPriceEur: 54.99,
    discount: "Save €15",
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    active: true,
    priority: 1,
    category: "Family Deal",
    items: [
      {
        id: "burger",
        name: "Choose Your Burgers (4x)",
        category: "Burger",
        imageUrl: "/double-burger-with-curry-sauce--professional-food-.jpg",
        required: true,
        options: [
          {
            id: "double",
            name: "Doppio Hamburger",
            priceEur: 0,
            imageUrl: "/double-burger-with-curry-sauce--professional-food-.jpg",
          },
          { id: "chicken", name: "Chicken Royal", priceEur: 0, imageUrl: "/chicken-royal-burger.jpg" },
          {
            id: "tikka",
            name: "Tikka Burger",
            priceEur: 2,
            imageUrl: "/tikka-chicken-burger--professional-food-photograph.jpg",
          },
        ],
      },
      {
        id: "fries",
        name: "Large Fries",
        category: "Sides",
        imageUrl: "/crispy-french-fries.png",
        required: true,
        options: [
          { id: "regular", name: "Regular Fries", priceEur: 0, imageUrl: "/placeholder.svg" },
          { id: "wedges", name: "Potato Wedges", priceEur: 1, imageUrl: "/placeholder.svg" },
        ],
      },
      {
        id: "drinks",
        name: "Choose Your Drinks (4x)",
        category: "Beverages",
        imageUrl: "/assorted-soft-drinks.png",
        required: true,
        options: [
          { id: "coke", name: "Coca Cola", priceEur: 0, imageUrl: "/placeholder.svg" },
          { id: "sprite", name: "Sprite", priceEur: 0, imageUrl: "/placeholder.svg" },
          { id: "fanta", name: "Fanta", priceEur: 0, imageUrl: "/placeholder.svg" },
        ],
      },
    ],
  },
]

const mockPromotions: Promotion[] = [
  {
    id: "1",
    title: "Family Deal Special",
    description: "4 Burgers + 4 Drinks + Large Fries for only €39.99",
    imageUrl: "/family-burger-meal-deal--professional-food-photogr.jpg",
    discount: "Save €15",
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    active: true,
    priority: 1,
  },
  {
    id: "2",
    title: "Lunch Special",
    description: "Any burger + fries + drink for €9.99",
    imageUrl: "/double-burger-with-curry-sauce--professional-food-.jpg",
    discount: "20% OFF",
    validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    active: true,
    priority: 2,
  },
]

const mockBanners: Banner[] = [
  {
    id: "1",
    title: "Welcome to Curry & Burger",
    subtitle: "The best fusion food in town - burgers with a spicy twist!",
    imageUrl: "/family-burger-meal-deal--professional-food-photogr.jpg",
    linkUrl: "/menu",
    linkText: "View Menu",
    active: true,
    priority: 1,
  },
  {
    id: "2",
    title: "New Tikka Burger",
    subtitle: "Try our signature tikka-spiced chicken burger",
    imageUrl: "/tikka-chicken-burger--professional-food-photograph.jpg",
    linkUrl: "/menu",
    linkText: "Order Now",
    active: true,
    priority: 2,
  },
]
