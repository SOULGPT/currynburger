import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export const dynamic = "force-static"

export async function GET() {
  return NextResponse.json({ status: "ok" })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return NextResponse.json({
      paymentStatus: session.payment_status,
      orderId: session.metadata?.orderId,
    })
  } catch (error: any) {
    console.error("[v0 Stripe] Error verifying payment:", error)
    return NextResponse.json(
      { error: `Failed to verify payment: ${error.message}` },
      { status: 500 }
    )
  }
}
