"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Settings, Users, Palette, CreditCard, Database, Save } from "lucide-react"
import { useState } from "react"

export function SettingsManager() {
  const [settings, setSettings] = useState({
    siteName: "Curry&Burger",
    primaryColor: "#E78A00",
    secondaryColor: "#7B1E2D",
    enableNotifications: true,
    enableLoyalty: true,
    enableDelivery: true,
    enablePickup: true,
  })

  const handleSave = () => {
    alert("Settings saved successfully!")
  }

  return (
    <div className="space-y-6">
      {/* Branding Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>Branding</CardTitle>
          </div>
          <CardDescription>Customize your restaurant's appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Restaurant Name</Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-20 h-10"
                />
                <Input value={settings.primaryColor} readOnly />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  className="w-20 h-10"
                />
                <Input value={settings.secondaryColor} readOnly />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Features</CardTitle>
          </div>
          <CardDescription>Enable or disable app features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Send order updates to customers</p>
            </div>
            <Switch
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Loyalty Program</Label>
              <p className="text-sm text-muted-foreground">Enable points and rewards system</p>
            </div>
            <Switch
              checked={settings.enableLoyalty}
              onCheckedChange={(checked) => setSettings({ ...settings, enableLoyalty: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Delivery Orders</Label>
              <p className="text-sm text-muted-foreground">Accept delivery orders</p>
            </div>
            <Switch
              checked={settings.enableDelivery}
              onCheckedChange={(checked) => setSettings({ ...settings, enableDelivery: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pickup Orders</Label>
              <p className="text-sm text-muted-foreground">Accept pickup orders</p>
            </div>
            <Switch
              checked={settings.enablePickup}
              onCheckedChange={(checked) => setSettings({ ...settings, enablePickup: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Staff Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>Staff Accounts</CardTitle>
          </div>
          <CardDescription>Manage admin and staff access</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Manage Staff
          </Button>
        </CardContent>
      </Card>

      {/* Payment Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>Payment Integration</CardTitle>
          </div>
          <CardDescription>Configure payment providers</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">
            <CreditCard className="h-4 w-4 mr-2" />
            Configure Stripe
          </Button>
        </CardContent>
      </Card>

      {/* Database Backup */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Database Backup</CardTitle>
          </div>
          <CardDescription>Backup and restore your data</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">
            <Database className="h-4 w-4 mr-2" />
            Create Backup
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save All Settings
        </Button>
      </div>
    </div>
  )
}
