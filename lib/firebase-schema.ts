import { getFirebaseDb, isFirebaseConfigured } from "./firebase"
import type { MenuItem, Order, Promotion } from "@/types"

export const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID || "curry-burger-main"

// ============================================
// MENU ITEMS - /restaurants/{restaurantId}/items/{itemId}
// ============================================

export interface FirestoreMenuItem {
  title: string
  description: string
  price: number
  imageUrl: string
  published: boolean
  categoryId: string
  orderCount: number
  createdAt: any
  updatedAt: any
}

export function subscribeToPublishedItems(callback: (items: MenuItem[]) => void) {
  const db = getFirebaseDb()
  if (!isFirebaseConfigured() || !db) {
    return () => {}
  }

  let unsubscribe: (() => void) | undefined

  import("firebase/firestore")
    .then(({ collection, query, where, orderBy, onSnapshot }) => {
      const itemsRef = collection(db, "restaurants", RESTAURANT_ID, "items")
      const q = query(itemsRef, where("published", "==", true), orderBy("title"))

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().title,
            description: doc.data().description,
            priceEur: doc.data().price,
            imageUrl: doc.data().imageUrl,
            categoryId: doc.data().categoryId,
            published: doc.data().published,
            orderCount: doc.data().orderCount || 0,
            available: doc.data().published,
          })) as MenuItem[]

          callback(items)
        },
        (error) => {
          console.error("Error subscribing to items:", error)
        },
      )
    })
    .catch(() => {})

  return () => {
    if (unsubscribe) unsubscribe()
  }
}

export function subscribeToAllItems(callback: (items: MenuItem[]) => void) {
  const db = getFirebaseDb()
  if (!isFirebaseConfigured() || !db) return () => {}

  let unsubscribe: (() => void) | undefined

  import("firebase/firestore")
    .then(({ collection, query, orderBy, onSnapshot }) => {
      const itemsRef = collection(db, "restaurants", RESTAURANT_ID, "items")
      const q = query(itemsRef, orderBy("title"))

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().title,
            description: doc.data().description,
            priceEur: doc.data().price,
            imageUrl: doc.data().imageUrl,
            categoryId: doc.data().categoryId,
            published: doc.data().published,
            orderCount: doc.data().orderCount || 0,
            available: doc.data().published,
          })) as MenuItem[]

          callback(items)
        },
        (error) => {
          console.error("Error subscribing to all items:", error)
        },
      )
    })
    .catch(() => {})

  return () => {
    if (unsubscribe) unsubscribe()
  }
}

