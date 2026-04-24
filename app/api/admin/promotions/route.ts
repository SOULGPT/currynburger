import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

export const dynamic = "force-static"

// GET - Fetch all promotions
export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin not configured" },
        { status: 500 }
      )
    }

    const snapshot = await adminDb
      .collection("promotions")
      .orderBy("priority", "desc")
      .get()

    const promotions = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        validUntil: data.validUntil?.toDate?.()?.toISOString() ?? null,
        validFrom: data.validFrom?.toDate?.()?.toISOString() ?? null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
      }
    })

    return NextResponse.json({ promotions })
  } catch (error) {
    console.error("[promotions GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch promotions" },
      { status: 500 }
    )
  }
}

// POST - Create new promotion
export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin not configured" },
        { status: 500 }
      )
    }

    const body = await request.json()

    if (!body.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    const promoData = {
      title: body.title,
      description: body.description || "",
      imageUrl: body.imageUrl || "/placeholder.svg",
      discount: body.discount || "",
      code: body.code || "",
      active: body.active ?? true,
      priority: body.priority || 1,
      validFrom: body.validFrom ? new Date(body.validFrom) : null,
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    const docRef = await adminDb.collection("promotions").add(promoData)

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: "Promotion created successfully",
    })
  } catch (error) {
    console.error("[promotions POST]", error)
    return NextResponse.json(
      { error: "Failed to create promotion" },
      { status: 500 }
    )
  }
}

// PUT - Update existing promotion
export async function PUT(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin not configured" },
        { status: 500 }
      )
    }

    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { error: "Promotion ID is required" },
        { status: 400 }
      )
    }

    if (!body.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    const docRef = adminDb.collection("promotions").doc(body.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Promotion not found" },
        { status: 404 }
      )
    }

    const promoData = {
      title: body.title,
      description: body.description || "",
      imageUrl: body.imageUrl || "/placeholder.svg",
      discount: body.discount || "",
      code: body.code || "",
      active: body.active ?? true,
      priority: body.priority || 1,
      validFrom: body.validFrom ? new Date(body.validFrom) : null,
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
      updatedAt: FieldValue.serverTimestamp(),
    }

    await docRef.update(promoData)

    return NextResponse.json({
      success: true,
      id: body.id,
      message: "Promotion updated successfully",
    })
  } catch (error) {
    console.error("[promotions PUT]", error)
    return NextResponse.json(
      { error: "Failed to update promotion" },
      { status: 500 }
    )
  }
}

// DELETE - Delete promotion
export async function DELETE(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin not configured" },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Promotion ID is required" },
        { status: 400 }
      )
    }

    const docRef = adminDb.collection("promotions").doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Promotion not found" },
        { status: 404 }
      )
    }

    await docRef.delete()

    return NextResponse.json({
      success: true,
      message: "Promotion deleted successfully",
    })
  } catch (error) {
    console.error("[promotions DELETE]", error)
    return NextResponse.json(
      { error: "Failed to delete promotion" },
      { status: 500 }
    )
  }
}