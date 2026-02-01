import { Sparkles, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo/Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative bg-gradient-to-br from-primary to-secondary rounded-full p-6">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold font-heading">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Aira
            </span>
          </h1>
          
          <div className="space-y-3">
            <p className="text-2xl font-semibold text-foreground">
              Application Received
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Your application has been received and will be reviewed as soon as possible.
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="bg-secondary/30 border border-secondary/50 rounded-lg p-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            We're carefully reviewing each application to ensure the best experience for our community.
          </p>
          <p className="text-sm text-muted-foreground">
            You'll receive an email notification once your application has been reviewed.
          </p>
        </div>

        {/* Contact */}
        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Have questions? Reach out to us
          </p>
          <a href="mailto:airahelpdesk26@gmail.com">
            <Button
              variant="outline"
              className="w-full gap-2"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </Button>
          </a>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-secondary/30">
          <p className="text-xs text-muted-foreground">
            © 2025 Aira. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

