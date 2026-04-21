import { getFirebaseDb, waitForFirebase } from "./firebase"
import type { MenuItem, MenuCategory } from "@/types"
const menuItemListeners: Set<(items: MenuItem[]) => void> = new Set()
const categoryListeners: Set<(categories: MenuCategory[]) => void> = new Set()

let currentMenuItems: MenuItem[] = []
let currentCategories: MenuCategory[] = []
let menuUnsubscribe: (() => void) | null = null
let categoryUnsubscribe: (() => void) | null = null

let menuInitialized = false
let categoryInitialized = false
let firebaseMenuActive = false
let firebaseCategoryActive = false

function notifyMenuListeners(items: MenuItem[], isFromFirebase: boolean = false) {
  if (isFromFirebase) {
    firebaseMenuActive = true
    currentMenuItems = items
    console.log("[v0] Menu: Firebase realtime update -", items.length, "items")
  } else if (!firebaseMenuActive) {
    currentMenuItems = items
  } else {
    return
  }
  
  menuItemListeners.forEach((callback) => {
    try {
      callback(currentMenuItems)
    } catch (error) {
      console.error("[v0] Menu listener error:", error)
    }
  })
}

function notifyCategoryListeners(categories: MenuCategory[], isFromFirebase: boolean = false) {
  if (isFromFirebase) {
    firebaseCategoryActive = true
    currentCategories = categories.sort((a, b) => (a.order || 0) - (b.order || 0))
    console.log("[v0] Categories: Firebase realtime update -", categories.length, "categories")
  } else if (!firebaseCategoryActive) {
    currentCategories = categories.sort((a, b) => (a.order || 0) - (b.order || 0))
  } else {
    return
  }
  
  categoryListeners.forEach((callback) => {
    try {
      callback(currentCategories)
    } catch (error) {
      console.error("[v0] Category listener error:", error)
    }
  })
}

async function setupMenuFirebaseListener() {
  if (menuUnsubscribe) return

  // Initial fetch from API
  if (!menuInitialized) {
    menuInitialized = true
    try {
      const response = await fetch(`/api/menu/items?t=${Date.now()}`, { cache: "no-store" })
      if (response.ok) {
        const data = await response.json()
        if (data.items) {
          notifyMenuListeners(data.items)
        } else {
          notifyMenuListeners([])
        }
      } else {
        notifyMenuListeners([])
      }
    } catch (error) {
      notifyMenuListeners([])
    }
  }

  const ready = await waitForFirebase(5)
  if (!ready) return

  const db = await getFirebaseDb()
  if (!db) return

  try {
    // @ts-ignore
    const { collection, onSnapshot } = await import("firebase/firestore")
    const menuRef = collection(db, "menu_items")

    menuUnsubscribe = onSnapshot(
      menuRef,
      (snapshot: any) => {
        const items = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        })) as MenuItem[]

        // Always notify with Firebase data - this is the real-time update
        notifyMenuListeners(items, true)
      },
      (error: any) => {
        console.error("[v0] Firebase menu listener error:", error)
      },
    )
  } catch (error) {
    // Silent error handling
  }
}

async function setupCategoriesFirebaseListener() {
  if (categoryUnsubscribe) return

  if (!categoryInitialized) {
    categoryInitialized = true
    try {
      const response = await fetch(`/api/menu/categories?t=${Date.now()}`, { cache: "no-store" })
      if (response.ok) {
        const data = await response.json()
        if (data.categories) {
          notifyCategoryListeners(data.categories)
        } else {
          notifyCategoryListeners([])
        }
      } else {
        notifyCategoryListeners([])
      }
    } catch (error) {
      notifyCategoryListeners([])
    }
  }

  const ready = await waitForFirebase(5)
  if (!ready) return

  const db = await getFirebaseDb()
  if (!db) return

  try {
    // @ts-ignore
    const { collection, onSnapshot } = await import("firebase/firestore")
    const catRef = collection(db, "menu_categories")

    // Use simple collection listener without orderBy to avoid index requirements
    categoryUnsubscribe = onSnapshot(
      catRef,
      (snapshot: any) => {
        const categories = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        })) as MenuCategory[]

        // Sort client-side instead of requiring Firestore index
        const sortedCategories = categories.sort((a, b) => (a.order || 0) - (b.order || 0))

        // Always notify with Firebase data - this is the real-time update
        notifyCategoryListeners(sortedCategories, true)
      },
      (error: any) => {
        console.error("[v0] Firebase category listener error:", error)
      },
    )
  } catch (error) {
    console.error("[v0] Failed to setup category listener:", error)
  }
}

