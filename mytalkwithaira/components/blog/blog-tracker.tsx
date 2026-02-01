"use client"

import { useEffect } from "react"
import { trackBlogViewed } from "@/lib/vercel-analytics"

interface BlogTrackerProps {
  slug: string
  title: string
}

export function BlogTracker({ slug, title }: BlogTrackerProps) {
  useEffect(() => {
    trackBlogViewed(slug, title)
  }, [slug, title])

  return null
}

