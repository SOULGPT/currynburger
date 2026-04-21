"use client"

import { useState, useCallback } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createCheckoutSession } from "@/app/actions/stripe"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderData: {
    items: Array<{ name: string; priceEur: number; quantity: number }>
    totalEur: number
    orderId: string
    userId: string
  }
  onPaymentComplete: () => void
}

export function StripeCheckoutModal({ open, onOpenChange, orderData, onPaymentComplete }: StripeCheckoutModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    console.log("[v0 Stripe] Creating checkout session...")
    try {
      const result = await createCheckoutSession(orderData)
      console.log("[v0 Stripe] Checkout session created:", result.sessionId)
      return result.clientSecret!
    } catch (error: any) {
      console.error("[v0 Stripe] Error fetching client secret:", error)
      throw error
    }
  }, [orderData])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>Securely pay with your credit or debit card using Stripe</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
            <EmbeddedCheckout
              onComplete={() => {
                console.log("[v0 Stripe] Payment completed!")
                onPaymentComplete()
              }}
            />
          </EmbeddedCheckoutProvider>
        </div>
      </DialogContent>
    </Dialog>
  )
}
