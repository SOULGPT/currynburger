import { getFirebaseDb, isFirebaseConfigured } from "./firebase"
import type { MealTemplate } from "@/types"

const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID || "default"

// Subscribe to meal templates with real-time updates
export function subscribeToMealTemplates(callback: (templates: MealTemplate[]) => void) {
  const db = getFirebaseDb()

  if (!isFirebaseConfigured() || !db) {
    callback([])
    return () => {}
  }

  let unsubscribe: (() => void) | undefined

  import("firebase/firestore")
    .then(({ collection, query, where, orderBy, onSnapshot }) => {
      const q = query(collection(db, "meal_templates"), where("restaurantId", "==", RESTAURANT_ID), orderBy("name"))

      unsubscribe = onSnapshot(q, (snapshot) => {
        const templates: MealTemplate[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          templates.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as MealTemplate)
        })
        callback(templates)
      })
    })
    .catch(() => {
      callback([])
    })

  return () => {
    if (unsubscribe) unsubscribe()
  }
}

// Add new meal template
export async function addMealTemplate(template: Omit<MealTemplate, "id" | "createdAt" | "updatedAt" | "restaurantId">) {
  const db = getFirebaseDb()
  if (!db) throw new Error("Firebase not configured")

  const { collection, addDoc, Timestamp } = await import("firebase/firestore")
  const now = Timestamp.now()
  const data = {
    ...template,
    restaurantId: RESTAURANT_ID,
    createdAt: now,
    updatedAt: now,
  }

  // Remove undefined fields
  Object.keys(data).forEach((key) => {
    if (data[key as keyof typeof data] === undefined) {
      delete data[key as keyof typeof data]
    }
  })

  return await addDoc(collection(db, "meal_templates"), data)
}

// Update meal template
export async function updateMealTemplate(id: string, updates: Partial<MealTemplate>) {
  const db = getFirebaseDb()
  if (!db) throw new Error("Firebase not configured")

  const { doc, updateDoc, Timestamp } = await import("firebase/firestore")
  const templateRef = doc(db, "meal_templates", id)
  const data = {
    ...updates,
    updatedAt: Timestamp.now(),
  }

  // Remove undefined fields
  Object.keys(data).forEach((key) => {
    if (data[key as keyof typeof data] === undefined) {
      delete data[key as keyof typeof data]
    }
  })

  return await updateDoc(templateRef, data)
}

// Delete meal template
export async function deleteMealTemplate(id: string) {
  const db = getFirebaseDb()
  if (!db) throw new Error("Firebase not configured")

  const { doc, deleteDoc } = await import("firebase/firestore")
  const templateRef = doc(db, "meal_templates", id)
  return await deleteDoc(templateRef)
}
