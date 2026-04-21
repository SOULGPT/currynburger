"use client"

import { useCart } from "@/contexts/cart-context"
import { CartItemCard } from "./cart-item-card"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ShoppingBag, ArrowRight, Loader2, CheckCircle2, XCircle, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useState, useCallback, useTransition, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { validateCoupon } from "@/lib/firebase-coupons"
import type { Coupon } from "@/types"

export function CartContent() {
  const { items, totalPrice, clearCart, isReady } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [validating, setValidating] = useState(false)
  const [validationMessage, setValidationMessage] = useState("")
  const [validationStatus, setValidationStatus] = useState<"success" | "error" | null>(null)
  const [isPending, startTransition] = useTransition()
  const [orderNote, setOrderNote] = useState("")

  const handleApplyPromo = useCallback(async () => {
    if (!promoCode.trim()) {
      setValidationMessage("Please enter a promo code")
      setValidationStatus("error")
      return
    }

    setValidating(true)
    setValidationMessage("")
    setValidationStatus(null)

    try {
      const result = await validateCoupon(promoCode, totalPrice, user?.id)

      if (result.valid && result.coupon && result.discount) {
        setDiscount(result.discount)
        setAppliedCoupon(result.coupon)
        setValidationMessage(result.message)
        setValidationStatus("success")
      } else {
        setDiscount(0)
        setAppliedCoupon(null)
        setValidationMessage(result.message)
        setValidationStatus("error")
      }
    } catch {
      setValidationMessage("Error validating coupon")
      setValidationStatus("error")
    }

    setValidating(false)
  }, [promoCode, totalPrice])

  const handleRemovePromo = useCallback(() => {
    setPromoCode("")
    setDiscount(0)
    setAppliedCoupon(null)
    setValidationMessage("")
    setValidationStatus(null)
  }, [])

  const handleCheckout = useCallback(() => {
    const checkoutData = {
      discount,
      couponCode: appliedCoupon?.code,
      couponId: appliedCoupon?.id,
      orderNote: orderNote.trim(),
    }
    localStorage.setItem("checkoutData", JSON.stringify(checkoutData))
    startTransition(() => {
      router.push("/checkout")
    })
  }, [discount, appliedCoupon, orderNote, router])

  const handleClearCart = useCallback(() => {
    startTransition(() => {
      clearCart()
    })
  }, [clearCart])

  const finalTotal = useMemo(() => totalPrice - discount, [totalPrice, discount])

  if (!isReady) {
    return (
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded w-1/4 mt-4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="lg:col-span-1">
          <Card className="p-6 animate-pulse">
            <div className="h-6 bg-muted rounded w-1/2 mb-6" />
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded" />
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Add some delicious items to get started!</p>
        <Link href="/menu">
          <Button size="lg" className="bg-[#E78A00] hover:bg-[#C67500] text-white">
            Browse Menu
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <CartItemCard key={item.id} item={item} />
        ))}

        <Button variant="outline" onClick={handleClearCart} disabled={isPending} className="w-full bg-transparent">
          {isPending ? "Clearing..." : "Clear Cart"}
        </Button>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="p-6 sticky top-24">
          <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>

          {/* Promo Code */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">Promo Code</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="flex-1"
                disabled={validating || !!appliedCoupon}
              />
              {appliedCoupon ? (
                <Button onClick={handleRemovePromo} variant="outline" className="bg-transparent">
                  Remove
                </Button>
              ) : (
                <Button onClick={handleApplyPromo} variant="outline" className="bg-transparent" disabled={validating}>
                  {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                </Button>
              )}
            </div>
            {validationMessage && (
              <div
                className={`flex items-center gap-2 mt-2 text-sm ${
                  validationStatus === "success" ? "text-[#00C897]" : "text-red-500"
                }`}
              >
                {validationStatus === "success" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span className="font-medium">{validationMessage}</span>
              </div>
            )}
          </div>

          {/* Order Note */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#E78A00]" />
              Order Note (Optional)
            </label>
            <Textarea
              placeholder="Special instructions for your entire order... (e.g., Call when outside, Deliver to back door)"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">{orderNote.length}/500 characters</p>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3 mb-6 pb-6 border-b">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">€{totalPrice.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount ({appliedCoupon?.code})</span>
                <span className="font-medium text-[#00C897]">-€{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="font-medium">€2.50</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-bold text-foreground">Total</span>
            <span className="text-2xl font-bold text-[#E78A00]">€{(finalTotal + 2.5).toFixed(2)}</span>
          </div>

          {/* Checkout Button */}
          <Button
            size="lg"
            className="w-full bg-[#E78A00] hover:bg-[#C67500] text-white"
            onClick={handleCheckout}
            disabled={isPending}
          >
            {isPending ? "Loading..." : "Proceed to Checkout"}
            {!isPending && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>

          {!user && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              You can checkout as a guest or sign in for loyalty points
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
