import { getFirebaseDb, isFirebaseConfigured } from "./firebase"
import type { Coupon } from "@/types"

const couponListeners: Set<(coupons: Coupon[]) => void> = new Set()
let usingLocalFallback = false

function notifyCouponListeners() {
  const coupons = getLocalCoupons()
  requestAnimationFrame(() => {
    couponListeners.forEach((callback) => {
      try {
        callback(coupons)
      } catch (error) {
        // Silently ignore listener errors
      }
    })
  })
}

function getLocalCoupons(): Coupon[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("demoCoupons")
    if (stored) return JSON.parse(stored)
  } catch {}
  return [
    {
      id: "demo-1",
      code: "SAVE10",
      discountType: "percentage",
      discountValue: 10,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      active: true,
    },
    {
      id: "demo-2",
      code: "WELCOME5",
      discountType: "fixed",
      discountValue: 5,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      active: true,
    },
  ]
}

function saveLocalCoupons(coupons: Coupon[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem("demoCoupons", JSON.stringify(coupons))
    notifyCouponListeners()
  } catch {}
}

function switchToLocalMode() {
  usingLocalFallback = true
}

export function subscribeToCoupons(callback: (coupons: Coupon[]) => void) {
  couponListeners.add(callback)
  callback(getLocalCoupons())

  if (!isFirebaseConfigured() || usingLocalFallback) {
    return () => {
      couponListeners.delete(callback)
    }
  }

  let unsubscribe: (() => void) | null = null
  ;(async () => {
    try {
      const db = await getFirebaseDb()
      if (!db) return

      const { collection, onSnapshot } = await import("firebase/firestore")
      const couponsRef = collection(db, "coupons")

      unsubscribe = onSnapshot(
        couponsRef,
        (snapshot) => {
          const coupons = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            validFrom: doc.data().validFrom?.toDate() || new Date(),
            validTo: doc.data().validTo?.toDate() || new Date(),
          })) as Coupon[]
          if (coupons.length > 0) callback(coupons)
        },
        (error: any) => {
          if (error.code === "permission-denied") switchToLocalMode()
        },
      )
    } catch {}
  })()

  return () => {
    couponListeners.delete(callback)
    if (unsubscribe) unsubscribe()
  }
}

export async function addCoupon(coupon: Omit<Coupon, "id">): Promise<string> {
  const newCoupon: Coupon = { ...coupon, id: `local-${Date.now()}` }
  const coupons = getLocalCoupons()
  coupons.push(newCoupon)
  saveLocalCoupons(coupons)

  try {
    const db = await getFirebaseDb()
    if (db && !usingLocalFallback) {
      const { collection, addDoc } = await import("firebase/firestore")
      const docRef = await addDoc(collection(db, "coupons"), coupon)
      return docRef.id
    }
  } catch (error: any) {
    if (error?.code === "permission-denied") switchToLocalMode()
  }

  return newCoupon.id
}

export async function updateCoupon(id: string, updates: Partial<Coupon>) {
  const coupons = getLocalCoupons()
  const index = coupons.findIndex((c) => c.id === id)
  if (index >= 0) {
    coupons[index] = { ...coupons[index], ...updates }
    saveLocalCoupons(coupons)
  }

  try {
    const db = await getFirebaseDb()
    if (db && !usingLocalFallback) {
      const { doc, updateDoc } = await import("firebase/firestore")
      await updateDoc(doc(db, "coupons", id), updates as any)
    }
  } catch (error: any) {
    if (error?.code === "permission-denied") switchToLocalMode()
  }
}

export async function deleteCoupon(id: string) {
  const coupons = getLocalCoupons().filter((c) => c.id !== id)
  saveLocalCoupons(coupons)

  try {
    const db = await getFirebaseDb()
    if (db && !usingLocalFallback) {
      const { doc, deleteDoc } = await import("firebase/firestore")
      await deleteDoc(doc(db, "coupons", id))
    }
  } catch (error: any) {
    if (error?.code === "permission-denied") switchToLocalMode()
  }
}

