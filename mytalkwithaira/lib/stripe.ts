/**
 * Stripe Configuration
 * Handles Stripe client initialization and pricing configuration
 */

import Stripe from "stripe"

// Lazy initialization to avoid build-time errors
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    
    if (!stripeSecretKey) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable")
    }
    
    _stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-11-20.acacia",
      typescript: true,
    })
  }
  
  return _stripe
}

// Pricing configuration for £8.99/month Premium plan
export const STRIPE_PRICES = {
  premium: {
    name: "Premium",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM,
    amount: 899, // £8.99 in pence
    currency: "gbp",
    interval: "month",
  },
}

/**
 * Get Stripe Price ID for a plan
 */
export function getPriceId(plan: "premium"): string | null {
  return STRIPE_PRICES[plan].priceId || null
}

/**
 * Get price amount in pence
 */
export function getPriceAmount(plan: "premium"): number {
  return STRIPE_PRICES[plan].amount
}

