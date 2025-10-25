"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Sparkles, ArrowLeft, User, Bell, Shield, Palette, Crown } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export function SettingsContent() {
  const { user, logout, updateSubscription } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [notifications, setNotifications] = useState(true)
  const [dataSharing, setDataSharing] = useState(false)

  const handleSave = () => {
    // Save settings logic here
    alert("Settings saved successfully!")
  }

  const handleCancelSubscription = () => {
    if (confirm("Are you sure you want to cancel your subscription? You'll lose access to premium features.")) {
      updateSubscription("free")
      alert("Subscription cancelled. You've been moved to the Free plan.")
    }
  }

  const planDetails = {
    free: { name: "Free Plan", price: "£0", features: "10 chats/day, mood tracker, basic responses" },
    plus: { name: "Aira Plus", price: "£4.99/month", features: "Unlimited chats, mood tracking, dark mode, prompts" },
    premium: { name: "Aira Premium", price: "£8.99/month", features: "Everything in Plus, AI insights, affirmations, multi-language, priority support" },
  }

  const currentPlan = user?.plan ? planDetails[user.plan] : planDetails.free

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold font-heading">Settings</h1>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <Button onClick={handleSave}>Save Changes</Button>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-accent" />
                Appearance
              </CardTitle>
              <CardDescription>Customize how Aira looks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive reminders to check in with Aira</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Control your data and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Data Sharing</p>
                  <p className="text-sm text-muted-foreground">Help improve Aira by sharing anonymous usage data</p>
                </div>
                <Switch checked={dataSharing} onCheckedChange={setDataSharing} />
              </div>
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full bg-transparent">
                  Change Password
                </Button>
              </div>
              <div>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card className="glass-card border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-accent" />
                Subscription
              </CardTitle>
              <CardDescription>Manage your Aira subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-lg">{currentPlan.name} Plan</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {currentPlan.price}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{currentPlan.features}</p>
              </div>

              <div className="space-y-2">
                <Link href="/pricing">
                  <Button variant="outline" className="w-full bg-transparent">
                    {user?.plan === "free" ? "Upgrade Plan" : "Change Plan"}
                  </Button>
                </Link>

                {user?.plan !== "free" && (
                  <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleCancelSubscription}>
                    Cancel Subscription
                  </Button>
                )}
              </div>

              <div className="pt-4 border-t text-sm text-muted-foreground">
                <p>
                  {user?.plan === "free"
                    ? "Upgrade to unlock unlimited conversations and advanced features."
                    : "Your subscription renews automatically. Cancel anytime."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
