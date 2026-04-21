import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"
import { RESTAURANT_ID } from "@/lib/firebase-schema"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, items, total, type, customerContact, deliveryAddress, metadata } = body

    // Create order in Firestore
    const orderRef = await adminDb.collection("orders").add({
      restaurantId: RESTAURANT_ID,
      userId,
      items: items.map((item: any) => ({
        itemId: item.id,
        name: item.name,
        qty: item.quantity,
        price: item.priceEur,
      })),
      total,
      status: "placed",
      type,
      customerContact,
      deliveryAddress: deliveryAddress || null,
      metadata: metadata || {},
      createdAt: FieldValue.serverTimestamp(),
    })

    const orderId = orderRef.id

    // Increment orderCount for each item
    const batch = adminDb.batch()

    for (const item of items) {
      const itemRef = adminDb.collection("restaurants").doc(RESTAURANT_ID).collection("items").doc(item.id)

      batch.update(itemRef, {
        orderCount: FieldValue.increment(item.quantity),
      })
    }

    await batch.commit()

    return NextResponse.json({
      success: true,
      orderId,
      message: "Order created successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create order",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limitCount = Number.parseInt(searchParams.get("limit") || "50")

    let query = adminDb.collection("orders").where("restaurantId", "==", RESTAURANT_ID).orderBy("createdAt", "desc")

    if (userId) {
      query = query.where("userId", "==", userId) as any
    }

    const snapshot = await query.limit(limitCount).get()

    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({
      success: true,
      orders,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch orders",
      },
      { status: 500 },
    )
  }
}
