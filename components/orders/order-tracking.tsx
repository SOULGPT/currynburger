"use client"

import { useEffect, useState } from "react"
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase"
import type { Order } from "@/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  ChefHat,
  HandPlatter,
} from "lucide-react"
import Link from "next/link"
import { ORDER_STATUS_LABELS } from "@/lib/constants"
import { format } from "@/lib/date-utils"
import { OrderMap } from "./order-map"

interface OrderTrackingProps {
  orderId: string
}

export function OrderTracking({ orderId }: OrderTrackingProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const loadOrder = async () => {
      try {
        // Check localStorage first
        const demoOrders = JSON.parse(localStorage.getItem("demoOrders") || "[]")
        const found = demoOrders.find((o: any) => o.id === orderId)
        if (found) {
          setOrder({
            ...found,
            createdAt: found.createdAt ? new Date(found.createdAt) : new Date(),
            updatedAt: found.updatedAt ? new Date(found.updatedAt) : new Date(),
            estimatedTime: found.estimatedTime ? new Date(found.estimatedTime) : undefined,
          })
          setLoading(false)
        }

        if (!isFirebaseConfigured()) {
          if (!found) setError("Order not found")
          setLoading(false)
          return
        }

        const db = await getFirebaseDb()
        if (!db) {
          if (!found) setError("Order not found")
          setLoading(false)
          return
        }

        const { doc, onSnapshot } = await import("firebase/firestore")

        unsubscribe = onSnapshot(
          doc(db, "orders", orderId),
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data()
              setOrder({
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
                estimatedTime:
                  data.estimatedTime?.toDate?.() || (data.estimatedTime ? new Date(data.estimatedTime) : undefined),
              } as Order)
              setError(null)
            } else if (!found) {
              setError("Order not found")
            }
            setLoading(false)
          },
          () => {
            if (!found) setError("Unable to load order. Please try again.")
            setLoading(false)
          },
        )
      } catch {
        setError("Unable to load order. Please try again.")
        setLoading(false)
      }
    }

    loadOrder()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#E78A00] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <Card className="p-8 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">{error || "We couldn't find this order."}</p>
          <Link href="/orders">
            <Button className="bg-[#E78A00] hover:bg-[#D17A00]">View All Orders</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const getStatusSteps = () => {
    const baseSteps = [
      { status: "placed", label: "Order Placed", icon: Package, description: "Your order has been received" },
      {
        status: "accepted",
        label: "Order Accepted",
        icon: CheckCircle2,
        description: "Restaurant confirmed your order",
      },
      { status: "preparing", label: "Preparing", icon: ChefHat, description: "Your food is being prepared" },
      {
        status: "ready",
        label: "Ready",
        icon: HandPlatter,
        description: order.type === "delivery" ? "Ready for pickup by driver" : "Ready for pickup",
      },
    ]

    if (order.type === "delivery") {
      return [
        ...baseSteps,
        { status: "out_for_delivery", label: "Out for Delivery", icon: Truck, description: "Your order is on the way" },
        { status: "delivered", label: "Delivered", icon: CheckCircle2, description: "Order delivered successfully" },
      ]
    } else {
      return [
        ...baseSteps,
        { status: "picked_up", label: "Picked Up", icon: CheckCircle2, description: "Order collected by customer" },
      ]
    }
  }

  const statusSteps = getStatusSteps()
  const currentStepIndex = statusSteps.findIndex((step) => step.status === order.status)
  const isCancelled = order.status === "cancelled"

  const calculateSubtotal = () => {
    if (!Array.isArray(order.items)) return 0
    return order.items.reduce((sum, item) => sum + (Number(item?.totalPrice) || 0), 0)
  }

  const subtotal = calculateSubtotal()
  const deliveryFee = order.type === "delivery" ? order.deliveryFee || 2.5 : 0
  const discount = order.discount || 0

  return (
    <div className="container px-4 py-8 mx-auto max-w-4xl">
      <Link href="/orders">
        <Button variant="ghost" className="mb-6 -ml-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">Order #{order.id.slice(-8).toUpperCase()}</h1>
                <p className="text-sm text-muted-foreground">
                  {order.createdAt && format(order.createdAt, "MMMM dd, yyyy 'at' HH:mm")}
                </p>
              </div>
              <Badge
                className={`${order.status === "delivered" || order.status === "picked_up" ? "bg-[#00C897]" : isCancelled ? "bg-red-500" : order.status === "out_for_delivery" ? "bg-blue-500" : "bg-[#E78A00]"} text-white text-base px-4 py-2`}
              >
                {ORDER_STATUS_LABELS[order.status] || order.status}
              </Badge>
            </div>

            {isCancelled && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 font-medium">This order has been cancelled.</p>
                {order.cancellationReason && (
                  <p className="text-red-600 text-sm mt-1">Reason: {order.cancellationReason}</p>
                )}
              </div>
            )}

            {!isCancelled && (
              <div className="relative">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon
                  const isCompleted = index <= currentStepIndex
                  const isCurrent = index === currentStepIndex

                  return (
                    <div key={step.status} className="flex gap-4 mb-8 last:mb-0">
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCompleted ? "bg-[#E78A00]" : "bg-muted"} ${isCurrent ? "ring-4 ring-[#E78A00]/20 scale-110" : ""}`}
                        >
                          <Icon className={`w-6 h-6 ${isCompleted ? "text-white" : "text-muted-foreground"}`} />
                        </div>
                        {index < statusSteps.length - 1 && (
                          <div
                            className={`w-0.5 h-16 absolute top-12 transition-colors ${index < currentStepIndex ? "bg-[#E78A00]" : "bg-muted"}`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pt-2">
                        <h3 className={`font-semibold ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </h3>
                        <p
                          className={`text-sm mt-1 ${isCompleted ? "text-muted-foreground" : "text-muted-foreground/60"}`}
                        >
                          {step.description}
                        </p>
                        {isCurrent && order.estimatedTime && (
                          <p className="text-sm text-[#E78A00] font-medium mt-2 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Estimated: {format(order.estimatedTime, "HH:mm")}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {order.type === "delivery" && order.status === "out_for_delivery" && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#E78A00]" />
                Live Tracking
              </h2>
              <OrderMap order={order} />
            </Card>
          )}

          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Order Items</h2>
            <div className="space-y-4">
              {Array.isArray(order.items) && order.items.length > 0 ? (
                order.items.map((item, index) => {
                  if (!item) return null
                  const itemName = item.menuItem?.name || item.name || "Menu Item"
                  const itemImage = item.menuItem?.imageUrl || item.imageUrl || "/placeholder.svg"
                  const itemPrice = Number(item.totalPrice) || 0
                  const itemQty = item.quantity || 1

                  return (
                    <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                      <img
                        src={itemImage || "/placeholder.svg"}
                        alt={itemName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{itemName}</h3>
                        {Array.isArray(item.customizations) && item.customizations.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {item.customizations
                              .map((c: any) => {
                                if (!c || !Array.isArray(c.options)) return ""
                                return c.options
                                  .filter((o: any) => o && o.name)
                                  .map((o: any) => o.name)
                                  .join(", ")
                              })
                              .filter((text: string) => text)
                              .join(", ")}
                          </p>
                        )}
                        {item.specialInstructions && (
                          <p className="text-sm text-muted-foreground italic mt-1">Note: {item.specialInstructions}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">Qty: {itemQty}</p>
                      </div>
                      <span className="font-bold text-[#E78A00]">€{itemPrice.toFixed(2)}</span>
                    </div>
                  )
                })
              ) : (
                <p className="text-muted-foreground">No items found</p>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#E78A00]" />
              {order.type === "delivery" ? "Delivery Address" : "Pickup Location"}
            </h2>
            {order.type === "delivery" && order.address ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">{order.address.street}</p>
                <p className="text-sm text-muted-foreground">
                  {order.address.city}, {order.address.postalCode}
                </p>
                {order.address.instructions && (
                  <p className="text-sm text-muted-foreground italic mt-2">Note: {order.address.instructions}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Curry&Burger Main Branch</p>
                <p className="text-sm text-muted-foreground">Via Roma 123, Rome, 00100</p>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">€{subtotal.toFixed(2)}</span>
              </div>
              {order.type === "delivery" && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">€{deliveryFee.toFixed(2)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium text-[#00C897]">-€{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between">
                <span className="font-bold text-foreground">Total</span>
                <span className="text-xl font-bold text-[#E78A00]">
                  €{(order.totalEur || subtotal + deliveryFee - discount).toFixed(2)}
                </span>
              </div>
              <div className="pt-2 border-t mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium capitalize">{order.paymentMethod || "Card"}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge
                    variant={order.paymentStatus === "paid" ? "default" : "secondary"}
                    className={order.paymentStatus === "paid" ? "bg-[#00C897]" : ""}
                  >
                    {order.paymentStatus || "Pending"}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Need Help?</h2>
            <div className="space-y-3">
              <Link href="tel:+393336386399" className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Support
                </Button>
              </Link>
              <Link href="https://wa.me/3336386399" target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat with Us
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