export function subscribeToMenuItems(callback: (items: MenuItem[]) => void) {
  menuItemListeners.add(callback)

  // Immediately provide data
  if (currentMenuItems.length > 0) {
    callback(currentMenuItems)
  } else {
    callback([])
  }

  setupMenuFirebaseListener()

  return () => {
    menuItemListeners.delete(callback)
  }
}

export function subscribeToMenuCategories(callback: (categories: MenuCategory[]) => void) {
  categoryListeners.add(callback)

  if (currentCategories.length > 0) {
    callback(currentCategories)
  } else {
    callback([])
  }

  setupCategoriesFirebaseListener()

  return () => {
    categoryListeners.delete(callback)
  }
}

function sanitizeForFirebase<T extends Record<string, any>>(data: T): T {
  const sanitized: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      continue
    } else if (value === null) {
      sanitized[key] = null
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((v) => (v === undefined ? null : v)).filter((v) => v !== null)
    } else if (value !== null && typeof value === "object" && !(value instanceof Date)) {
      const nested = sanitizeForFirebase(value)
      if (Object.keys(nested).length > 0) {
        sanitized[key] = nested
      }
    } else {
      sanitized[key] = value
    }
  }
  return sanitized as T
}

export async function addMenuItem(item: Omit<MenuItem, "id">): Promise<string> {
  try {
    const sanitizedItem = sanitizeForFirebase({
      name: item.name || "",
      description: item.description || "",
      priceEur: item.priceEur || 0,
      categoryId: item.categoryId || "",
      imageUrl: item.imageUrl || "/diverse-food-spread.png",
      available: item.available ?? true,
      published: item.published ?? true,
      preparationTime: item.preparationTime ?? 15,
      calories:
        item.calories !== undefined && item.calories !== null && !Number.isNaN(item.calories) ? item.calories : null,
      allergens: Array.isArray(item.allergens) ? item.allergens.filter(Boolean) : [],
      isVegetarian: item.isVegetarian ?? false,
      isVegan: item.isVegan ?? false,
      isGlutenFree: item.isGlutenFree ?? false,
      spicyLevel: item.spicyLevel ?? 0,
      orderCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const response = await fetch("/api/menu/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sanitizedItem),
    })

    if (response.ok) {
      const data = await response.json()
      return data.id
    } else {
      throw new Error("Failed to add item")
    }
  } catch (error) {
    throw error
  }
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>) {
  try {
    const sanitizedUpdates = sanitizeForFirebase({
      ...updates,
      updatedAt: new Date().toISOString(),
    })

    const response = await fetch(`/api/menu/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sanitizedUpdates),
    })

    if (!response.ok) {
      throw new Error("Failed to update item")
    }
  } catch (error) {
    throw error
  }
}

export async function deleteMenuItem(id: string) {
  try {
    const response = await fetch(`/api/menu/items/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete item")
    }
  } catch (error) {
    throw error
  }
}

export async function addCategory(category: Omit<MenuCategory, "id">): Promise<string> {
  try {
    const sanitized = sanitizeForFirebase({
      name: category.name,
      description: category.description || "",
      order: category.order ?? 0,
      published: category.published ?? true,
      createdAt: new Date().toISOString(),
    })

    const response = await fetch("/api/menu/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sanitized),
    })

    if (response.ok) {
      const data = await response.json()
      return data.id
    } else {
      throw new Error("Failed to add category")
    }
  } catch (error) {
    throw error
  }
}

export async function updateCategory(id: string, updates: Partial<MenuCategory>) {
  try {
    const sanitized = sanitizeForFirebase({
      ...updates,
      updatedAt: new Date().toISOString(),
    })

    const response = await fetch(`/api/menu/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sanitized),
    })

    if (!response.ok) {
      throw new Error("Failed to update category")
    }
  } catch (error) {
    throw error
  }
}

export async function deleteCategory(id: string) {
  try {
    const response = await fetch(`/api/menu/categories/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete category")
    }
  } catch (error) {
    throw error
  }
}

export async function incrementItemOrderCount(itemId: string) {
  // No-op
}

export async function getPopularItems(limit = 4): Promise<MenuItem[]> {
  return currentMenuItems.filter((item) => item.categoryId === "featured").slice(0, limit)
}

export async function initializeMenuData(staticItems: MenuItem[], staticCategories: MenuCategory[]) {
  // No-op
}

export function clearDeletedItemIds() {
  // No-op
}
