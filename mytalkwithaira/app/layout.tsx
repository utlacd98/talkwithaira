import type React from "react"
import { Montserrat, DM_Serif_Display, Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { Analytics } from "@vercel/analytics/next"
import { GoogleAnalytics } from "@next/third-parties/google"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
})

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata = {
  title: "Aira – Your AI Companion for Emotional Clarity & Calm",
  description:
    "Meet Aira, your empathetic AI friend that understands, reflects, and guides you with empathy. Chat instantly and discover calm in every conversation.",
  keywords: "Aira AI, mental health AI, empathetic chatbot, AI therapy, journaling companion, emotional support AI, AI friend, mental wellness",
  authors: [{ name: 'Aira Support' }],
  creator: 'Aira Support',
  publisher: 'Aira Support',
  generator: 'v0.app',
  applicationName: 'Aira',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/airalogo2.png',
    apple: '/airalogo2.png',
  },
  openGraph: {
    title: "Aira – Your AI Companion for Emotional Clarity & Calm",
    description: "Meet Aira, your empathetic AI friend that understands, reflects, and guides you with empathy. Chat instantly and discover calm in every conversation.",
    url: 'https://airasupport.com',
    siteName: 'Aira',
    images: [
      {
        url: 'https://airasupport.com/airalogo2.png',
        width: 1200,
        height: 630,
        alt: 'Aira - Your Empathetic AI Friend for Mental Wellness',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Aira – Your AI Companion for Emotional Clarity & Calm",
    description: "Meet Aira, your empathetic AI friend that understands, reflects, and guides you with empathy.",
    images: ['https://airasupport.com/airalogo2.png'],
    creator: '@AiraCompanion',
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Aira",
    "url": "https://airasupport.com",
    "logo": "https://airasupport.com/airalogo2.png",
    "description": "Your AI companion for emotional clarity and calm. Aira provides empathetic, judgment-free mental wellness support 24/7.",
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61584679914047",
      "https://x.com/AiraCompanion"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+44-7366-387613",
      "contactType": "customer support",
      "email": "airahelpdesk26@gmail.com",
      "areaServed": "GB",
      "availableLanguage": "English"
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${montserrat.variable} ${dmSerif.variable} ${inter.variable} font-sans`}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Analytics />
        <GoogleAnalytics gaId="G-9TJQ525QJ5" />
      </body>
    </html>
  )
}
