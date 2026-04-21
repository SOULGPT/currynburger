"use client"

import { CardDescription } from "@/components/ui/card"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, ShoppingBag, DollarSign, Clock, TrendingDown, BarChart3 } from "lucide-react"
import { useEffect, useState } from "react"
import { getFirebaseDb } from "@/lib/firebase"
import { Badge } from "@/components/ui/badge"
import type { Order } from "@/types"
import { toDate } from "@/lib/date-utils"

interface Stats {
  // Revenue
  totalRevenue: number
  todayRevenue: number
  weekRevenue: number
  monthRevenue: number

  // Orders
  totalOrders: number
  todayOrders: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number

  // Customers
  totalCustomers: number

  // Averages
  averageOrderValue: number

  // Payment breakdown
  cashPayments: number
  cardPayments: number
  onlinePayments: number
  pendingPayments: number

  // Refunds
  totalRefunds: number

  // Order types
  deliveryOrders: number
  pickupOrders: number
  dineInOrders: number

  // Top items
  topItems: { id: string; name: string; count: number; revenue: number; imageUrl: string }[]

  // Hourly distribution
  hourlyOrders: { hour: number; count: number }[]

  // Category revenue
  categoryRevenue: { category: string; revenue: number }[]
}

const defaultStats: Stats = {
  totalRevenue: 0,
  todayRevenue: 0,
  weekRevenue: 0,
  monthRevenue: 0,
  totalOrders: 0,
  todayOrders: 0,
  pendingOrders: 0,
  completedOrders: 0,
  cancelledOrders: 0,
  totalCustomers: 0,
  averageOrderValue: 0,
  cashPayments: 0,
  cardPayments: 0,
  onlinePayments: 0,
  pendingPayments: 0,
  totalRefunds: 0,
  deliveryOrders: 0,
  pickupOrders: 0,
  dineInOrders: 0,
  topItems: [],
  hourlyOrders: [],
  categoryRevenue: [],
}

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats>(defaultStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const setupListener = async () => {
      try {
        const db = await getFirebaseDb()
        if (!db) {
          const localOrders = getLocalOrders()
          calculateStats(localOrders)
          setLoading(false)
          return
        }

        const { collection, query, orderBy, onSnapshot } = await import("firebase/firestore")
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"))

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const orders = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Order[]

            saveLocalOrders(orders)
            calculateStats(orders)
            setLoading(false)
          },
          (error) => {
            const localOrders = getLocalOrders()
            calculateStats(localOrders)
            setLoading(false)
          },
        )
      } catch (error) {
        const localOrders = getLocalOrders()
        calculateStats(localOrders)
        setLoading(false)
      }
    }

    setupListener()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  function getLocalOrders(): Order[] {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem("demoOrders")
      if (stored) {
        return JSON.parse(stored)
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

  const calculateStats = (ordersData: Order[]) => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - 7)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const completedStatuses = ["delivered", "completed", "ready"]

    let totalRevenue = 0
    let todayRevenue = 0
    let weekRevenue = 0
    let monthRevenue = 0
    let todayOrders = 0
    let pendingOrders = 0
    let completedOrders = 0
    let cancelledOrders = 0
    let cashPayments = 0
    let cardPayments = 0
    let onlinePayments = 0
    let pendingPayments = 0
    let totalRefunds = 0
    let deliveryOrders = 0
    let pickupOrders = 0
    let dineInOrders = 0
    const customerSet = new Set<string>()
    const itemCounts: Record<string, { count: number; revenue: number }> = {}
    const hourlyCounts: Record<number, number> = {}
    const categoryCounts: Record<string, number> = {}

    ordersData.forEach((order) => {
      if (!order.id || typeof order.status !== "string") {
        return
      }

      const orderDate = toDate(order.createdAt)
      const orderTotal = Number(order.total || order.totalEur || 0)

      if (completedStatuses.includes(order.status)) {
        totalRevenue += orderTotal
        if (orderDate >= todayStart) todayRevenue += orderTotal
        if (orderDate >= weekStart) weekRevenue += orderTotal
        if (orderDate >= monthStart) monthRevenue += orderTotal
        completedOrders++
      }

      if (orderDate >= todayStart) todayOrders++
      if (order.status === "placed" || order.status === "accepted" || order.status === "preparing") pendingOrders++
      if (order.status === "cancelled") {
        cancelledOrders++
        if (order.refundAmount) totalRefunds += order.refundAmount
      }

      if (order.paymentMethod === "cash") cashPayments += orderTotal
      else if (order.paymentMethod === "card") cardPayments += orderTotal
      else if (order.paymentMethod === "online") onlinePayments += orderTotal

      if (order.paymentStatus === "pending") pendingPayments += orderTotal

      if (order.type === "delivery") deliveryOrders++
      else if (order.type === "pickup") pickupOrders++
      else if (order.type === "dine-in") dineInOrders++

      if (order.userId) customerSet.add(order.userId)

      const orderItems = Array.isArray(order.items) ? order.items : []
      orderItems.forEach((item: any) => {
        const itemName = item.name || "Unknown"
        if (!itemCounts[itemName]) {
          itemCounts[itemName] = { count: 0, revenue: 0 }
        }
        itemCounts[itemName].count += item.quantity || 1
        itemCounts[itemName].revenue += (item.priceEur || 0) * (item.quantity || 1)

        if (item.categoryId) {
          categoryCounts[item.categoryId] =
            (categoryCounts[item.categoryId] || 0) + (item.priceEur || 0) * (item.quantity || 1)
        }
      })

      const hour = orderDate.getHours()
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1
    })

    const topItems = Object.entries(itemCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const hourlyOrders = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: hourlyCounts[i] || 0,
    }))

    const categoryRevenue = Object.entries(categoryCounts)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue)

    const newStats = {
      totalRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      totalOrders: ordersData.length,
      todayOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalCustomers: customerSet.size,
      averageOrderValue: completedOrders > 0 ? totalRevenue / completedOrders : 0,
      cashPayments,
      cardPayments,
      onlinePayments,
      pendingPayments,
      totalRefunds,
      deliveryOrders,
      pickupOrders,
      dineInOrders,
      topItems,
      hourlyOrders,
      categoryRevenue,
    }

    setStats(newStats)
  }

  const safePrice = (price: number | undefined | null) => (Number(price) || 0).toFixed(2)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{safePrice(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">All time earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">€{safePrice(stats.todayRevenue)}</div>
                <p className="text-xs text-muted-foreground">{stats.todayOrders || 0} orders today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">{stats.pendingOrders} pending</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">Unique customers</p>
              </CardContent>
            </Card>
          </div>

          {/* Order Status */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  Pending Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.completedOrders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  Cancelled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.cancelledOrders}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          {/* Revenue breakdown */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{safePrice(stats.todayRevenue)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{safePrice(stats.weekRevenue)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{safePrice(stats.monthRevenue)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{safePrice(stats.averageOrderValue)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Cash</p>
                  <p className="text-xl font-bold">€{safePrice(stats.cashPayments)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Card</p>
                  <p className="text-xl font-bold">€{safePrice(stats.cardPayments)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Online</p>
                  <p className="text-xl font-bold">€{safePrice(stats.onlinePayments)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Pending</p>
                  <p className="text-xl font-bold">€{safePrice(stats.pendingPayments)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          {/* Order Types */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.deliveryOrders}</div>
                <Badge variant="outline" className="mt-2">
                  {stats.totalOrders > 0 ? ((stats.deliveryOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pickup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.pickupOrders}</div>
                <Badge variant="outline" className="mt-2">
                  {stats.totalOrders > 0 ? ((stats.pickupOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Dine-in</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.dineInOrders}</div>
                <Badge variant="outline" className="mt-2">
                  {stats.totalOrders > 0 ? ((stats.dineInOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Hourly Distribution */}
          {stats.hourlyOrders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Orders by Hour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 h-32">
                  {Array.from({ length: 24 }, (_, i) => {
                    const hourData = stats.hourlyOrders.find((h) => h.hour === i)
                    const count = hourData?.count || 0
                    const maxCount = Math.max(...stats.hourlyOrders.map((h) => h.count), 1)
                    const height = (count / maxCount) * 100

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-[#E78A00] rounded-t"
                          style={{ height: `${height}%`, minHeight: count > 0 ? "4px" : "0" }}
                        />
                        {i % 4 === 0 && <span className="text-xs text-muted-foreground mt-1">{i}h</span>}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          {/* Top Selling Items */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
              <CardDescription>Most popular menu items by order count</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.topItems.length > 0 ? (
                <div className="space-y-4">
                  {stats.topItems.map((item, index) => (
                    <div key={item.id || index} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <img
                        src={item.imageUrl || "/placeholder.svg?height=50&width=50&query=food"}
                        alt={item.name || "Item"}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.name || "Unknown Item"}</p>
                        <p className="text-sm text-muted-foreground">{item.count || 0} orders</p>
                      </div>
                      <p className="font-bold">€{safePrice(item.revenue)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No sales data yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
