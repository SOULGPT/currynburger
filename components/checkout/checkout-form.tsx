"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, CreditCard, Wallet, ShoppingBag, Store, UtensilsCrossed } from "lucide-react"
import { getFirebaseDb } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { incrementItemOrderCount } from "@/lib/firebase-menu"
import { incrementCouponUsage } from "@/lib/firebase-coupons"
import { StripeCheckoutModal } from "@/components/checkout/stripe-checkout-modal"

export function CheckoutForm() {
  const { user, continueAsGuest, isGuest } = useAuth()
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const { toast } = useToast()

  const [orderType, setOrderType] = useState<"pickup" | "delivery" | "dinein">("delivery")
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery")
  
  // Update payment method when order type changes
  useEffect(() => {
    if (orderType === "pickup") {
      setPaymentMethod("pay_at_restaurant")
    } else if (orderType === "delivery") {
      setPaymentMethod("cash_on_delivery")
    }
  }, [orderType])
  const [loading, setLoading] = useState(false)
  const [dineInParams, setDineInParams] = useState<{ branchId?: string; tableNumber?: string } | null>(null)

  const [discount, setDiscount] = useState(0)
  const [couponCode, setCouponCode] = useState<string | undefined>()
  const [couponId, setCouponId] = useState<string | undefined>()
  const [orderNote, setOrderNote] = useState("")

  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [notes, setNotes] = useState("")

  const [showStripeModal, setShowStripeModal] = useState(false)
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null)

  useEffect(() => {
    const dineInData = localStorage.getItem("dineInParams")
    if (dineInData) {
      try {
        const params = JSON.parse(dineInData)
        setDineInParams(params)
        setOrderType("dinein")
        setPaymentMethod("counter")
      } catch {}
    }

    const checkoutData = localStorage.getItem("checkoutData")
    if (checkoutData) {
      try {
        const data = JSON.parse(checkoutData)
        setDiscount(data.discount || 0)
        setCouponCode(data.couponCode)
        setCouponId(data.couponId)
        setOrderNote(data.orderNote || "")
      } catch {}
    }
  }, [])

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in or continue as guest to place an order",
        variant: "destructive",
      })
      router.push("/auth/login?redirect=/checkout")
      return
    }

    if (!Array.isArray(items) || items.length === 0) {
      toast({ title: "Empty cart", description: "Please add items to your cart first", variant: "destructive" })
      router.push("/menu")
      return
    }

    if (orderType === "delivery" && (!street || !city || !postalCode)) {
      toast({
        title: "Missing information",
        description: "Please fill in all delivery address fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const deliveryFee = orderType === "delivery" ? 2.5 : 0
      const finalTotal = totalPrice - discount + deliveryFee

      const validItems = items
        .filter((item) => item?.menuItem?.id && item?.menuItem?.name && item?.quantity > 0)
        .map((item) => ({
          menuItemId: item.menuItem.id,
          name: item.menuItem.name,
          quantity: item.quantity,
          priceEur: item.menuItem.priceEur,
          customizations: item.customizations || [],
          totalPrice: item.totalPrice,
        }))

      if (validItems.length === 0) throw new Error("No valid items in cart")

      const userId = user.id || `guest-${Date.now()}`
      const now = new Date()

      const orderData: any = {
        userId,
        userEmail: user.email || "guest@demo.com",
        userName: user.name || "Guest User",
        branchId: dineInParams?.branchId || "default-branch",
        items: validItems,
        totalEur: Number.parseFloat(finalTotal.toFixed(2)),
        status: "placed",
        type: orderType,
        paymentStatus: "pending",
        paymentMethod: orderType === "dinein" ? "Counter" : paymentMethod,
        createdAt: now,
        updatedAt: now,
      }

      if (orderType === "dinein" && dineInParams?.tableNumber) orderData.tableNumber = dineInParams.tableNumber
      if (orderType === "delivery" && street && city && postalCode) {
        orderData.address = {
          id: Date.now().toString(),
          label: "Delivery Address",
          street,
          city,
          postalCode,
          isDefault: false,
        }
      }
      if (couponCode) orderData.couponCode = couponCode
      if (discount > 0) orderData.discount = Number.parseFloat(discount.toFixed(2))
      if (orderNote.trim()) orderData.note = orderNote.trim()
      if (notes) orderData.notes = notes

      let orderId: string

      try {
        const db = await getFirebaseDb()
        if (db) {
          const { collection, addDoc, Timestamp } = await import("firebase/firestore")
          const firestoreData = { ...orderData, createdAt: Timestamp.fromDate(now), updatedAt: Timestamp.fromDate(now) }
          const docRef = await addDoc(collection(db, "orders"), firestoreData)
          orderId = docRef.id
        } else {
          throw new Error("No DB")
        }
      } catch {
        orderId = `demo-${Date.now()}`
        const demoOrders = JSON.parse(localStorage.getItem("demoOrders") || "[]")
        demoOrders.push({ id: orderId, ...orderData })
        localStorage.setItem("demoOrders", JSON.stringify(demoOrders))
      }

      if (paymentMethod === "pay_online") {
        setPendingOrderId(orderId)
        setShowStripeModal(true)
        setLoading(false)
        return
      }

      for (const item of validItems) {
        try {
          if (item?.menuItemId) await incrementItemOrderCount(item.menuItemId)
        } catch {}
      }
      if (couponId) {
        try {
          await incrementCouponUsage(couponId, user?.id)
        } catch {}
      }

      clearCart()
      localStorage.removeItem("checkoutData")
      localStorage.removeItem("dineInParams")

      toast({
        title: orderType === "dinein" ? "Order sent to kitchen!" : "Order placed successfully!",
        description:
          orderType === "dinein"
            ? `Table ${dineInParams?.tableNumber} - Please pay at the counter when ready.`
            : `You earned ${Math.floor(finalTotal)} loyalty points`,
      })

      router.push(`/orders/${orderId}`)
    } catch (error: any) {
      toast({
        title: "Error placing order",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentComplete = async () => {
    if (!pendingOrderId) return

    try {
      const db = await getFirebaseDb()
      if (db && !pendingOrderId.startsWith("demo-")) {
        const { doc, updateDoc, Timestamp } = await import("firebase/firestore")
        await updateDoc(doc(db, "orders", pendingOrderId), { paymentStatus: "paid", updatedAt: Timestamp.now() })
      } else {
        const demoOrders = JSON.parse(localStorage.getItem("demoOrders") || "[]")
        const orderIndex = demoOrders.findIndex((o: any) => o.id === pendingOrderId)
        if (orderIndex >= 0) {
          demoOrders[orderIndex].paymentStatus = "paid"
          localStorage.setItem("demoOrders", JSON.stringify(demoOrders))
        }
      }

      for (const item of items) {
        try {
          if (item?.menuItem?.id) await incrementItemOrderCount(item.menuItem.id)
        } catch {}
      }
      if (couponId) {
        try {
          await incrementCouponUsage(couponId, user?.id)
        } catch {}
      }

      const finalTotal = totalPrice - discount + (orderType === "delivery" ? 2.5 : 0)

      clearCart()
      localStorage.removeItem("checkoutData")
      localStorage.removeItem("dineInParams")

      toast({ title: "Payment successful!", description: `You earned ${Math.floor(finalTotal)} loyalty points` })

      setShowStripeModal(false)
      router.push(`/orders/${pendingOrderId}`)
    } catch {
      toast({
        title: "Error updating order",
        description: "Payment succeeded but order update failed.",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-foreground mb-4">Ready to checkout?</h2>
        <p className="text-muted-foreground mb-6">Sign in to your account or continue as a guest</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push("/auth/login?redirect=/checkout")}
            className="bg-[#E78A00] hover:bg-[#C67500] text-white"
          >
            Sign In
          </Button>
          <Button onClick={continueAsGuest} variant="outline">
            Continue as Guest
          </Button>
        </div>
      </div>
    )
  }

  const deliveryFee = orderType === "delivery" ? 2.5 : 0
  const finalTotal = totalPrice - discount + deliveryFee

  return (
    <>
      <div className="space-y-6">
        {isGuest && (
          <Card className="p-4 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              You are checking out as a guest. Create an account to earn loyalty points!
            </p>
          </Card>
        )}

        {orderType === "dinein" && dineInParams && (
          <Card className="p-6 bg-[#E78A00]/10 border-[#E78A00]">
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="w-6 h-6 text-[#E78A00]" />
              <div>
                <h3 className="font-bold text-foreground">Dine-In Order</h3>
                <p className="text-sm text-muted-foreground">
                  Table {dineInParams.tableNumber} - Pay at counter when ready
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {!dineInParams && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Order Type
              </h2>
              <RadioGroup value={orderType} onValueChange={(value) => setOrderType(value as any)}>
                <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[#E78A00]" />
                      <div>
                        <p className="font-semibold">Delivery</p>
                        <p className="text-sm text-muted-foreground">Get it delivered to your door</p>
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-[#E78A00]" />
                      <div>
                        <p className="font-semibold">Pickup</p>
                        <p className="text-sm text-muted-foreground">Pick up from nearest branch</p>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </Card>
          )}

          {orderType !== "dinein" && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                {/* Pay Online - Coming Soon */}
                <div className="flex items-center space-x-3 p-4 border rounded-lg bg-gray-50 opacity-60 cursor-not-allowed">
                  <RadioGroupItem value="pay_online" id="pay_online" disabled />
                  <Label htmlFor="pay_online" className="flex-1 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-500">Pay Online</p>
                          <span className="px-2 py-0.5 bg-[#E78A00] text-white text-xs font-bold rounded-full">Coming Soon</span>
                        </div>
                        <p className="text-sm text-gray-400">Credit/Debit Card</p>
                      </div>
                    </div>
                  </Label>
                </div>
                
                {/* Pay at Restaurant - for Pickup */}
                {orderType === "pickup" && (
                  <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 border-[#E78A00] bg-orange-50">
                    <RadioGroupItem value="pay_at_restaurant" id="pay_at_restaurant" />
                    <Label htmlFor="pay_at_restaurant" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Store className="w-5 h-5 text-[#E78A00]" />
                        <div>
                          <p className="font-semibold">Pay at Restaurant</p>
                          <p className="text-sm text-muted-foreground">Pay when you pick up</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                )}
                
                {/* Cash on Delivery - for Delivery */}
                {orderType === "delivery" && (
                  <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 border-[#E78A00] bg-orange-50">
                    <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                    <Label htmlFor="cash_on_delivery" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-[#E78A00]" />
                        <div>
                          <p className="font-semibold">Cash on Delivery</p>
                          <p className="text-sm text-muted-foreground">Pay when you receive</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </Card>
          )}
        </div>

        {orderType === "delivery" && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Delivery Address
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  placeholder="123 Main Street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Rome" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="postal">Postal Code</Label>
                  <Input
                    id="postal"
                    placeholder="00100"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Ring the doorbell, apartment 3B"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>€{totalPrice.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-€{discount.toFixed(2)}</span>
              </div>
            )}
            {orderType === "delivery" && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>€{deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-[#E78A00]">€{finalTotal.toFixed(2)}</span>
            </div>
          </div>
          <Button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full mt-6 bg-[#E78A00] hover:bg-[#C67500] text-white h-12 text-lg"
          >
            {loading ? "Processing..." : `Place Order - €${finalTotal.toFixed(2)}`}
          </Button>
        </Card>
      </div>

      {pendingOrderId && (
        <StripeCheckoutModal
          open={showStripeModal}
          onOpenChange={setShowStripeModal}
          orderData={{
            items: items.map((item) => ({
              name: item.menuItem.name,
              priceEur: item.menuItem.priceEur,
              quantity: item.quantity,
            })),
            totalEur: finalTotal,
            orderId: pendingOrderId,
            userId: user?.id || "",
          }}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  )
}
