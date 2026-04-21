"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, MapPin, Settings, LogOut, ShoppingBag } from "lucide-react"
import { ProfileInfo } from "./profile-info"
import { LoyaltyCard } from "./loyalty-card"
import { SavedAddresses } from "./saved-addresses"
import { OrderHistory } from "./order-history"
import { AccountSettings } from "./account-settings"

export function ProfileContent() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  if (!user) {
    return (
      <div className="container px-4 py-16 mx-auto max-w-4xl text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <User className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Sign in to view your profile</h2>
        <p className="text-muted-foreground mb-8">Access your orders, loyalty points, and saved addresses</p>
        <Button
          size="lg"
          className="bg-[#E78A00] hover:bg-[#C67500] text-white"
          onClick={() => router.push("/auth/login?redirect=/profile")}
        >
          Sign In
        </Button>
      </div>
    )
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <div className="container px-4 py-8 mx-auto max-w-6xl">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#E78A00] to-[#7B1E2D] flex items-center justify-center">
              <span className="text-2xl md:text-3xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{user.name}</h1>
              <p className="text-sm md:text-base text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Button variant="outline" onClick={handleSignOut} className="bg-transparent w-full md:w-auto">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Loyalty Card */}
      <LoyaltyCard user={user} />

      {/* Tabs */}
      <Tabs defaultValue="orders" className="mt-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 max-w-full md:max-w-2xl gap-2">
          <TabsTrigger value="orders" className="text-xs md:text-sm">
            <ShoppingBag className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Orders</span>
            <span className="sm:hidden">Orders</span>
          </TabsTrigger>
          <TabsTrigger value="info" className="text-xs md:text-sm">
            <User className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Info</span>
            <span className="sm:hidden">Info</span>
          </TabsTrigger>
          <TabsTrigger value="addresses" className="text-xs md:text-sm">
            <MapPin className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Addresses</span>
            <span className="sm:hidden">Address</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs md:text-sm">
            <Settings className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          <OrderHistory userId={user.id} />
        </TabsContent>

        <TabsContent value="info" className="mt-6">
          <ProfileInfo user={user} />
        </TabsContent>

        <TabsContent value="addresses" className="mt-6">
          <SavedAddresses user={user} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <AccountSettings user={user} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
