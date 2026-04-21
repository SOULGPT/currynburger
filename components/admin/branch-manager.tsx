"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Loader2, MapPin } from "lucide-react"
import { useState, useEffect } from "react"
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase"
import type { Branch } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

function getLocalBranches(): Branch[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("demoBranches")
    if (stored) return JSON.parse(stored)
  } catch {}
  return [
    {
      id: "branch-1",
      name: "Curry&Burger Main",
      address: "123 Main Street, City Center",
      phone: "+1 234 567 8900",
      lat: 51.5074,
      lng: -0.1278,
      openHours: { monday: "10:00 AM - 10:00 PM" },
    },
  ]
}

function saveLocalBranches(branches: Branch[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem("demoBranches", JSON.stringify(branches))
  } catch {}
}

export function BranchManager() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true

    const fetchBranches = async () => {
      const localBranches = getLocalBranches()
      if (mounted) {
        setBranches(localBranches)
      }

      if (!isFirebaseConfigured()) {
        if (mounted) setLoading(false)
        return
      }

      try {
        const db = await getFirebaseDb()
        if (!db) {
          if (mounted) setLoading(false)
          return
        }

        const { collection, getDocs } = await import("firebase/firestore")
        const branchesRef = collection(db, "branches")
        const snapshot = await getDocs(branchesRef)
        const branchesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Branch[]

        if (mounted && branchesData.length > 0) {
          setBranches(branchesData)
        }
      } catch (error) {
        console.error("Error fetching branches:", error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchBranches()
    return () => {
      mounted = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const branchData = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      lat: Number.parseFloat(formData.get("lat") as string) || 0,
      lng: Number.parseFloat(formData.get("lng") as string) || 0,
      openHours: {
        monday: formData.get("hours") as string,
        tuesday: formData.get("hours") as string,
        wednesday: formData.get("hours") as string,
        thursday: formData.get("hours") as string,
        friday: formData.get("hours") as string,
        saturday: formData.get("hours") as string,
        sunday: formData.get("hours") as string,
      },
    }

    try {
      const db = await getFirebaseDb()

      if (editingBranch) {
        // Update existing branch
        if (db) {
          const { doc, updateDoc } = await import("firebase/firestore")
          await updateDoc(doc(db, "branches", editingBranch.id), branchData)
        }
        // Update local
        const updated = branches.map((b) => (b.id === editingBranch.id ? { ...b, ...branchData } : b))
        setBranches(updated)
        saveLocalBranches(updated)
        toast({ title: "Branch updated successfully" })
      } else {
        // Add new branch
        const newId = `branch-${Date.now()}`
        if (db) {
          const { collection, addDoc } = await import("firebase/firestore")
          const docRef = await addDoc(collection(db, "branches"), branchData)
          const newBranch = { id: docRef.id, ...branchData }
          const updated = [...branches, newBranch]
          setBranches(updated)
          saveLocalBranches(updated)
        } else {
          const newBranch = { id: newId, ...branchData }
          const updated = [...branches, newBranch]
          setBranches(updated)
          saveLocalBranches(updated)
        }
        toast({ title: "Branch added successfully" })
      }

      setDialogOpen(false)
      setEditingBranch(null)
    } catch (error) {
      console.error("Error saving branch:", error)
      toast({ title: "Error saving branch", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this branch?")) return

    try {
      const db = await getFirebaseDb()
      if (db) {
        const { deleteDoc, doc } = await import("firebase/firestore")
        await deleteDoc(doc(db, "branches", id))
      }
      // Update local
      const updated = branches.filter((b) => b.id !== id)
      setBranches(updated)
      saveLocalBranches(updated)
      toast({ title: "Branch deleted successfully" })
    } catch (error) {
      console.error("Error deleting branch:", error)
      toast({ title: "Error deleting branch", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Branch Locations</CardTitle>
              <CardDescription>Manage your restaurant branches</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingBranch(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Branch
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingBranch ? "Edit Branch" : "Add New Branch"}</DialogTitle>
                  <DialogDescription>
                    {editingBranch ? "Update the branch details" : "Add a new branch location"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Branch Name</Label>
                    <Input id="name" name="name" defaultValue={editingBranch?.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" defaultValue={editingBranch?.address} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" defaultValue={editingBranch?.phone} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lat">Latitude</Label>
                      <Input id="lat" name="lat" type="number" step="any" defaultValue={editingBranch?.lat} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lng">Longitude</Label>
                      <Input id="lng" name="lng" type="number" step="any" defaultValue={editingBranch?.lng} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hours">Opening Hours</Label>
                    <Input
                      id="hours"
                      name="hours"
                      placeholder="e.g., 10:00 AM - 10:00 PM"
                      defaultValue={editingBranch?.openHours?.monday}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editingBranch ? "Update" : "Add"} Branch
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {branches.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No branches added yet</p>
              </div>
            ) : (
              branches.map((branch) => (
                <Card key={branch.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{branch.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{branch.address}</p>
                        <p className="text-sm text-muted-foreground">{branch.phone}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Hours: {branch.openHours?.monday || "Not set"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingBranch(branch)
                            setDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(branch.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
