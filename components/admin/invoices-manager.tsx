"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Loader2, FileText, Download, Mail, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDistanceToNow } from "@/lib/date-utils"
import type { Order } from "@/types"
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase"

export function InvoicesManager() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    let unsubscribe: (() => void) | undefined

    const loadOrders = async () => {
      if (!isFirebaseConfigured()) {
        // Load demo orders from localStorage
        try {
          const stored = localStorage.getItem("demoOrders")
          if (stored && mounted) {
            setOrders(JSON.parse(stored))
          }
        } catch {}
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

            setOrders(ordersData)
            setLoading(false)
          },
          (error) => {
            console.error("Error fetching orders:", error)
            if (mounted) setLoading(false)
          },
        )
      } catch (error) {
        console.error("Error setting up listener:", error)
        if (mounted) setLoading(false)
      }
    }

    loadOrders()

    return () => {
      mounted = false
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const generateInvoicePDF = async (order: Order) => {
    setGeneratingPdf(order.id)
    try {
      // Dynamic import to avoid crash in v0 preview
      const jsPDFModule = await import("jspdf")
      const jsPDF = jsPDFModule.default

      const doc = new jsPDF()

      // Header
      doc.setFontSize(20)
      doc.text("Curry&Burger", 20, 20)
      doc.setFontSize(12)
      doc.text("Invoice", 20, 30)

      // Order details
      doc.setFontSize(10)
      doc.text(`Order #: ${order.id.slice(0, 8)}`, 20, 45)
      doc.text(`Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}`, 20, 52)
      doc.text(`Payment Status: ${order.paymentStatus}`, 20, 59)
      doc.text(`Order Type: ${order.type}`, 20, 66)

      // Items header
      doc.setFontSize(12)
      doc.text("Items", 20, 80)
      doc.setFontSize(10)

      const items = Array.isArray(order.items) ? order.items : []

      // Items list
      let yPos = 90
      items.forEach((item) => {
        const itemName = item.menuItem?.name || "Unknown Item"
        const itemPrice = (Number(item.totalPrice) || 0).toFixed(2)
        doc.text(`${item.quantity}x ${itemName}`, 20, yPos)
        doc.text(`€${itemPrice}`, 150, yPos)
        yPos += 7
      })

      // Total
      yPos += 10
      doc.setFontSize(12)
      doc.text(`Total: €${(Number(order.totalEur) || 0).toFixed(2)}`, 20, yPos)

      // Footer
      doc.setFontSize(8)
      doc.text("Thank you for your order!", 20, yPos + 20)

      // Save PDF
      doc.save(`invoice-${order.id.slice(0, 8)}.pdf`)
    } catch (error) {
      console.error("PDF generation failed:", error)
      // Fallback: create a simple text invoice
      const items = Array.isArray(order.items) ? order.items : []
      const invoiceText = `
CURRY & BURGER - INVOICE
========================
Order #: ${order.id.slice(0, 8)}
Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
Payment Status: ${order.paymentStatus}
Order Type: ${order.type}

ITEMS:
${items.map((item) => `${item.quantity}x ${item.menuItem?.name || "Item"} - €${(Number(item.totalPrice) || 0).toFixed(2)}`).join("\n")}

TOTAL: €${(Number(order.totalEur) || 0).toFixed(2)}

Thank you for your order!
      `.trim()

      const blob = new Blob([invoiceText], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `invoice-${order.id.slice(0, 8)}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setGeneratingPdf(null)
    }
  }

  const sendInvoiceEmail = (order: Order) => {
    alert(`Invoice email would be sent for order #${order.id.slice(0, 8)}`)
  }

  const filteredOrders =
    filterStatus === "all" ? orders : orders.filter((order) => order.paymentStatus === filterStatus)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter((o) => o.paymentStatus === "paid").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter((o) => o.paymentStatus === "pending").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Generate and manage order invoices</CardDescription>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Invoices</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No invoices found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const items = Array.isArray(order.items) ? order.items : []

                return (
                  <Card key={order.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Invoice #{order.id.slice(0, 8)}</span>
                            <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
                              {order.paymentStatus}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {items.length} items • €{(Number(order.totalEur) || 0).toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.createdAt && formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateInvoicePDF(order)}
                            disabled={generatingPdf === order.id}
                          >
                            {generatingPdf === order.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4 mr-2" />
                            )}
                            PDF
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => sendInvoiceEmail(order)}>
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