export async function createMenuItem(item: Omit<FirestoreMenuItem, "createdAt" | "updatedAt" | "orderCount">) {
  const db = getFirebaseDb()
  if (!db) throw new Error("Firebase not configured")

  const { collection, addDoc, serverTimestamp } = await import("firebase/firestore")
  const itemsRef = collection(db, "restaurants", RESTAURANT_ID, "items")
  const docRef = await addDoc(itemsRef, {
    ...item,
    orderCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export async function updateMenuItem(itemId: string, updates: Partial<FirestoreMenuItem>) {
  const db = getFirebaseDb()
  if (!db) throw new Error("Firebase not configured")

  const { doc, updateDoc, serverTimestamp } = await import("firebase/firestore")
  const itemRef = doc(db, "restaurants", RESTAURANT_ID, "items", itemId)
  await updateDoc(itemRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteMenuItem(itemId: string) {
  const db = getFirebaseDb()
  if (!db) throw new Error("Firebase not configured")

  const { doc, deleteDoc } = await import("firebase/firestore")
  const itemRef = doc(db, "restaurants", RESTAURANT_ID, "items", itemId)
  await deleteDoc(itemRef)
}

// ============================================
// OFFERS - /restaurants/{restaurantId}/offers/{offerId}
// ============================================

export interface FirestoreOffer {
  title: string
  discountPercent: number
  startsAt: any
  endsAt: any
  active: boolean
  createdAt: any
  imageUrl?: string
  description?: string
}

export function subscribeToActiveOffers(callback: (offers: Promotion[]) => void) {
  const db = getFirebaseDb()
  if (!isFirebaseConfigured() || !db) return () => {}

  let unsubscribe: (() => void) | undefined

  import("firebase/firestore")
    .then(({ collection, query, where, orderBy, onSnapshot, Timestamp }) => {
      const offersRef = collection(db, "restaurants", RESTAURANT_ID, "offers")
      const now = Timestamp.now()
      const q = query(offersRef, where("active", "==", true), where("endsAt", ">", now), orderBy("endsAt"))

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const offers = snapshot.docs.map((doc) => ({
            id: doc.id,
            title: doc.data().title,
            description: doc.data().description || "",
            imageUrl: doc.data().imageUrl || "",
            discount: `${doc.data().discountPercent}%`,
            validUntil: doc.data().endsAt.toDate(),
            active: doc.data().active,
          })) as Promotion[]

          callback(offers)
        },
        (error) => {
          console.error("Error subscribing to offers:", error)
        },
      )
    })
    .catch(() => {})

  return () => {
    if (unsubscribe) unsubscribe()
  }
}

export async function createOffer(offer: Omit<FirestoreOffer, "createdAt">) {
  const db = getFirebaseDb()
  if (!db) throw new Error("Firebase not configured")

  const { collection, addDoc, serverTimestamp } = await import("firebase/firestore")
  const offersRef = collection(db, "restaurants", RESTAURANT_ID, "offers")
  const docRef = await addDoc(offersRef, {
    ...offer,
    createdAt: serverTimestamp(),
  })

  return docRef.id
}

// ============================================
// ORDERS - /orders/{orderId}
// ============================================

export interface FirestoreOrder {
  restaurantId: string
  userId: string
  items: Array<{
    itemId: string
    name: string
    qty: number
    price: number
  }>
  total: number
  status: string
  type: "pickup" | "delivery"
  createdAt: any
  customerContact: {
    name: string
    email: string
    phone: string
  }
  deliveryAddress?: {
    street: string
    city: string
    postalCode: string
  }
  metadata?: Record<string, any>
}

export async function createOrder(order: Omit<FirestoreOrder, "createdAt" | "restaurantId">) {
  const db = getFirebaseDb()
  if (!db) throw new Error("Firebase not configured")

  const { collection, addDoc, serverTimestamp } = await import("firebase/firestore")
  const ordersRef = collection(db, "orders")
  const docRef = await addDoc(ordersRef, {
    ...order,
    restaurantId: RESTAURANT_ID,
    createdAt: serverTimestamp(),
  })

  return docRef.id
}

export function subscribeToUserOrders(userId: string, callback: (orders: Order[]) => void) {
  const db = getFirebaseDb()
  if (!isFirebaseConfigured() || !db) return () => {}

  let unsubscribe: (() => void) | undefined

  import("firebase/firestore")
    .then(({ collection, query, where, orderBy, onSnapshot }) => {
      const ordersRef = collection(db, "orders")
      const q = query(ordersRef, where("userId", "==", userId), orderBy("createdAt", "desc"))

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const orders = snapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              userId: data.userId,
              branchId: data.restaurantId,
              items: data.items.map((item: any) => ({
                id: item.itemId,
                menuItem: {
                  id: item.itemId,
                  name: item.name,
                  priceEur: item.price,
                },
                quantity: item.qty,
                totalPrice: item.price * item.qty,
              })),
              totalEur: data.total,
              status: data.status,
              type: data.type,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.createdAt?.toDate() || new Date(),
            }
          }) as Order[]

          callback(orders)
        },
        (error) => {
          console.error("Error subscribing to user orders:", error)
        },
      )
    })
    .catch(() => {})

  return () => {
    if (unsubscribe) unsubscribe()
  }
}

export function subscribeToRestaurantOrders(callback: (orders: any[]) => void) {
  const db = getFirebaseDb()
  if (!isFirebaseConfigured() || !db) return () => {}

  let unsubscribe: (() => void) | undefined

  import("firebase/firestore")
    .then(({ collection, query, where, orderBy, limit, onSnapshot }) => {
      const ordersRef = collection(db, "orders")
      const q = query(ordersRef, where("restaurantId", "==", RESTAURANT_ID), orderBy("createdAt", "desc"), limit(50))

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const orders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
          }))

          callback(orders)
        },
        (error) => {
          console.error("Error subscribing to restaurant orders:", error)
        },
      )
    })
    .catch(() => {})

  return () => {
    if (unsubscribe) unsubscribe()
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const db = getFirebaseDb()
  if (!db) throw new Error("Firebase not configured")

  const { doc, updateDoc } = await import("firebase/firestore")
  const orderRef = doc(db, "orders", orderId)
  await updateDoc(orderRef, { status })
}

// ============================================
// ANALYTICS - /analytics/popularItems/{restaurantId}/{itemId}
// ============================================

export async function getPopularItems(limitCount = 4): Promise<MenuItem[]> {
  const db = getFirebaseDb()
  if (!isFirebaseConfigured() || !db) return []

  try {
    const { collection, query, where, orderBy, limit, getDocs } = await import("firebase/firestore")
    const itemsRef = collection(db, "restaurants", RESTAURANT_ID, "items")
    const q = query(itemsRef, where("published", "==", true), orderBy("orderCount", "desc"), limit(limitCount))

    const snapshot = await getDocs(q)
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().title,
      description: doc.data().description,
      priceEur: doc.data().price,
      imageUrl: doc.data().imageUrl,
      categoryId: doc.data().categoryId,
      published: doc.data().published,
      orderCount: doc.data().orderCount || 0,
      available: true,
    })) as MenuItem[]

    return items
  } catch (error) {
    console.error("Error fetching popular items:", error)
    return []
  }
}
