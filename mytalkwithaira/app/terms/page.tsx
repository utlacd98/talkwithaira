import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-8">Terms of Service</h1>

        <Card className="glass-card p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Aira, you accept and agree to be bound by the terms and provision of this
              agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Use of Service</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Aira is an AI-powered emotional support companion. Our service is intended to provide emotional support
              and companionship, but it is not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You agree to use Aira only for lawful purposes and in a way that does not infringe the rights of,
              restrict, or inhibit anyone else's use and enjoyment of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept
              responsibility for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Privacy and Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and
              protect your personal information and conversation data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Subscription and Payments</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Aira offers both free and paid subscription plans. Paid subscriptions are billed on a recurring basis and
              will automatically renew unless cancelled before the renewal date.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You may cancel your subscription at any time through your account settings. Refunds are provided on a
              case-by-case basis at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Aira is not a crisis intervention service. If you are experiencing a mental health emergency, please
              contact emergency services or a crisis hotline immediately. We are not liable for any damages arising from
              your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any significant changes
              via email or through the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at support@aira.app
            </p>
          </section>

          <p className="text-sm text-muted-foreground pt-8 border-t">Last updated: January 2025</p>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
