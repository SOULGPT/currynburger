"use client"

import { useEffect, useState } from "react"
import { getFirebaseDb } from "@/lib/firebase"
import type { Order } from "@/types"
import { OrderCard } from "@/components/orders/order-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface OrderHistoryProps {
  userId: string
}

export function OrderHistory({ userId }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      const db = getFirebaseDb()

      if (!db) {
        const demoOrders = JSON.parse(localStorage.getItem("demoOrders") || "[]")
          .filter((o: any) => o.userId === userId)
          .slice(0, 5)
          .map((o: any) => ({
            ...o,
            createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
            updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
          }))
        setOrders(demoOrders)
        setLoading(false)
        return
      }

      try {
        const { collection, query, where, orderBy, limit, getDocs } = await import("firebase/firestore")
        const q = query(collection(db, "orders"), where("userId", "==", userId), orderBy("createdAt", "desc"), limit(5))

        const snapshot = await getDocs(q)
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
      } catch (error) {
        // Silently handle error
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [userId])

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No orders yet</p>
        <Link href="/menu">
          <Button className="bg-[#E78A00] hover:bg-[#C67500] text-white">Start Ordering</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">Recent Orders</h2>
        <Link href="/orders">
          <Button variant="outline" className="bg-transparent">
            View All
          </Button>
        </Link>
      </div>

      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}
