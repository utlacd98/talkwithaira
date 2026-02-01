/**
 * Vercel Analytics Custom Event Tracking
 * Uses @vercel/analytics to track user actions and conversions
 */

import { track } from '@vercel/analytics'

// ============================================
// AUTH EVENTS
// ============================================

export function trackSignupStarted(method: 'google' | 'email' = 'google') {
  track('Signup Started', { method })
}

export function trackSignupCompleted(method: 'google' | 'email' = 'google', plan: string = 'free') {
  track('Signup Completed', { method, plan })
}

export function trackLoginStarted(method: 'google' | 'email' = 'google') {
  track('Login Started', { method })
}

export function trackLoginCompleted(method: 'google' | 'email' = 'google') {
  track('Login Completed', { method })
}

export function trackLogout() {
  track('Logout')
}

// ============================================
// CHAT EVENTS
// ============================================

export function trackChatStarted() {
  track('Chat Started')
}

export function trackMessageSent(messageLength: number) {
  track('Message Sent', { 
    messageLength,
    category: messageLength < 50 ? 'short' : messageLength < 200 ? 'medium' : 'long'
  })
}

export function trackVoiceModeStarted() {
  track('Voice Mode Started')
}

export function trackVoiceModeEnded(duration: number) {
  track('Voice Mode Ended', { duration })
}

export function trackVoiceMessageSent() {
  track('Voice Message Sent')
}

// ============================================
// CONVERSION EVENTS
// ============================================

export function trackPricingViewed() {
  track('Pricing Viewed')
}

export function trackPlanSelected(plan: 'free' | 'plus' | 'premium') {
  track('Plan Selected', { plan })
}

export function trackCheckoutStarted(plan: string, price: number) {
  track('Checkout Started', { plan, price })
}

export function trackCheckoutCompleted(plan: string, price: number) {
  track('Checkout Completed', { plan, price })
}

export function trackCheckoutAbandoned(plan: string) {
  track('Checkout Abandoned', { plan })
}

export function trackUpgradeClicked(fromPlan: string, toPlan: string) {
  track('Upgrade Clicked', { fromPlan, toPlan })
}

// ============================================
// ENGAGEMENT EVENTS
// ============================================

export function trackBlogViewed(slug: string, title: string) {
  track('Blog Viewed', { slug, title })
}

export function trackFAQExpanded(question: string) {
  track('FAQ Expanded', { question })
}

export function trackMoodLogged(score: number) {
  track('Mood Logged', { 
    score,
    category: score <= 3 ? 'low' : score <= 6 ? 'medium' : 'high'
  })
}

export function trackAffirmationViewed() {
  track('Affirmation Viewed')
}

export function trackDashboardViewed() {
  track('Dashboard Viewed')
}

export function trackSettingsViewed() {
  track('Settings Viewed')
}

// ============================================
// SUPPORT EVENTS
// ============================================

export function trackSupportPageViewed() {
  track('Support Page Viewed')
}

export function trackSupportResourceViewed(resource: string) {
  track('Support Resource Viewed', { resource })
}

export function trackHelplineClicked(helplineName: string) {
  track('Helpline Clicked', { helplineName })
}

export function trackCrisisResourceClicked(resource: string) {
  track('Crisis Resource Clicked', { resource })
}

export function trackContactClicked(method: 'email' | 'phone' | 'social') {
  track('Contact Clicked', { method })
}

// ============================================
// GAMES EVENTS
// ============================================

export function trackGamesPageViewed() {
  track('Games Page Viewed')
}

export function trackGamePlayed(gameId: string, score: number) {
  track('Game Played', { gameId, score })
}

export function trackGameCompleted(gameId: string, result: 'win' | 'loss' | 'draw', score: number) {
  track('Game Completed', { gameId, result, score })
}

export function trackFeatureUsed(feature: string) {
  track('Feature Used', { feature })
}

// ============================================
// NAVIGATION EVENTS
// ============================================

export function trackCTAClicked(location: string, text: string) {
  track('CTA Clicked', { location, text })
}

export function trackExternalLinkClicked(url: string) {
  track('External Link Clicked', { url })
}

// ============================================
// ERROR EVENTS
// ============================================

export function trackError(errorType: string, message: string) {
  track('Error Occurred', { errorType, message })
}

