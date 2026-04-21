"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil, Trash2, Loader2, Ticket } from "lucide-react"
import { useState, useEffect } from "react"
import type { Coupon } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { subscribeToCoupons, addCoupon, updateCoupon, deleteCoupon } from "@/lib/firebase-coupons"
import { formatDate, toDate } from "@/lib/date-utils"

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
  } catch {}
}

export function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToCoupons((newCoupons) => {
      setCoupons(newCoupons)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const couponData: Omit<Coupon, "id"> = {
      code: (formData.get("code") as string).toUpperCase(),
      discountType: formData.get("discountType") as "percentage" | "fixed",
      discountValue: Number.parseFloat(formData.get("discountValue") as string),
      validFrom: new Date(formData.get("validFrom") as string),
      validTo: new Date(formData.get("validTo") as string),
      active: formData.get("active") === "on",
      usagePerCustomer: formData.get("usagePerCustomer") as "single" | "unlimited",
      usedBy: editingCoupon?.usedBy || [],
    }

    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, couponData)
        toast({ title: "Coupon updated successfully" })
      } else {
        await addCoupon(couponData)
        toast({ title: "Coupon created successfully" })
      }
      setDialogOpen(false)
      setEditingCoupon(null)
    } catch (error) {
      toast({ title: "Error saving coupon", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return

    try {
      await deleteCoupon(id)
      toast({ title: "Coupon deleted successfully" })
    } catch {
      toast({ title: "Error deleting coupon", variant: "destructive" })
    }
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Coupons & Promotions</CardTitle>
              <CardDescription>Manage discount codes and promotional offers</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingCoupon(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Coupon
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingCoupon ? "Edit Coupon" : "Add New Coupon"}</DialogTitle>
                  <DialogDescription>
                    {editingCoupon ? "Update the coupon details" : "Create a new discount coupon"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Coupon Code</Label>
                    <Input
                      id="code"
                      name="code"
                      placeholder="e.g., SAVE20"
                      defaultValue={editingCoupon?.code}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountType">Discount Type</Label>
                    <Select name="discountType" defaultValue={editingCoupon?.discountType || "percentage"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountValue">Discount Value</Label>
                    <Input
                      id="discountValue"
                      name="discountValue"
                      type="number"
                      step="0.01"
                      defaultValue={editingCoupon?.discountValue}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="validFrom">Valid From</Label>
                      <Input
                        id="validFrom"
                        name="validFrom"
                        type="date"
                        defaultValue={
                          editingCoupon?.validFrom ? toDate(editingCoupon.validFrom).toISOString().split("T")[0] : ""
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="validTo">Valid To</Label>
                      <Input
                        id="validTo"
                        name="validTo"
                        type="date"
                        defaultValue={
                          editingCoupon?.validTo ? toDate(editingCoupon.validTo).toISOString().split("T")[0] : ""
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usagePerCustomer">Usage Per Customer</Label>
                    <Select name="usagePerCustomer" defaultValue={editingCoupon?.usagePerCustomer || "single"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">One-time use per customer</SelectItem>
                        <SelectItem value="unlimited">Unlimited uses per customer</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Choose whether each customer can use this coupon once or multiple times
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="active" name="active" defaultChecked={editingCoupon?.active ?? true} />
                    <Label htmlFor="active">Active</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {editingCoupon ? "Update" : "Add"} Coupon
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coupons.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No coupons created yet</p>
              </div>
            ) : (
              coupons.map((coupon) => (
                <Card key={coupon.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{coupon.code}</h3>
                          <Badge variant={coupon.active ? "default" : "secondary"}>
                            {coupon.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {coupon.discountType === "percentage"
                            ? `${Number(coupon.discountValue) || 0}% off`
                            : `€${(Number(coupon.discountValue) || 0).toFixed(2)} off`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Valid: {formatDate(coupon.validFrom)} - {formatDate(coupon.validTo)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {coupon.usagePerCustomer === "single" ? "One-time per customer" : "Unlimited per customer"}
                          </Badge>
                          {coupon.usedBy && coupon.usedBy.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Used by {coupon.usedBy.length} customer{coupon.usedBy.length !== 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCoupon(coupon)
                            setDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(coupon.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
