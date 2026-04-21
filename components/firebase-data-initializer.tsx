"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Database, CheckCircle2 } from "lucide-react"
import { initializeMenuData } from "@/lib/firebase-menu"
import { isFirebaseConfigured } from "@/lib/firebase"

export function FirebaseDataInitializer() {
  const [initializing, setInitializing] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInitialize = async () => {
    setInitializing(true)
    setError(null)

    try {
      await initializeMenuData([], [])
      setInitialized(true)
    } catch (err) {
      console.error("[v0] Error initializing data:", err)
      setError("Failed to initialize data. Please try again.")
    } finally {
      setInitializing(false)
    }
  }

  if (!isFirebaseConfigured()) {
    return null
  }

  if (initialized) {
    return (
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">Data Initialized Successfully</h3>
            <p className="text-sm text-green-700">
              Your menu data has been synced to Firebase. Changes will now sync in real-time.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-blue-50 border-blue-200">
      <div className="flex items-start gap-4">
        <Database className="h-6 w-6 text-blue-600 mt-1" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-2">Initialize Firebase Data</h3>
          <p className="text-sm text-blue-700 mb-4">
            Click the button below to sync your menu data to Firebase. This enables real-time updates between admin and
            customer apps.
          </p>
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          <Button onClick={handleInitialize} disabled={initializing} className="bg-blue-600 hover:bg-blue-700">
            {initializing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Initialize Data
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
