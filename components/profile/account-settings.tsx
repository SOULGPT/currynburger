"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react"
import type { User } from "@/types"
import { useState } from "react"

interface AccountSettingsProps {
  user: User
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [promotionalEmails, setPromotionalEmails] = useState(true)

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">Notification Preferences</h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E78A00]/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#E78A00]" />
              </div>
              <div>
                <Label htmlFor="email-notif" className="text-base font-semibold cursor-pointer">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Receive order updates via email</p>
              </div>
            </div>
            <Switch id="email-notif" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E78A00]/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#E78A00]" />
              </div>
              <div>
                <Label htmlFor="push-notif" className="text-base font-semibold cursor-pointer">
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Get real-time order updates</p>
              </div>
            </div>
            <Switch id="push-notif" checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E78A00]/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-[#E78A00]" />
              </div>
              <div>
                <Label htmlFor="sms-notif" className="text-base font-semibold cursor-pointer">
                  SMS Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Receive text message updates</p>
              </div>
            </div>
            <Switch id="sms-notif" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E78A00]/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#E78A00]" />
              </div>
              <div>
                <Label htmlFor="promo-emails" className="text-base font-semibold cursor-pointer">
                  Promotional Emails
                </Label>
                <p className="text-sm text-muted-foreground">Get exclusive deals and offers</p>
              </div>
            </div>
            <Switch id="promo-emails" checked={promotionalEmails} onCheckedChange={setPromotionalEmails} />
          </div>
        </div>

        <Button className="w-full mt-6 bg-[#E78A00] hover:bg-[#C67500] text-white">Save Preferences</Button>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Account Actions</h2>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start bg-transparent">
            Change Password
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
          >
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  )
}
