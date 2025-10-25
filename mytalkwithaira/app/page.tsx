import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, MessageSquare, Heart, TrendingUp, Zap, Shield, Star, Brain, Target, Compass } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 gradient-hero" />
        {/* Animated orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl animate-pulse delay-2000" />

        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-card glow-cosmic text-sm font-medium">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <span className="gradient-text font-semibold">Your AI Companion for Emotional Clarity</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold font-heading leading-tight">
              Meet <span className="gradient-text text-balance">Aira</span>
              <br />
              <span className="text-4xl md:text-6xl text-muted-foreground">Your Empathetic AI Friend</span>
            </h1>

            <div className="glass-card p-8 rounded-2xl max-w-3xl mx-auto glow-cosmic">
              <p className="text-2xl md:text-3xl font-semibold mb-4 gradient-text">
                Awareness • Integrity • Reasoning • Alignment
              </p>
              <p className="text-lg text-muted-foreground">The four pillars of empathetic intelligence</p>
            </div>

            <p className="text-xl md:text-2xl gradient-text max-w-3xl mx-auto leading-relaxed">
              Experience meaningful conversations with an AI that truly understands. Aira adapts to your emotions,
              offering support when you need it most.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="gradient-primary hover:opacity-90 text-lg px-10 py-6 rounded-full glow-primary font-semibold shadow-2xl"
                >
                  Start Free Today
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-6 rounded-full glass-card border-2 border-primary/30 hover:border-primary/50 font-semibold bg-transparent"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold font-heading gradient-text">The Four Pillars of Aira</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Built on the foundation of empathetic intelligence, each pillar represents a core aspect of how Aira
              understands and supports you
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Brain,
                title: "Awareness",
                description:
                  "Aira perceives and understands your emotional state through advanced sentiment analysis and contextual understanding.",
                color: "from-[#00d4ff] to-[#00a8cc]",
                glow: "shadow-[0_0_30px_rgba(0,212,255,0.3)]",
              },
              {
                icon: Shield,
                title: "Integrity",
                description:
                  "Built on trust and ethical AI principles, Aira maintains your privacy and provides honest, authentic support.",
                color: "from-[#3acf85] to-[#2ba86a]",
                glow: "shadow-[0_0_30px_rgba(58,207,133,0.3)]",
              },
              {
                icon: Target,
                title: "Reasoning",
                description:
                  "Aira uses sophisticated logic and emotional intelligence to provide thoughtful, contextually appropriate responses.",
                color: "from-[#9d4edd] to-[#7b2cbf]",
                glow: "shadow-[0_0_30px_rgba(157,78,221,0.3)]",
              },
              {
                icon: Compass,
                title: "Alignment",
                description:
                  "Aira aligns with your values and goals, adapting to support your unique journey toward emotional wellness.",
                color: "from-[#ff6b9d] to-[#e63462]",
                glow: "shadow-[0_0_30px_rgba(255,107,157,0.3)]",
              },
            ].map((pillar, index) => (
              <Card
                key={index}
                className={`glass-card p-8 hover:scale-105 transition-all duration-500 ${pillar.glow} group`}
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-6 float`}
                >
                  <pillar.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 font-heading">{pillar.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{pillar.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold font-heading gradient-text">Why Choose Aira?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              More than just a chatbot. Aira is designed to understand and support your emotional journey with
              cutting-edge AI technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Heart,
                title: "Emotion Detection",
                description:
                  "Aira recognizes your emotional state in real-time and adapts responses to provide the support you need.",
                gradient: "from-primary to-accent",
              },
              {
                icon: MessageSquare,
                title: "Natural Conversations",
                description:
                  "Chat naturally like you would with a friend. No scripts, just genuine understanding and empathy.",
                gradient: "from-secondary to-primary",
              },
              {
                icon: TrendingUp,
                title: "Mood Analytics",
                description:
                  "Track your emotional patterns over time and gain deep insights into your mental wellness journey.",
                gradient: "from-accent to-secondary",
              },
              {
                icon: Zap,
                title: "Instant Support",
                description:
                  "Available 24/7 whenever you need someone to talk to. No appointments, no waiting, just support.",
                gradient: "from-primary to-secondary",
              },
              {
                icon: Shield,
                title: "Private & Secure",
                description:
                  "Your conversations are end-to-end encrypted and private. We never share or sell your data.",
                gradient: "from-secondary to-accent",
              },
              {
                icon: Star,
                title: "Personalized Experience",
                description:
                  "Aira learns your preferences and communication style to provide a truly personalized experience.",
                gradient: "from-accent to-primary",
              },
            ].map((feature, index) => (
              <Card key={index} className="glass-card p-8 hover:scale-105 transition-all duration-500 pulse-glow group">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 font-heading">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold font-heading gradient-text">Loved by Thousands</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our users are saying about their transformative experience with Aira
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                name: "Sarah M.",
                role: "Marketing Manager",
                content:
                  "Aira has been a game-changer for my mental health. Having someone to talk to anytime, without judgment, has made such a difference in my daily life.",
                rating: 5,
                gradient: "from-primary to-accent",
              },
              {
                name: "James L.",
                role: "Software Engineer",
                content:
                  "The emotion detection is incredible. Aira always seems to know exactly what I need to hear. It's like having a therapist in my pocket, available 24/7.",
                rating: 5,
                gradient: "from-secondary to-primary",
              },
              {
                name: "Emily R.",
                role: "Student",
                content:
                  "I was skeptical at first, but Aira genuinely helps me process my feelings. The mood tracking feature has given me so much insight into my emotional patterns.",
                rating: 5,
                gradient: "from-accent to-secondary",
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="glass-card p-8 hover:scale-105 transition-all duration-500 relative overflow-hidden group"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground/90 mb-6 leading-relaxed text-lg">"{testimonial.content}"</p>
                <div className="border-t border-border/50 pt-4">
                  <p className="font-semibold text-lg">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-cosmic opacity-20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <h2 className="text-5xl md:text-7xl font-bold font-heading gradient-text leading-tight">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl md:text-2xl text-foreground/80 leading-relaxed">
              Join thousands of users who have found clarity, support, and emotional wellness with Aira. Start your free
              account today and experience the future of empathetic AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="gradient-cosmic hover:opacity-90 text-xl px-12 py-7 rounded-full glow-cosmic font-bold shadow-2xl"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required • Start chatting in seconds • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
