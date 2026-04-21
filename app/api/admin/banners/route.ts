import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

// GET - Fetch all banners
export async function GET() {
  try {
    const snapshot = await adminDb.collection("banners").orderBy("priority", "desc").get()

    const banners = snapshot.docs.map((doc) => {
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

    return NextResponse.json({ banners })
  } catch (error) {
    console.error("Error fetching banners:", error)
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 })
  }
}

// POST - Create new banner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const bannerData = {
      title: body.title,
      subtitle: body.subtitle || "",
      imageUrl: body.imageUrl || "/placeholder.svg",
      linkUrl: body.linkUrl || "",
      linkText: body.linkText || "",
      active: body.active ?? true,
      priority: body.priority || 1,
      validFrom: body.validFrom ? new Date(body.validFrom) : null,
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    const docRef = await adminDb.collection("banners").add(bannerData)

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: "Banner created successfully",
    })
  } catch (error) {
    console.error("Error creating banner:", error)
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 })
  }
}

// PUT - Update existing banner
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: "Banner ID is required" }, { status: 400 })
    }

    const bannerData = {
      title: body.title,
      subtitle: body.subtitle || "",
      imageUrl: body.imageUrl || "/placeholder.svg",
      linkUrl: body.linkUrl || "",
      linkText: body.linkText || "",
      active: body.active ?? true,
      priority: body.priority || 1,
      validFrom: body.validFrom ? new Date(body.validFrom) : null,
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
      updatedAt: FieldValue.serverTimestamp(),
    }

    await adminDb.collection("banners").doc(body.id).update(bannerData)

    return NextResponse.json({
      success: true,
      id: body.id,
      message: "Banner updated successfully",
    })
  } catch (error) {
    console.error("Error updating banner:", error)
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 })
  }
}

// DELETE - Delete banner
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Banner ID is required" }, { status: 400 })
    }

    await adminDb.collection("banners").doc(id).delete()

    return NextResponse.json({
      success: true,
      message: "Banner deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting banner:", error)
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 })
  }
}
