"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { User } from "@/types"
import { getFirebaseDb } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Edit2, Save, X } from "lucide-react"

interface ProfileInfoProps {
  user: User
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone || "")
  const [loading, setLoading] = useState(false)
  const { refreshUser } = useAuth()
  const { toast } = useToast()

  const handleSave = async () => {
    setLoading(true)
    const db = getFirebaseDb()

    if (!db) {
      // Store in localStorage for demo mode
      const demoUser = JSON.parse(localStorage.getItem(`user-${user.id}`) || JSON.stringify(user))
      demoUser.name = name
      demoUser.phone = phone
      demoUser.updatedAt = new Date().toISOString()
      localStorage.setItem(`user-${user.id}`, JSON.stringify(demoUser))

      toast({
        title: "Profile updated (Demo)",
        description: "Your profile information has been saved locally",
      })
      setIsEditing(false)
      setLoading(false)
      return
    }

    try {
      const { doc, updateDoc } = await import("firebase/firestore")
      await updateDoc(doc(db, "users", user.id), {
        name,
        phone,
        updatedAt: new Date(),
      })

      await refreshUser()

      toast({
        title: "Profile updated",
        description: "Your profile information has been saved",
      })

      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setName(user.name)
    setPhone(user.phone || "")
    setIsEditing(false)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Personal Information</h2>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)} className="bg-transparent">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={loading} className="bg-transparent">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} className="bg-[#E78A00] hover:bg-[#C67500] text-white">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditing} />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user.email} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+39 123 456 7890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!isEditing}
          />
        </div>

        <div>
          <Label>Account Type</Label>
          <div className="mt-2">
            <span className="inline-block px-3 py-1 bg-muted rounded-full text-sm font-medium capitalize">
              {user.role}
            </span>
          </div>
        </div>

        <div>
          <Label>Member Since</Label>
          <p className="text-sm text-muted-foreground mt-2">
            {user.createdAt &&
              new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
          </p>
        </div>
      </div>
    </Card>
  )
}
