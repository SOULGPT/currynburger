"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { User, Address } from "@/types"
import { getFirebaseDb } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Plus, Trash2, Home } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface SavedAddressesProps {
  user: User
}

export function SavedAddresses({ user }: SavedAddressesProps) {
  const [addresses, setAddresses] = useState<Address[]>(user.addresses || [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const { refreshUser } = useAuth()
  const { toast } = useToast()

  // Form state
  const [label, setLabel] = useState("")
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")

  const resetForm = () => {
    setLabel("")
    setStreet("")
    setCity("")
    setPostalCode("")
    setEditingAddress(null)
  }

  const handleAddAddress = async () => {
    const newAddress: Address = {
      id: Date.now().toString(),
      label: label || "Home",
      street,
      city,
      postalCode,
      isDefault: addresses.length === 0,
    }

    const updatedAddresses = [...addresses, newAddress]
    const db = getFirebaseDb()

    if (!db) {
      // Store in localStorage for demo mode
      localStorage.setItem(`addresses-${user.id}`, JSON.stringify(updatedAddresses))
      setAddresses(updatedAddresses)
      toast({
        title: "Address added (Demo)",
        description: "Your new address has been saved locally",
      })
      setIsDialogOpen(false)
      resetForm()
      return
    }

    try {
      const { doc, updateDoc } = await import("firebase/firestore")
      await updateDoc(doc(db, "users", user.id), {
        addresses: updatedAddresses,
        updatedAt: new Date(),
      })

      setAddresses(updatedAddresses)
      await refreshUser()

      toast({
        title: "Address added",
        description: "Your new address has been saved",
      })

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add address",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    const updatedAddresses = addresses.filter((addr) => addr.id !== addressId)
    const db = getFirebaseDb()

    if (!db) {
      localStorage.setItem(`addresses-${user.id}`, JSON.stringify(updatedAddresses))
      setAddresses(updatedAddresses)
      toast({
        title: "Address deleted (Demo)",
        description: "The address has been removed locally",
      })
      return
    }

    try {
      const { doc, updateDoc } = await import("firebase/firestore")
      await updateDoc(doc(db, "users", user.id), {
        addresses: updatedAddresses,
        updatedAt: new Date(),
      })

      setAddresses(updatedAddresses)
      await refreshUser()

      toast({
        title: "Address deleted",
        description: "The address has been removed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      })
    }
  }

  const handleSetDefault = async (addressId: string) => {
    const updatedAddresses = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === addressId,
    }))
    const db = getFirebaseDb()

    if (!db) {
      localStorage.setItem(`addresses-${user.id}`, JSON.stringify(updatedAddresses))
      setAddresses(updatedAddresses)
      toast({
        title: "Default address updated (Demo)",
        description: "This address is now your default",
      })
      return
    }

    try {
      const { doc, updateDoc } = await import("firebase/firestore")
      await updateDoc(doc(db, "users", user.id), {
        addresses: updatedAddresses,
        updatedAt: new Date(),
      })

      setAddresses(updatedAddresses)
      await refreshUser()

      toast({
        title: "Default address updated",
        description: "This address is now your default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update default address",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Saved Addresses</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#E78A00] hover:bg-[#C67500] text-white" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
              <DialogDescription>Enter your delivery address details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  placeholder="Home, Work, etc."
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  placeholder="123 Main Street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Rome" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="postal">Postal Code</Label>
                  <Input
                    id="postal"
                    placeholder="00100"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
              </div>
              <Button className="w-full bg-[#E78A00] hover:bg-[#C67500] text-white" onClick={handleAddAddress}>
                Save Address
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card className="p-12 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No saved addresses</h3>
          <p className="text-muted-foreground mb-6">Add an address to make checkout faster</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E78A00]/10 flex items-center justify-center">
                    <Home className="w-5 h-5 text-[#E78A00]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{address.label}</h3>
                    {address.isDefault && <Badge className="bg-[#00C897] text-white text-xs mt-1">Default</Badge>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteAddress(address.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-sm text-muted-foreground mb-4">
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.postalCode}
                </p>
              </div>

              {!address.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                  onClick={() => handleSetDefault(address.id)}
                >
                  Set as Default
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
