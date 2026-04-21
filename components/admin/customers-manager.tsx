"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase"
import { Loader2, Users, Mail, Phone, Award, Search, Edit } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  loyaltyPoints: number
  role: string
  createdAt?: Date
  orderCount?: number
}

function getLocalCustomers(): Customer[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("demoCustomers")
    if (stored) return JSON.parse(stored)
  } catch {}
  return [
    {
      id: "demo-customer-1",
      name: "Demo Customer",
      email: "demo@example.com",
      phone: "+1 234 567 8900",
      loyaltyPoints: 150,
      role: "customer",
      orderCount: 5,
    },
  ]
}

function saveLocalCustomers(customers: Customer[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem("demoCustomers", JSON.stringify(customers))
  } catch {}
}

export function CustomersManager() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [editPoints, setEditPoints] = useState(0)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true

    const fetchCustomers = async () => {
      const localCustomers = getLocalCustomers()
      if (mounted) {
        setCustomers(localCustomers)
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

        const { collection, query, getDocs, orderBy } = await import("firebase/firestore")
        const usersRef = collection(db, "users")
        const q = query(usersRef, orderBy("createdAt", "desc"))
        const snapshot = await getDocs(q)

        const ordersRef = collection(db, "orders")
        const ordersSnapshot = await getDocs(ordersRef)
        const orderCounts: Record<string, number> = {}

        ordersSnapshot.forEach((doc) => {
          const order = doc.data()
          const userId = order.userId
          orderCounts[userId] = (orderCounts[userId] || 0) + 1
        })

        const customersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          orderCount: orderCounts[doc.id] || 0,
        })) as Customer[]

        if (mounted && customersData.length > 0) {
          setCustomers(customersData)
          saveLocalCustomers(customersData)
        }
      } catch (error) {
        console.error("Error fetching customers:", error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchCustomers()
    return () => {
      mounted = false
    }
  }, [])

  const updateLoyaltyPoints = async () => {
    if (!editingCustomer) return
    setSaving(true)

    try {
      const db = await getFirebaseDb()
      if (db) {
        const { doc, updateDoc } = await import("firebase/firestore")
        await updateDoc(doc(db, "users", editingCustomer.id), {
          loyaltyPoints: editPoints,
        })
      }

      // Update local
      const updated = customers.map((c) => (c.id === editingCustomer.id ? { ...c, loyaltyPoints: editPoints } : c))
      setCustomers(updated)
      saveLocalCustomers(updated)

      toast({ title: "Loyalty points updated" })
      setEditingCustomer(null)
    } catch (error) {
      console.error("Error updating loyalty points:", error)
      toast({ title: "Error updating points", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active This Month</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.filter((c) => c.orderCount && c.orderCount > 0).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Members</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.filter((c) => c.loyaltyPoints > 0).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer Profiles</CardTitle>
              <CardDescription>View and manage customer information</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No customers found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{customer.name || "No name"}</span>
                          <Badge variant="outline" className="capitalize">
                            {customer.role}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-primary" />
                            <span className="font-medium">{customer.loyaltyPoints} points</span>
                          </div>
                          <span className="text-muted-foreground">{customer.orderCount || 0} orders</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCustomer(customer)
                          setEditPoints(customer.loyaltyPoints)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Points
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Points Dialog */}
      <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Loyalty Points</DialogTitle>
            <DialogDescription>Update loyalty points for {editingCustomer?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="points">Loyalty Points</Label>
              <Input
                id="points"
                type="number"
                value={editPoints}
                onChange={(e) => setEditPoints(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCustomer(null)}>
              Cancel
            </Button>
            <Button onClick={updateLoyaltyPoints} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
