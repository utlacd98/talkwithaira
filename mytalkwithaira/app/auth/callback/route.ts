import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const origin = requestUrl.origin

  console.log('[OAuth Callback] Received callback with code:', !!code, 'error:', error)

  // Check if there was an OAuth error from the provider
  if (error) {
    console.error('[OAuth Callback] OAuth provider error:', error, errorDescription)
    return NextResponse.redirect(`${origin}/login?error=${error}`)
  }

  if (code) {
    const supabase = await createClient()

    console.log('[OAuth Callback] Exchanging code for session...')
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[OAuth Callback] Error exchanging code for session:', exchangeError)
      return NextResponse.redirect(`${origin}/login?error=auth_failed&details=${encodeURIComponent(exchangeError.message)}`)
    }

    if (data.user && data.session) {
      console.log('[OAuth Callback] ✅ User authenticated:', data.user.email)
      console.log('[OAuth Callback] Session established, access_token length:', data.session.access_token?.length)

      // Register user in our system (don't wait for it)
      fetch(`${origin}/api/auth/register-oauth-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
        }),
      }).catch(err => console.warn('[OAuth Callback] Error registering user:', err))

      // Redirect directly to dashboard
      // Supabase SSR will handle setting the cookies automatically
      console.log('[OAuth Callback] Redirecting to dashboard')
      return NextResponse.redirect(`${origin}/dashboard`)
    } else {
      console.error('[OAuth Callback] No user or session in response')
    }
  }

  // Return the user to an error page with some instructions
  console.error('[OAuth Callback] No code provided, redirecting to login')
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}

