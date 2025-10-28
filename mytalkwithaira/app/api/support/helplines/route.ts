import { NextRequest, NextResponse } from "next/server"

// ThroughLine API Sandbox - Free access to US and NZ helplines
const THROUGHLINE_API_URL = "https://api.throughlinecare.com/v1"
const THROUGHLINE_API_KEY = process.env.THROUGHLINE_API_KEY || "sandbox" // Use "sandbox" for free tier

// Country code mapping
const COUNTRY_CODES: Record<string, string> = {
  US: "United States",
  NZ: "New Zealand",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
}

// Fallback helplines for when API is unavailable or for countries not in sandbox
const FALLBACK_HELPLINES = {
  US: [
    {
      id: "988-lifeline",
      name: "988 Suicide & Crisis Lifeline",
      phone_number: "988",
      sms_number: "988",
      chat_url: "https://988lifeline.org/chat",
      url: "https://988lifeline.org",
      snippet: "Free, confidential support for people in distress, prevention and crisis resources.",
      topics: ["Suicidal thoughts", "Depression", "Anxiety", "Stress", "All topics"],
      human_support_types: ["Counselors", "Volunteers"],
      always_open: true,
      locations: {
        lvl0: "United States",
        lvl1: ["United States > _NATIONWIDE_"],
      },
    },
    {
      id: "crisis-text-line",
      name: "Crisis Text Line",
      phone_number: "",
      sms_number: "741741",
      chat_url: "https://www.crisistextline.org",
      url: "https://www.crisistextline.org",
      snippet: "Text HOME to 741741 for free, 24/7 crisis support in English & Spanish.",
      topics: ["Suicidal thoughts", "Anxiety", "Depression", "Self-harm", "Bullying", "All topics"],
      human_support_types: ["Counselors"],
      always_open: true,
      locations: {
        lvl0: "United States",
        lvl1: ["United States > _NATIONWIDE_"],
      },
    },
    {
      id: "nami-helpline",
      name: "NAMI HelpLine",
      phone_number: "1-800-950-6264",
      sms_number: "62640",
      chat_url: "",
      url: "https://www.nami.org/help",
      snippet: "Information, resource referrals and support for people living with mental health conditions.",
      topics: ["Depression", "Anxiety", "Stress", "Supporting others", "All topics"],
      human_support_types: ["Counselors", "Peers"],
      always_open: false,
      locations: {
        lvl0: "United States",
        lvl1: ["United States > _NATIONWIDE_"],
      },
    },
  ],
  NZ: [
    {
      id: "lifeline-nz",
      name: "Lifeline Aotearoa",
      phone_number: "0800 543 354",
      sms_number: "4357",
      chat_url: "",
      url: "https://www.lifeline.org.nz/",
      snippet: "Lifeline offers 24/7, free, and confidential support over the phone and text message.",
      topics: ["Suicidal thoughts", "Depression", "Anxiety", "Stress", "All topics"],
      human_support_types: ["Counselors", "Volunteers"],
      always_open: true,
      locations: {
        lvl0: "New Zealand",
        lvl1: ["New Zealand > _NATIONWIDE_"],
      },
    },
  ],
  GB: [
    {
      id: "samaritans-uk",
      name: "Samaritans",
      phone_number: "116 123",
      sms_number: "",
      chat_url: "",
      url: "https://www.samaritans.org/",
      snippet: "Whatever you're going through, a Samaritan will face it with you. We're here 24 hours a day, 365 days a year.",
      topics: ["Suicidal thoughts", "Depression", "Anxiety", "Loneliness", "All topics"],
      human_support_types: ["Volunteers"],
      always_open: true,
      locations: {
        lvl0: "United Kingdom",
        lvl1: ["United Kingdom > _NATIONWIDE_"],
      },
    },
  ],
  CA: [
    {
      id: "crisis-services-canada",
      name: "Crisis Services Canada",
      phone_number: "1-833-456-4566",
      sms_number: "45645",
      chat_url: "",
      url: "https://www.crisisservicescanada.ca/",
      snippet: "Free, 24/7 support for people in Canada experiencing a crisis.",
      topics: ["Suicidal thoughts", "Depression", "Anxiety", "Stress", "All topics"],
      human_support_types: ["Counselors"],
      always_open: true,
      locations: {
        lvl0: "Canada",
        lvl1: ["Canada > _NATIONWIDE_"],
      },
    },
  ],
  AU: [
    {
      id: "lifeline-au",
      name: "Lifeline Australia",
      phone_number: "13 11 14",
      sms_number: "0477 13 11 14",
      chat_url: "https://www.lifeline.org.au/crisis-chat/",
      url: "https://www.lifeline.org.au/",
      snippet: "24-hour crisis support and suicide prevention services.",
      topics: ["Suicidal thoughts", "Depression", "Anxiety", "Stress", "All topics"],
      human_support_types: ["Counselors", "Volunteers"],
      always_open: true,
      locations: {
        lvl0: "Australia",
        lvl1: ["Australia > _NATIONWIDE_"],
      },
    },
  ],
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get("country") || "US"
    const countryName = COUNTRY_CODES[country] || "United States"

    console.log(`[Support API] Fetching helplines for ${countryName}`)

    // For sandbox (free tier), only US and NZ are available via API
    // For other countries, use fallback data
    if (country !== "US" && country !== "NZ") {
      console.log(`[Support API] Using fallback data for ${country}`)
      return NextResponse.json({
        helplines: FALLBACK_HELPLINES[country] || FALLBACK_HELPLINES.US,
        source: "fallback",
      })
    }

    // Try to fetch from ThroughLine API (sandbox)
    try {
      const apiUrl = `${THROUGHLINE_API_URL}/helplines?country=${country}`
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      // Only add API key if not using sandbox
      if (THROUGHLINE_API_KEY && THROUGHLINE_API_KEY !== "sandbox") {
        headers["Authorization"] = `Bearer ${THROUGHLINE_API_KEY}`
      }

      const response = await fetch(apiUrl, {
        headers,
        next: { revalidate: 3600 }, // Cache for 1 hour
      })

      if (!response.ok) {
        throw new Error(`ThroughLine API error: ${response.status}`)
      }

      const data = await response.json()
      console.log(`[Support API] Fetched ${data.helplines?.length || 0} helplines from ThroughLine`)

      return NextResponse.json({
        helplines: data.helplines || [],
        source: "throughline",
      })
    } catch (apiError) {
      console.warn("[Support API] ThroughLine API failed, using fallback:", apiError)
      return NextResponse.json({
        helplines: FALLBACK_HELPLINES[country] || FALLBACK_HELPLINES.US,
        source: "fallback",
      })
    }
  } catch (error) {
    console.error("[Support API] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch helplines",
        helplines: FALLBACK_HELPLINES.US,
        source: "fallback",
      },
      { status: 500 }
    )
  }
}

