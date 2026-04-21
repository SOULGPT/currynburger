"use client"

import { useState, useEffect } from "react"
import { getFirebaseDb } from "@/lib/firebase"
import type { Branch } from "@/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Phone, Clock, Navigation } from "lucide-react"

export function BranchLocator() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchBranches = async () => {
      const db = getFirebaseDb()

      if (!db) {
        setBranches(mockBranches)
        setLoading(false)
        return
      }

      try {
        const { collection, getDocs } = await import("firebase/firestore")
        const snapshot = await getDocs(collection(db, "branches"))
        const branchData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Branch[]
        setBranches(branchData.length > 0 ? branchData : mockBranches)
      } catch (error) {
        // Use mock data if Firebase fails
        setBranches(mockBranches)
      } finally {
        setLoading(false)
      }
    }

    fetchBranches()
  }, [])

  const filteredBranches = branches.filter(
    (branch) =>
      (branch.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (branch.address || "").toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Loading branches...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search by location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Map Placeholder */}
      <Card className="p-6 bg-muted">
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-[#E78A00]" />
            <p className="text-muted-foreground">Map view coming soon</p>
            <p className="text-sm text-muted-foreground mt-2">Integrate with Google Maps or Mapbox</p>
          </div>
        </div>
      </Card>

      {/* Branches List */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredBranches.map((branch) => (
          <Card key={branch.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">{branch.name}</h3>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{branch.address}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-[#E78A00]" />
                <span>{branch.phone}</span>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <Clock className="w-4 h-4 mt-0.5 text-[#E78A00] flex-shrink-0" />
                <div>
                  <p className="font-medium">Open Today</p>
                  <p className="text-muted-foreground">
                    {branch.openHours?.monday?.open || "10:00"} - {branch.openHours?.monday?.close || "23:00"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-[#E78A00] hover:bg-[#C67500] text-white">
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredBranches.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No branches found matching your search</p>
        </div>
      )}
    </div>
  )
}

// Mock branches data
const mockBranches: Branch[] = [
  {
    id: "1",
    name: "Curry&Burger Rome Centro",
    address: "Via del Corso 123, Rome, 00186",
    phone: "+39 06 1234 5678",
    lat: 41.9028,
    lng: 12.4964,
    openHours: {
      monday: { open: "10:00", close: "23:00" },
      tuesday: { open: "10:00", close: "23:00" },
      wednesday: { open: "10:00", close: "23:00" },
      thursday: { open: "10:00", close: "23:00" },
      friday: { open: "10:00", close: "00:00" },
      saturday: { open: "10:00", close: "00:00" },
      sunday: { open: "11:00", close: "23:00" },
    },
    isActive: true,
  },
  {
    id: "2",
    name: "Curry&Burger Milan Duomo",
    address: "Piazza del Duomo 5, Milan, 20121",
    phone: "+39 02 9876 5432",
    lat: 45.464,
    lng: 9.19,
    openHours: {
      monday: { open: "10:00", close: "23:00" },
      tuesday: { open: "10:00", close: "23:00" },
      wednesday: { open: "10:00", close: "23:00" },
      thursday: { open: "10:00", close: "23:00" },
      friday: { open: "10:00", close: "00:00" },
      saturday: { open: "10:00", close: "00:00" },
      sunday: { open: "11:00", close: "23:00" },
    },
    isActive: true,
  },
  {
    id: "3",
    name: "Curry&Burger Florence Centro",
    address: "Via dei Calzaiuoli 89, Florence, 50122",
    phone: "+39 055 1234 5678",
    lat: 43.7696,
    lng: 11.2558,
    openHours: {
      monday: { open: "10:00", close: "23:00" },
      tuesday: { open: "10:00", close: "23:00" },
      wednesday: { open: "10:00", close: "23:00" },
      thursday: { open: "10:00", close: "23:00" },
      friday: { open: "10:00", close: "00:00" },
      saturday: { open: "10:00", close: "00:00" },
      sunday: { open: "11:00", close: "23:00" },
    },
    isActive: true,
  },
  {
    id: "4",
    name: "Curry&Burger Naples Spaccanapoli",
    address: "Via Benedetto Croce 45, Naples, 80134",
    phone: "+39 081 9876 5432",
    lat: 40.8518,
    lng: 14.2681,
    openHours: {
      monday: { open: "10:00", close: "23:00" },
      tuesday: { open: "10:00", close: "23:00" },
      wednesday: { open: "10:00", close: "23:00" },
      thursday: { open: "10:00", close: "23:00" },
      friday: { open: "10:00", close: "00:00" },
      saturday: { open: "10:00", close: "00:00" },
      sunday: { open: "11:00", close: "23:00" },
    },
    isActive: true,
  },
]
