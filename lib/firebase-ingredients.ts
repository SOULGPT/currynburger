import { getFirebaseDb, isFirebaseConfigured } from "./firebase"
import type { Ingredient, IngredientCategory } from "@/types"

const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID || "default"

const demoIngredients: Ingredient[] = [
  {
    id: "demo-1",
    name: "Curry Sauce",
    category: "Sauce",
    priceAdjustment: 0,
    default: true,
    optional: true,
    active: true,
  },
  {
    id: "demo-2",
    name: "BBQ Sauce",
    category: "Sauce",
    priceAdjustment: 0.5,
    default: false,
    optional: true,
    active: true,
  },
  { id: "demo-3", name: "Mayo", category: "Sauce", priceAdjustment: 0, default: true, optional: true, active: true },
  {
    id: "demo-4",
    name: "Cheddar Cheese",
    category: "Cheese",
    priceAdjustment: 1.0,
    default: true,
    optional: true,
    active: true,
  },
  {
    id: "demo-5",
    name: "Mozzarella",
    category: "Cheese",
    priceAdjustment: 1.5,
    default: false,
    optional: true,
    active: true,
  },
  {
    id: "demo-6",
    name: "Lettuce",
    category: "Veggie",
    priceAdjustment: 0,
    default: true,
    optional: true,
    active: true,
  },
  { id: "demo-7", name: "Tomato", category: "Veggie", priceAdjustment: 0, default: true, optional: true, active: true },
  { id: "demo-8", name: "Onion", category: "Veggie", priceAdjustment: 0, default: true, optional: true, active: true },
  {
    id: "demo-9",
    name: "Jalapeño",
    category: "Veggie",
    priceAdjustment: 0.5,
    default: false,
    optional: true,
    active: true,
  },
  {
    id: "demo-10",
    name: "Beef Patty",
    category: "Patty",
    priceAdjustment: 2.0,
    default: false,
    optional: true,
    active: true,
  },
  {
    id: "demo-11",
    name: "Chicken Patty",
    category: "Patty",
    priceAdjustment: 1.5,
    default: false,
    optional: true,
    active: true,
  },
]

function getLocalIngredients(): Ingredient[] {
  if (typeof window === "undefined") return demoIngredients
  try {
    const stored = localStorage.getItem("demoIngredients")
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.length > 0 ? parsed : demoIngredients
    }
  } catch {}
  return demoIngredients
}

function saveLocalIngredients(ingredients: Ingredient[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem("demoIngredients", JSON.stringify(ingredients))
  } catch {}
}

export function subscribeToIngredients(callback: (ingredients: Ingredient[]) => void) {
  callback(getLocalIngredients())

  if (!isFirebaseConfigured()) {
    return () => {}
  }

  let unsubscribe: (() => void) | null = null
  ;(async () => {
    try {
      const db = await getFirebaseDb()
      if (!db) return

      const { collection, query, where, orderBy, onSnapshot } = await import("firebase/firestore")
      const q = query(
        collection(db, "ingredients"),
        where("restaurantId", "==", RESTAURANT_ID),
        orderBy("category"),
        orderBy("name"),
      )

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const ingredients = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          })) as Ingredient[]
          if (ingredients.length > 0) callback(ingredients)
        },
        () => {},
      )
    } catch {}
  })()

  return () => {
    if (unsubscribe) unsubscribe()
  }
}

export async function getIngredientsByCategory(category: IngredientCategory): Promise<Ingredient[]> {
  return getLocalIngredients().filter((i) => i.category === category && i.active)
}

export async function getIngredientsByIds(ids: string[]): Promise<Ingredient[]> {
  if (ids.length === 0) return []
  return getLocalIngredients().filter((i) => ids.includes(i.id))
}

export async function addIngredient(ingredient: Omit<Ingredient, "id" | "createdAt" | "updatedAt" | "restaurantId">) {
  const ingredients = getLocalIngredients()
  const newIngredient: Ingredient = { ...ingredient, id: `local-${Date.now()}` }
  ingredients.push(newIngredient)
  saveLocalIngredients(ingredients)

  try {
    const db = await getFirebaseDb()
    if (db) {
      const { collection, addDoc, Timestamp } = await import("firebase/firestore")
      const now = Timestamp.now()
      return await addDoc(collection(db, "ingredients"), {
        ...ingredient,
        restaurantId: RESTAURANT_ID,
        createdAt: now,
        updatedAt: now,
      })
    }
  } catch {}

  return { id: newIngredient.id }
}

export async function updateIngredient(id: string, updates: Partial<Ingredient>) {
  const ingredients = getLocalIngredients()
  const index = ingredients.findIndex((i) => i.id === id)
  if (index >= 0) {
    ingredients[index] = { ...ingredients[index], ...updates }
    saveLocalIngredients(ingredients)
  }

  try {
    const db = await getFirebaseDb()
    if (db) {
      const { doc, updateDoc, Timestamp } = await import("firebase/firestore")
      await updateDoc(doc(db, "ingredients", id), { ...updates, updatedAt: Timestamp.now() })
    }
  } catch {}
}

export async function deleteIngredient(id: string) {
  const ingredients = getLocalIngredients().filter((i) => i.id !== id)
  saveLocalIngredients(ingredients)

  try {
    const db = await getFirebaseDb()
    if (db) {
      const { doc, deleteDoc } = await import("firebase/firestore")
      await deleteDoc(doc(db, "ingredients", id))
    }
  } catch {}
}

export async function assignIngredientsToMenuItem(menuItemId: string, ingredientIds: string[]) {
  try {
    const db = await getFirebaseDb()
    if (db) {
      const { doc, updateDoc, Timestamp } = await import("firebase/firestore")
      await updateDoc(doc(db, "menu_items", menuItemId), {
        ingredients: ingredientIds,
        customizable: ingredientIds.length > 0,
        updatedAt: Timestamp.now(),
      })
    }
  } catch {}
}

export async function getIngredientsForItem(menuItemId: string): Promise<Ingredient[]> {
  return getLocalIngredients().filter((i) => i.active)
}
