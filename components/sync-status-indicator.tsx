"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { isFirebaseConfigured } from "@/lib/firebase"

export function SyncStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!isFirebaseConfigured()) {
    return null
  }

  return (
    <Badge variant={isOnline ? "default" : "destructive"} className="gap-1.5">
      {syncing ? (
        <>
          <RefreshCw className="h-3 w-3 animate-spin" />
          Syncing...
        </>
      ) : isOnline ? (
        <>
          <Wifi className="h-3 w-3" />
          Live
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          Offline
        </>
      )}
    </Badge>
  )
}
