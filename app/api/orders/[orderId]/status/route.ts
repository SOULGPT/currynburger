import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ success: false, error: "Status is required" }, { status: 400 })
    }

    await adminDb.collection("orders").doc(orderId).update({
      status,
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update order status",
      },
      { status: 500 },
    )
  }
}
