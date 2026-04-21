"use server"

import { stripe } from "@/lib/stripe"

export async function createCheckoutSession(orderData: {
  items: Array<{ name: string; priceEur: number; quantity: number }>
  totalEur: number
  orderId: string
  userId: string
}) {
  try {
    const lineItems = orderData.items.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.priceEur * 100), // Convert EUR to cents
      },
      quantity: item.quantity,
    }))

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: lineItems,
      mode: "payment",
      metadata: {
        orderId: orderData.orderId,
        userId: orderData.userId,
      },
      // Don't redirect - we'll handle success in the app
      redirect_on_completion: "never",
    })

    return {
      clientSecret: session.client_secret,
      sessionId: session.id,
    }
  } catch (error: any) {
    console.error("[v0 Stripe] Error creating checkout session:", error)
    throw new Error(`Failed to create payment session: ${error.message}`)
  }
}

export async function verifyPaymentStatus(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return {
      paymentStatus: session.payment_status,
      orderId: session.metadata?.orderId,
    }
  } catch (error: any) {
    console.error("[v0 Stripe] Error verifying payment:", error)
    throw new Error(`Failed to verify payment: ${error.message}`)
  }
}
