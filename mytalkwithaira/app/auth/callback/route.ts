import { createClient } from '@/lib/supabase-client'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[OAuth Callback] Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    if (data.user) {
      console.log('[OAuth Callback] User authenticated:', data.user.email)

      // Register user in our system
      try {
        const response = await fetch(`${origin}/api/auth/register-oauth-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          }),
        })

        if (!response.ok) {
          console.warn('[OAuth Callback] Failed to register user in system')
        }
      } catch (err) {
        console.warn('[OAuth Callback] Error registering user:', err)
      }

      // Redirect to dashboard
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}

