"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase"
import { Loader2, Package, CheckCircle, Clock, UtensilsCrossed, Flame, MessageSquare } from "lucide-react"
import type { Order } from "@/types"
import { formatDistanceToNow } from "@/lib/date-utils"
import { useToast } from "@/hooks/use-toast"

const SPICE_LEVEL_DISPLAY = {
  "no-spicy": { label: "No Spicy", icon: "🌱" },
  mild: { label: "Mild", icon: "🌶️" },
  regular: { label: "Regular", icon: "🌶️🌶️" },
  extra: { label: "Extra Spicy", icon: "🔥🔥🔥" },
} as const

function getLocalOrders(): Order[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("demoOrders")
    if (stored) {
      return JSON.parse(stored).map((o: any) => ({
        ...o,
        createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
        updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
      }))
    }
  } catch {}
  return []
}

function saveLocalOrders(orders: Order[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem("demoOrders", JSON.stringify(orders))
  } catch {}
}

export function OrdersManager() {
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    let unsubscribe: (() => void) | null = null

    const init = async () => {
      const localOrders = getLocalOrders()
      if (mounted && localOrders.length > 0) {
        setAllOrders(localOrders)
      }

      if (!isFirebaseConfigured()) {
        if (mounted) setLoading(false)
        return
      }

      try {
        const db = await getFirebaseDb()
        if (!db) {
          if (mounted) setLoading(false)
          return
        }

        const { collection, query, orderBy, onSnapshot } = await import("firebase/firestore")
        const ordersRef = collection(db, "orders")
        const q = query(ordersRef, orderBy("createdAt", "desc"))

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (!mounted) return
            const ordersData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate(),
              updatedAt: doc.data().updatedAt?.toDate(),
            })) as Order[]

            setAllOrders(ordersData)
            saveLocalOrders(ordersData)
            setLoading(false)
          },
          () => {
            if (mounted) setLoading(false)
          },
        )
      } catch {
        if (mounted) setLoading(false)
      }
    }

    init()
    return () => {
      mounted = false
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)

    try {
      const db = await getFirebaseDb()

      if (db) {
        const { doc, updateDoc } = await import("firebase/firestore")
        await updateDoc(doc(db, "orders", orderId), {
          status: newStatus,
          updatedAt: new Date(),
        })
      }

      const updated = allOrders.map((o) =>
        o.id === orderId ? { ...o, status: newStatus as any, updatedAt: new Date() } : o,
      )
      setAllOrders(updated)
      saveLocalOrders(updated)

      toast({ title: "Order status updated" })
    } catch (error) {
      toast({ title: "Error updating order", variant: "destructive" })
    } finally {
      setUpdating(null)
    }
  }

  const confirmPayment = async (orderId: string) => {
    setUpdating(orderId)

    try {
      const db = await getFirebaseDb()

      if (db) {
        const { doc, updateDoc } = await import("firebase/firestore")
        await updateDoc(doc(db, "orders", orderId), {
          paymentStatus: "paid",
          updatedAt: new Date(),
        })
      }

      // Update local
      const updated = allOrders.map((o) =>
        o.id === orderId ? { ...o, paymentStatus: "paid" as any, updatedAt: new Date() } : o,
      )
      setAllOrders(updated)
      saveLocalOrders(updated)

      toast({ title: "Payment confirmed" })
    } catch {
      toast({ title: "Error confirming payment", variant: "destructive" })
    } finally {
      setUpdating(null)
    }
  }

  const validOrders = allOrders.filter((o) => o.id && typeof o.status === "string")

  const deliveryOrders = validOrders.filter((o) => o.type === "delivery")
  const pickupOrders = validOrders.filter((o) => o.type === "pickup")
  const dineInOrders = validOrders.filter((o) => o.type === "dinein")

  const renderOrders = (orders: Order[]) => {
    if (orders.length === 0) {
      return (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => {
          const items = Array.isArray(order.items) ? order.items : []

          return (
            <Card key={order.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">Order #{order.id.slice(0, 8)}</span>
                      <Badge variant="outline" className="capitalize">
                        {order.type}
                      </Badge>
                      {order.type === "dinein" && order.tableNumber && (
                        <Badge variant="secondary" className="bg-[#E78A00]/10 text-[#E78A00]">
                          <UtensilsCrossed className="h-3 w-3 mr-1" />
                          Table {order.tableNumber}
                        </Badge>
                      )}
                      <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
                        {order.paymentStatus === "paid" ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Paid
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {items.length} items - €{(Number(order.totalEur) || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.createdAt && formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Select
                      value={order.status}
                      onValueChange={(value) => updateOrderStatus(order.id, value)}
                      disabled={updating === order.id}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placed">Placed</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="preparing">Preparing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        {order.type !== "dinein" && <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>}
                        <SelectItem value="delivered">{order.type === "dinein" ? "Served" : "Delivered"}</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    {order.paymentStatus === "pending" && (
                      <Button
                        onClick={() => confirmPayment(order.id)}
                        disabled={updating === order.id}
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        {updating === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Confirm Payment
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Items:</p>
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div key={idx} className="text-sm">
                        <div className="flex justify-between items-start">
                          <span className="flex-1">
                            {item.quantity}x {item.name || item.menuItem?.name || "Unknown Item"}
                            {item.spiceLevel && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs bg-orange-50 text-orange-700 border-orange-300"
                              >
                                <Flame className="w-3 h-3 mr-1" />
                                {SPICE_LEVEL_DISPLAY[item.spiceLevel]?.icon}{" "}
                                {SPICE_LEVEL_DISPLAY[item.spiceLevel]?.label}
                              </Badge>
                            )}
                          </span>
                          <span className="text-muted-foreground">
                            €{(Number(item.totalPrice || item.priceEur * item.quantity) || 0).toFixed(2)}
                          </span>
                        </div>
                        {/* Show customizations if any */}
                        {item.customizations && item.customizations.length > 0 && (
                          <div className="ml-4 mt-1 text-xs text-muted-foreground">
                            {item.customizations.map((custom, cidx) => (
                              <div key={cidx}>{custom.options?.map((opt) => opt.name).join(", ")}</div>
                            ))}
                          </div>
                        )}
                        {item.note && (
                          <div className="ml-4 mt-1 flex items-start gap-1 text-xs bg-amber-50 text-amber-800 p-2 rounded border border-amber-200">
                            <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span className="font-medium">{item.note}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.note && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-start gap-2 bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-200">
                        <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold mb-1">Order Instructions:</p>
                          <p className="text-sm">{order.note}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Live Orders</CardTitle>
          <CardDescription>Manage and update order statuses in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({validOrders.length})</TabsTrigger>
              <TabsTrigger value="delivery">Delivery ({deliveryOrders.length})</TabsTrigger>
              <TabsTrigger value="pickup">Pickup ({pickupOrders.length})</TabsTrigger>
              <TabsTrigger value="dinein">Dine-In ({dineInOrders.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              {renderOrders(validOrders)}
            </TabsContent>
            <TabsContent value="delivery" className="mt-6">
              {renderOrders(deliveryOrders)}
            </TabsContent>
            <TabsContent value="pickup" className="mt-6">
              {renderOrders(pickupOrders)}
            </TabsContent>
            <TabsContent value="dinein" className="mt-6">
              {renderOrders(dineInOrders)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