export async function validateCoupon(
  code: string,
  orderTotal: number,
  userId?: string,
): Promise<{ valid: boolean; coupon?: Coupon; discount?: number; message: string }> {
  const localCoupons = getLocalCoupons()
  const coupon = localCoupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.active)

  if (coupon) {
    // Check if user has already used this coupon (for single-use coupons)
    if (userId && coupon.usagePerCustomer === "single" && coupon.usedBy?.includes(userId)) {
      return { valid: false, message: "You have already used this coupon" }
    }
    
    // Check validity dates
    const now = new Date()
    const validFrom = new Date(coupon.validFrom)
    const validTo = new Date(coupon.validTo)
    if (now < validFrom || now > validTo) {
      return { valid: false, message: "This coupon has expired or is not yet valid" }
    }
    
    // Check minimum order amount
    if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
      return { valid: false, message: `Minimum order amount is €${coupon.minOrderAmount.toFixed(2)}` }
    }
    
    let discount = coupon.discountType === "percentage" 
      ? orderTotal * (coupon.discountValue / 100) 
      : coupon.discountValue
    
    // Apply max discount cap if set
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount
    }
    
    return { valid: true, coupon, discount, message: `Coupon applied! You saved €${discount.toFixed(2)}` }
  }

  try {
    const db = await getFirebaseDb()
    if (db && !usingLocalFallback) {
      const { collection, query, where, getDocs } = await import("firebase/firestore")
      const q = query(collection(db, "coupons"), where("code", "==", code.toUpperCase()), where("active", "==", true))
      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        const couponDoc = snapshot.docs[0]
        const fbCoupon = {
          id: couponDoc.id,
          ...couponDoc.data(),
          validFrom: couponDoc.data().validFrom?.toDate(),
          validTo: couponDoc.data().validTo?.toDate(),
        } as Coupon

        // Check if user has already used this coupon (for single-use coupons)
        if (userId && fbCoupon.usagePerCustomer === "single" && fbCoupon.usedBy?.includes(userId)) {
          return { valid: false, message: "You have already used this coupon" }
        }
        
        // Check validity dates
        const now = new Date()
        if (now < fbCoupon.validFrom || now > fbCoupon.validTo) {
          return { valid: false, message: "This coupon has expired or is not yet valid" }
        }
        
        // Check minimum order amount
        if (fbCoupon.minOrderAmount && orderTotal < fbCoupon.minOrderAmount) {
          return { valid: false, message: `Minimum order amount is €${fbCoupon.minOrderAmount.toFixed(2)}` }
        }

        let discount = fbCoupon.discountType === "percentage" 
          ? orderTotal * (fbCoupon.discountValue / 100) 
          : fbCoupon.discountValue
          
        // Apply max discount cap if set
        if (fbCoupon.maxDiscount && discount > fbCoupon.maxDiscount) {
          discount = fbCoupon.maxDiscount
        }
        
        return { valid: true, coupon: fbCoupon, discount, message: `Coupon applied! You saved €${discount.toFixed(2)}` }
      }
    }
  } catch {}

  return { valid: false, message: "Invalid coupon code" }
}

export async function incrementCouponUsage(couponId: string, userId?: string) {
  // Update local storage for demo coupons
  if (couponId.startsWith("demo-") || couponId.startsWith("local-")) {
    const coupons = getLocalCoupons()
    const couponIndex = coupons.findIndex(c => c.id === couponId)
    if (couponIndex >= 0) {
      coupons[couponIndex].usageCount = (coupons[couponIndex].usageCount || 0) + 1
      if (userId) {
        coupons[couponIndex].usedBy = [...(coupons[couponIndex].usedBy || []), userId]
      }
      saveLocalCoupons(coupons)
    }
    return
  }

  try {
    const db = await getFirebaseDb()
    if (db && !usingLocalFallback) {
      const { doc, updateDoc, increment, arrayUnion } = await import("firebase/firestore")
      const updates: any = { usageCount: increment(1) }
      
      // Add userId to usedBy array if provided
      if (userId) {
        updates.usedBy = arrayUnion(userId)
      }
      
      await updateDoc(doc(db, "coupons", couponId), updates)
    }
  } catch {}
}
