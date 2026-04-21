"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Package } from "lucide-react"
import type { Order } from "@/types"
import { ORDER_STATUS_LABELS } from "@/lib/constants"
import Link from "next/link"
import { format } from "@/lib/date-utils"

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
  const items = Array.isArray(order.items) ? order.items : []

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "placed":
        return "bg-blue-500"
      case "accepted":
        return "bg-purple-500"
      case "preparing":
        return "bg-yellow-500"
      case "ready":
        return "bg-green-500"
      case "out_for_delivery":
        return "bg-[#E78A00]"
      case "delivered":
        return "bg-[#00C897]"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-foreground">Order #{order.id.slice(-8)}</h3>
            <Badge className={`${getStatusColor(order.status)} text-white`}>{ORDER_STATUS_LABELS[order.status]}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {order.createdAt && format(order.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              {order.type === "delivery" ? "Delivery" : "Pickup"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-[#E78A00]">€{(Number(order.totalEur) || 0).toFixed(2)}</p>
          </div>
          <Link href={`/orders/${order.id}`}>
            <Button className="bg-[#E78A00] hover:bg-[#C67500] text-white">Track Order</Button>
          </Link>
        </div>
      </div>

      {/* Items Preview */}
      <div className="border-t pt-4">
        <p className="text-sm text-muted-foreground mb-2">Items:</p>
        <div className="flex flex-wrap gap-2">
          {items.slice(0, 3).map((item, index) => (
            <span key={index} className="text-sm bg-muted px-3 py-1 rounded-full">
              {item.quantity}x {item.menuItem?.name || "Unknown Item"}
            </span>
          ))}
          {items.length > 3 && (
            <span className="text-sm bg-muted px-3 py-1 rounded-full">+{items.length - 3} more</span>
          )}
        </div>
      </div>
    </Card>
  )
}
