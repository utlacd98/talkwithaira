"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { Suspense } from "react"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}
      >
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  )
}
