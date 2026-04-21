import { NextResponse } from "next/server"


export const dynamic = "force-dynamic"
export const revalidate = 0

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 2): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)
      const response = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timeoutId)
      if (response.ok) return response
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise((resolve) => setTimeout(resolve, 500 * (i + 1)))
    }
  }
  throw new Error("Max retries reached")
}

function parseFirestoreDoc(doc: Record<string, unknown>): Record<string, unknown> {
  const fields = doc.fields as Record<string, Record<string, unknown>> | undefined
  if (!fields) return {}

  const parsed: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(fields)) {
    if ("stringValue" in value) parsed[key] = value.stringValue
    else if ("integerValue" in value) parsed[key] = Number(value.integerValue)
    else if ("doubleValue" in value) parsed[key] = Number(value.doubleValue)
    else if ("booleanValue" in value) parsed[key] = value.booleanValue
    else if ("nullValue" in value) parsed[key] = null
    else if ("arrayValue" in value) {
      const arr = value.arrayValue as { values?: Array<Record<string, unknown>> }
      parsed[key] =
        arr.values?.map((v) => {
          if ("stringValue" in v) return v.stringValue
          if ("integerValue" in v) return Number(v.integerValue)
          if ("mapValue" in v) return parseFirestoreDoc(v.mapValue as Record<string, unknown>)
          return v
        }) || []
    } else if ("mapValue" in value) {
      parsed[key] = parseFirestoreDoc(value.mapValue as Record<string, unknown>)
    }
  }

  return parsed
}

async function fetchAllDocuments(baseUrl: string): Promise<Record<string, unknown>[]> {
  const allDocuments: Record<string, unknown>[] = []
  let pageToken: string | undefined
  let pageCount = 0

  do {
    pageCount++
    const url = pageToken ? `${baseUrl}?pageSize=500&pageToken=${pageToken}` : `${baseUrl}?pageSize=500`
    const response = await fetchWithRetry(url)
    const data = await response.json()

    if (data.documents && Array.isArray(data.documents)) {
      allDocuments.push(...data.documents)
    }

    pageToken = data.nextPageToken
    if (pageCount > 20) break
  } while (pageToken)

  return allDocuments
}

export async function GET() {
  try {
    if (!FIREBASE_PROJECT_ID) {
      return NextResponse.json({
        items: [],
        source: "fallback-no-project",
        count: 0,
      })
    }

    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/menu_items`
    const documents = await fetchAllDocuments(url)

    const firebaseItems = documents.map((doc: Record<string, unknown>) => {
      const name = doc.name as string
      const id = name.split("/").pop()
      return { id, ...parseFirestoreDoc(doc) }
    })

    // If Firebase has items, use them exclusively (they are the source of truth)
    if (firebaseItems.length > 0) {
      return NextResponse.json({
        items: firebaseItems,
        source: "firebase",
        count: firebaseItems.length,
      })
    }

    // No Firebase data yet - use fallback
    return NextResponse.json({
      items: [],
      source: "fallback-empty-firebase",
      count: 0,
    })
  } catch (error) {
    return NextResponse.json({
      items: [],
      source: "fallback-error",
      count: 0,
    })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!FIREBASE_PROJECT_ID) {
      return NextResponse.json({ error: "Firebase not available" }, { status: 500 })
    }

    const firestoreDoc = {
      fields: Object.entries(body).reduce(
        (acc, [key, value]) => {
          if (typeof value === "string") acc[key] = { stringValue: value }
          else if (typeof value === "number") acc[key] = { doubleValue: value }
          else if (typeof value === "boolean") acc[key] = { booleanValue: value }
          else if (value === null) acc[key] = { nullValue: null }
          else if (Array.isArray(value)) {
            acc[key] = {
              arrayValue: {
                values: value.map((v) => {
                  if (typeof v === "string") return { stringValue: v }
                  if (typeof v === "number") return { doubleValue: v }
                  return { stringValue: String(v) }
                }),
              },
            }
          }
          return acc
        },
        {} as Record<string, unknown>,
      ),
    }

    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/menu_items`
    const response = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(firestoreDoc),
    })

    const data = await response.json()
    const id = (data.name as string)?.split("/").pop()

    return NextResponse.json({ id, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 })
  }
}
