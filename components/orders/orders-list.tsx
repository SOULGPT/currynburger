"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase"
import type { Order } from "@/types"
import { OrderCard } from "./order-card"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function OrdersList() {
  const { user } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login?redirect=/orders")
      return
    }

    const db = getFirebaseDb()

    if (!isFirebaseConfigured() || !db) {
      const demoOrders = JSON.parse(localStorage.getItem("demoOrders") || "[]")
        .filter((o: any) => o.userId === user.id)
        .map((o: any) => ({
          ...o,
          createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
          updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
          estimatedTime: o.estimatedTime ? new Date(o.estimatedTime) : undefined,
        }))
      setOrders(demoOrders)
      setLoading(false)
      return
    }

    let unsubscribe: (() => void) | undefined

    const setupListener = async () => {
      try {
        const { collection, query, where, orderBy, onSnapshot } = await import("firebase/firestore")
        const q = query(collection(db, "orders"), where("userId", "==", user.id), orderBy("createdAt", "desc"))

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const ordersData = snapshot.docs.map((doc) => {
              const data = doc.data()
              return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
                estimatedTime: data.estimatedTime?.toDate(),
              } as Order
            })
            setOrders(ordersData)
            setLoading(false)
          },
          () => {
            setLoading(false)
          },
        )
      } catch (error) {
        setLoading(false)
      }
    }

    setupListener()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [user, router])

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Loading your orders...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">No orders yet</h2>
        <p className="text-muted-foreground mb-8">Start ordering to see your order history here</p>
        <Link href="/menu">
          <Button size="lg" className="bg-[#E78A00] hover:bg-[#C67500] text-white">
            Browse Menu
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}
