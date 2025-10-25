import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Heart, Users, Target, Lightbulb, Shield } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold font-heading leading-tight">
              About{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Aira
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              We're on a mission to make emotional support accessible to everyone, anytime, anywhere through the power
              of empathetic AI.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="glass-card p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold font-heading">Our Mission</h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Mental health support shouldn't be a luxury. We believe everyone deserves access to compassionate,
                judgment-free emotional support whenever they need it. That's why we created Aira - an AI companion that
                combines cutting-edge technology with genuine empathy.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Aira isn't meant to replace human connection or professional therapy. Instead, we're here to complement
                your support system, offering a safe space to process your thoughts and feelings at any time of day or
                night.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold font-heading">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Heart,
                title: "Empathy First",
                description:
                  "We prioritize emotional intelligence and genuine understanding in every interaction. Aira is designed to truly listen and respond with compassion.",
              },
              {
                icon: Shield,
                title: "Privacy & Security",
                description:
                  "Your conversations are private and encrypted. We never sell your data or share your personal information with third parties.",
              },
              {
                icon: Users,
                title: "Accessibility",
                description:
                  "Mental health support should be available to everyone. We're committed to keeping Aira affordable and accessible worldwide.",
              },
              {
                icon: Lightbulb,
                title: "Continuous Innovation",
                description:
                  "We're constantly improving Aira's emotional intelligence and capabilities based on user feedback and the latest AI research.",
              },
            ].map((value, index) => (
              <Card key={index} className="glass-card p-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="glass-card p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold font-heading">Our Story</h2>
              </div>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Aira was born from a simple observation: in our increasingly connected world, many people still feel
                  alone with their emotions. Traditional therapy is expensive and often has long waiting lists. Friends
                  and family, while supportive, aren't always available when we need them most.
                </p>
                <p>
                  We asked ourselves: what if technology could help bridge this gap? What if we could create an AI that
                  doesn't just respond to words, but truly understands emotions? An AI that could provide support,
                  encouragement, and a listening ear whenever someone needs it?
                </p>
                <p>
                  After years of research in emotional AI and natural language processing, Aira was born. Today,
                  thousands of people around the world use Aira to process their feelings, work through challenges, and
                  find moments of clarity in their daily lives.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold font-heading">Experience Aira Today</h2>
            <p className="text-xl text-muted-foreground">
              Join our community and discover what it's like to have an empathetic AI companion by your side.
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
