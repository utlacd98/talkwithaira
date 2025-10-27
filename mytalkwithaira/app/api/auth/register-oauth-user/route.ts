import { NextResponse } from "next/server"
import { registerUser } from "@/lib/user-profile-registry"

export async function POST(request: Request) {
  try {
    const { userId, email, name } = await request.json()

    console.log("[Register OAuth User] Registering user:", { userId, email, name })

    // Register user with free plan
    await registerUser(email, userId, name, "free")

    console.log("[Register OAuth User] User registered successfully")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Register OAuth User] Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to register user" },
      { status: 500 }
    )
  }
}

