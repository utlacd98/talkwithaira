"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { SettingsContent } from "@/components/settings/settings-content"

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  )
}
