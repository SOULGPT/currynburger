import { NextResponse, NextRequest } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export const dynamic = "force-static"

export async function generateStaticParams() {
  return [{ id: 'fallback' }];
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 })
    }

    const docRef = adminDb.collection("menu_categories").doc(id)

    // Remove undefined values to prevent Firestore errors
    const cleanData = Object.entries(body).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value
        }
        return acc
      },
      {} as Record<string, unknown>,
    )

    await docRef.set(cleanData, { merge: false })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Update category error:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 })
    }

    const docRef = adminDb.collection("menu_categories").doc(id)
    await docRef.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete category error:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
