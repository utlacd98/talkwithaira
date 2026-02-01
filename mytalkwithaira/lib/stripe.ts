/**
 * Stripe Configuration
 * Handles Stripe client initialization and pricing configuration
 */

import Stripe from "stripe"

// Lazy initialization to avoid build-time errors
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim()

    if (!stripeSecretKey) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable")
    }

    console.log("[Stripe] Initializing with key prefix:", stripeSecretKey.substring(0, 20))
    console.log("[Stripe] Key length:", stripeSecretKey.length)

    _stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
      typescript: true,
    })
  }

  return _stripe
}

// Pricing configuration for £2.99/month Premium subscription
export const STRIPE_PRICES = {
  premium: {
    name: "Premium",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || "price_1SZdjcFbb6V4jtxGeyAyqLoU",
    amount: 299, // £2.99 in pence
    currency: "gbp",
    interval: "month",
    description: "Unlimited chats with Aira",
  },
}

/**
 * Get Stripe Price ID for a plan
 */
export function getPriceId(plan: "premium"): string | null {
  const priceId = STRIPE_PRICES[plan].priceId
  return priceId ? priceId.trim() : null
}

/**
 * Get price amount in pence
 */
export function getPriceAmount(plan: "premium"): number {
  return STRIPE_PRICES[plan].amount
}

