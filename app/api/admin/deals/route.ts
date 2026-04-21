import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

// GET - Fetch all deals
export async function GET() {
  try {
    const snapshot = await adminDb.collection("deals").orderBy("priority", "desc").get()

    const deals = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        validUntil: data.validUntil?.toDate?.()?.toISOString() || data.validUntil,
        validFrom: data.validFrom?.toDate?.()?.toISOString() || data.validFrom,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      }
    })

    return NextResponse.json({ deals })
  } catch (error) {
    console.error("Error fetching deals:", error)
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 })
  }
}

// POST - Create new deal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const dealData = {
      title: body.title,
      description: body.description || "",
      imageUrl: body.imageUrl || "/placeholder.svg",
      priceEur: body.priceEur || 0,
      originalPriceEur: body.originalPriceEur || 0,
      discount: body.discount || "",
      category: body.category || "General",
      items: body.items || [],
      active: body.active ?? true,
      priority: body.priority || 1,
      validFrom: body.validFrom ? new Date(body.validFrom) : null,
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    const docRef = await adminDb.collection("deals").add(dealData)

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: "Deal created successfully",
    })
  } catch (error) {
    console.error("Error creating deal:", error)
    return NextResponse.json({ error: "Failed to create deal" }, { status: 500 })
  }
}

// PUT - Update existing deal
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: "Deal ID is required" }, { status: 400 })
    }

    const dealData = {
      title: body.title,
      description: body.description || "",
      imageUrl: body.imageUrl || "/placeholder.svg",
      priceEur: body.priceEur || 0,
      originalPriceEur: body.originalPriceEur || 0,
      discount: body.discount || "",
      category: body.category || "General",
      items: body.items || [],
      active: body.active ?? true,
      priority: body.priority || 1,
      validFrom: body.validFrom ? new Date(body.validFrom) : null,
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
      updatedAt: FieldValue.serverTimestamp(),
    }

    await adminDb.collection("deals").doc(body.id).update(dealData)

    return NextResponse.json({
      success: true,
      id: body.id,
      message: "Deal updated successfully",
    })
  } catch (error) {
    console.error("Error updating deal:", error)
    return NextResponse.json({ error: "Failed to update deal" }, { status: 500 })
  }
}

// DELETE - Delete deal
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Deal ID is required" }, { status: 400 })
    }

    await adminDb.collection("deals").doc(id).delete()

    return NextResponse.json({
      success: true,
      message: "Deal deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting deal:", error)
    return NextResponse.json({ error: "Failed to delete deal" }, { status: 500 })
  }
}
