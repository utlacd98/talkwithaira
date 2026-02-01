import { NextResponse } from "next/server"

/**
 * Debug endpoint to check environment variables
 * IMPORTANT: Remove this in production!
 */
export async function GET() {
  const envVars = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasSupabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasStripePublishable: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
    hasStripePriceId: !!process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM,
    hasStripeWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasKV: !!process.env.KV_REST_API_URL,
    
    // Show first few characters (safe for debugging)
    supabaseUrlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) || "missing",
    stripePublishablePrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 10) || "missing",
  }

  return NextResponse.json(envVars)
}

