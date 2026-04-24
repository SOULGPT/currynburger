import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export const dynamic = "force-static"

export async function GET() {
  return NextResponse.json({ status: "ok" })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderData } = body

    const lineItems = orderData.items.map((item: any) => ({
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

    return NextResponse.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
    })
  } catch (error: any) {
    console.error("[v0 Stripe] Error creating checkout session:", error)
    return NextResponse.json(
      { error: `Failed to create payment session: ${error.message}` },
      { status: 500 }
    )
  }
}
