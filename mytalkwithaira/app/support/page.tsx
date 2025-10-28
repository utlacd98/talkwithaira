"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sparkles, ArrowLeft, Phone, MessageSquare, Globe, Heart, Search, MapPin, Loader2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

interface Helpline {
  id: string
  name: string
  phone_number?: string
  sms_number?: string
  chat_url?: string
  url?: string
  whatsapp_url?: string
  snippet: string
  topics: string[]
  human_support_types: string[]
  always_open: boolean
  locations: {
    lvl0: string
    lvl1: string[]
  }
}

export default function SupportPage() {
  const { user, logout } = useAuth()
  const [helplines, setHelplines] = useState<Helpline[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [locationQuery, setLocationQuery] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("US")
  const [selectedTopic, setSelectedTopic] = useState("All topics")
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const detectLocationAndSearch = async () => {
    setIsDetectingLocation(true)
    setLoading(true)
    try {
      // Try to get user's location from IP
      const response = await fetch("https://ipapi.co/json/")
      const data = await response.json()

      if (data.city && data.region && data.country_code) {
        const location = `${data.city}, ${data.region}`
        setDetectedLocation(location)
        setLocationQuery(location)
        setSelectedCountry(data.country_code)

        // Load helplines for detected country
        await loadHelplines(data.country_code)
        setHasSearched(true)
      } else {
        // Fallback to US if detection fails
        setSelectedCountry("US")
        await loadHelplines("US")
        setHasSearched(true)
      }
    } catch (error) {
      console.log("Could not detect location:", error)
      // Fallback to US
      setSelectedCountry("US")
      await loadHelplines("US")
      setHasSearched(true)
    } finally {
      setIsDetectingLocation(false)
      setLoading(false)
    }
  }

  const loadHelplines = async (country?: string) => {
    setLoading(true)
    try {
      const countryCode = country || selectedCountry
      const response = await fetch(`/api/support/helplines?country=${countryCode}`)
      const data = await response.json()
      setHelplines(data.helplines || [])
      setHasSearched(true)
    } catch (error) {
      console.error("Failed to load helplines:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredHelplines = helplines.filter((helpline) => {
    const matchesSearch = helpline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         helpline.snippet.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTopic = selectedTopic === "All topics" || helpline.topics.includes(selectedTopic)

    // Filter by location if specified
    let matchesLocation = true
    if (locationQuery.trim()) {
      const locationLower = locationQuery.toLowerCase()
      const locations = helpline.locations.lvl1.join(" ").toLowerCase()
      matchesLocation = locations.includes(locationLower) ||
                       locations.includes("_nationwide_") ||
                       helpline.name.toLowerCase().includes(locationLower)
    }

    return matchesSearch && matchesTopic && matchesLocation
  })

  const topics = ["All topics", "Suicidal thoughts", "Anxiety", "Depression", "Abuse & domestic violence", 
                  "Self-harm", "Stress", "Relationships", "Grief & loss", "Trauma & PTSD"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
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
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold font-heading">Support Resources</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">You're Not Alone</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find verified mental health helplines and crisis support in your area. All services listed are free, confidential, and available 24/7.
          </p>
        </div>

        {/* Find Helplines Button */}
        {!hasSearched ? (
          <Card className="glass-card mb-6">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Find Helplines in Your Area</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    We'll automatically detect your location and show you the most relevant mental health resources and crisis helplines near you.
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={detectLocationAndSearch}
                  disabled={isDetectingLocation}
                  className="text-lg px-8 py-6 h-auto"
                >
                  {isDetectingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                      Detecting Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-5 w-5" />
                      Find Helplines Near Me
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {detectedLocation && `Detected: ${detectedLocation}`}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card mb-6">
            <CardContent className="pt-6">
              <div className="grid gap-4">
                {/* Location Display */}
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium">
                      {locationQuery || detectedLocation || "Location not detected"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setHasSearched(false)
                      setHelplines([])
                      setLocationQuery("")
                    }}
                  >
                    Change Location
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Topic Filter */}
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {topics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>

                  {/* Search Helplines */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search helplines..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Banner */}
        <Card className="mb-6 border-red-500/50 bg-red-500/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-red-500 mb-1">In Crisis? Call Now</h3>
                <p className="text-sm mb-2">If you're in immediate danger or having thoughts of suicide:</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="destructive" size="sm" asChild>
                    <a href="tel:988">
                      <Phone className="w-4 h-4 mr-2" />
                      Call 988 (US)
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="sms:988">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Text 988
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Helplines List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredHelplines.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No helplines found. Try adjusting your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredHelplines.map((helpline) => (
              <Card key={helpline.id} className="glass-card hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{helpline.name}</CardTitle>
                      <CardDescription className="text-sm">{helpline.snippet}</CardDescription>
                    </div>
                    {helpline.always_open && (
                      <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-medium whitespace-nowrap">
                        24/7
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {helpline.topics.slice(0, 3).map((topic) => (
                      <span key={topic} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                        {topic}
                      </span>
                    ))}
                    {helpline.topics.length > 3 && (
                      <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                        +{helpline.topics.length - 3} more
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {helpline.phone_number && (
                      <Button variant="default" size="sm" asChild>
                        <a href={`tel:${helpline.phone_number}`}>
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </a>
                      </Button>
                    )}
                    {helpline.sms_number && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`sms:${helpline.sms_number}`}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Text
                        </a>
                      </Button>
                    )}
                    {helpline.chat_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={helpline.chat_url} target="_blank" rel="noopener noreferrer">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat
                        </a>
                      </Button>
                    )}
                    {helpline.url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={helpline.url} target="_blank" rel="noopener noreferrer">
                          <Globe className="w-4 h-4 mr-2" />
                          Website
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <Card className="glass-card mt-8">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              Helpline data provided by{" "}
              <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Find a Helpline
              </a>
              {" "}and{" "}
              <a href="https://www.throughlinecare.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                ThroughLine
              </a>
              . All helplines are verified and regularly updated.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

