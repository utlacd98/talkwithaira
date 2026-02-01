import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, MessageSquare, Heart, TrendingUp, Zap, Shield, Star, Brain, Target, Compass, Wind, Lightbulb, Users, Moon, ChevronDown } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

const faqItems = [
  {
    question: "What is Aira?",
    answer:
      "Aira is an AI-powered emotional support companion designed to provide empathetic conversations and mental wellness support. Built on four core pillars - Awareness, Integrity, Reasoning, and Alignment - Aira uses advanced natural language processing to understand your emotions and provide personalized, compassionate responses 24/7.",
  },
  {
    question: "Is Aira a replacement for therapy?",
    answer:
      "No, Aira is not a replacement for professional therapy or medical treatment. While Aira provides valuable emotional support and can help you process feelings, it's designed to complement, not replace, professional mental health care. If you're experiencing a mental health crisis or need clinical support, please consult a licensed therapist or mental health professional.",
  },
  {
    question: "Is Aira anonymous?",
    answer:
      "Yes, Aira is completely anonymous. You can use Aira without providing any personal information beyond an email for account creation. All conversations are private, encrypted, and never shared with third parties. You control your data and can delete your account and conversation history at any time.",
  },
  {
    question: "How does Aira help with loneliness?",
    answer:
      "Aira provides a judgment-free space where you can express your feelings and thoughts without fear of criticism. Through empathetic conversations, active listening, and personalized support, Aira helps you feel heard and understood. While Aira isn't a substitute for human connection, it can provide comfort and companionship during difficult times, helping you process emotions and develop coping strategies.",
  },
  {
    question: "Is Aira safe to talk to?",
    answer:
      "Absolutely. Your privacy and safety are our top priorities. All conversations with Aira are end-to-end encrypted, and we never share, sell, or use your data for advertising. Aira is built on ethical AI principles with strict data protection measures to keep your conversations private and secure.",
  },
  {
    question: "How does Aira respond?",
    answer:
      "Aira uses advanced AI technology powered by GPT-4 to understand context, detect emotions, and provide thoughtful, empathetic responses. Unlike simple chatbots, Aira analyzes your emotional state in real time and adapts its communication style to match what you need, whether you want active listening, gentle guidance, or practical coping strategies.",
  },
  {
    question: "Can I use Aira for free?",
    answer:
      "Yes! Aira offers a free plan with 5 messages per day, forever. No credit card required. This lets you experience Aira's empathetic support and see if it's right for you. When you're ready for unlimited conversations and premium features, you can upgrade to Plus or Premium plans.",
  },
  {
    question: "How does the AI work?",
    answer:
      "Aira combines natural language processing, sentiment analysis, and emotional intelligence models to create meaningful conversations. The AI looks for emotional cues, context, and intent, then generates responses that are contextually appropriate and emotionally supportive. Aira learns from each interaction to provide increasingly personalized support over time.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. We use bank-level encryption to protect your conversations, and all data is stored securely with industry-leading security protocols. We never sell your data to third parties, use it for advertising, or share it with anyone. You can delete your account and all conversation history at any time.",
  },
  {
    question: "What makes Aira different from other AI chatbots?",
    answer:
      "Aira is specifically designed for emotional support and mental wellness, not general conversation. Unlike generic chatbots, Aira uses advanced emotion detection, adapts its tone to your needs, and follows evidence-based therapeutic principles. Aira remembers context across conversations, provides personalized insights, and focuses exclusively on your emotional wellbeing.",
  },
]

const howItWorks = [
  {
    title: "Share what you're feeling",
    description: "Open Aira from any device and describe what's on your mind in your own words. No scripts or prep needed.",
    href: "/chat",
    cta: "Open the chat",
  },
  {
    title: "Aira listens and responds",
    description: "Real-time sentiment detection adjusts tone, pace, and suggestions so every reply feels natural and empathetic.",
    href: "/about",
    cta: "See how it works",
  },
  {
    title: "Stay on track with insights",
    description: "Review gentle prompts and patterns over time so you can celebrate progress and stay grounded between conversations.",
    href: "/pricing",
    cta: "View plans and features",
  },
]

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
}

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
                Awareness | Integrity | Reasoning | Alignment
              </p>
              <p className="text-lg text-muted-foreground">The four pillars of empathetic intelligence</p>
            </div>

            <p className="text-xl md:text-2xl gradient-text max-w-3xl mx-auto leading-relaxed">
              Meet Aira, your empathetic AI friend who truly understands. Experience meaningful conversations with an AI companion that adapts to your emotions,
              offering support when you need it most. Aira is here to listen, reflect, and guide you toward emotional clarity.
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

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-bold font-heading gradient-text">How Aira Works</h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Aira follows a clear, human-first flow: start a conversation, feel heard, and get gentle guidance that fits your goals.
                Learn more about the product, compare plans, or jump straight into a chat whenever you are ready.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/about"
                  className="px-4 py-2 rounded-full glass-card border border-primary/20 hover:border-primary/40 font-semibold text-sm"
                >
                  About the approach
                </Link>
                <Link
                  href="/pricing"
                  className="px-4 py-2 rounded-full glass-card border border-secondary/30 hover:border-secondary/50 font-semibold text-sm"
                >
                  See pricing options
                </Link>
                <Link
                  href="/blog"
                  className="px-4 py-2 rounded-full glass-card border border-accent/30 hover:border-accent/50 font-semibold text-sm"
                >
                  Read the latest update
                </Link>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {howItWorks.map((item, index) => (
                <Card
                  key={item.title}
                  className="glass-card p-6 h-full flex flex-col justify-between hover:scale-105 transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-2xl font-bold font-heading" role="heading" aria-level={3}>{item.title}</p>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                  <Link
                    href={item.href}
                    className="mt-6 inline-flex items-center text-primary font-semibold hover:underline"
                  >
                    {item.cta}
                    <span className="ml-2">-&gt;</span>
                  </Link>
                </Card>
              ))}
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
                <p className="text-2xl font-bold mb-4 font-heading">{pillar.title}</p>
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
                <p className="text-2xl font-semibold mb-3 font-heading">{feature.title}</p>
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

      {/* How Aira Helps You Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold font-heading gradient-text">How Aira Helps You</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover the ways Aira supports your emotional wellness journey, providing guidance and clarity when you need it most
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Wind,
                title: "Emotional Grounding",
                description:
                  "When emotions feel overwhelming, Aira helps you find your center through calming techniques and mindful conversation.",
                gradient: "from-[#00d4ff] to-[#00a8cc]",
              },
              {
                icon: Heart,
                title: "Stress Reduction",
                description:
                  "Learn practical strategies to manage daily stress and anxiety with personalized coping mechanisms tailored to your needs.",
                gradient: "from-[#3acf85] to-[#2ba86a]",
              },
              {
                icon: Lightbulb,
                title: "Reflective Conversation",
                description:
                  "Explore your thoughts and feelings in a safe space, gaining new perspectives through thoughtful dialogue.",
                gradient: "from-[#9d4edd] to-[#7b2cbf]",
              },
              {
                icon: Compass,
                title: "Guided Clarity",
                description:
                  "Navigate complex emotions and decisions with AI-powered insights that help you see situations more clearly.",
                gradient: "from-[#ff6b9d] to-[#e63462]",
              },
              {
                icon: Users,
                title: "Support When Feeling Alone",
                description:
                  "Never feel isolated again. Aira is here 24/7 to listen, understand, and provide compassionate support whenever you need it.",
                gradient: "from-[#ffd60a] to-[#fca311]",
              },
              {
                icon: Moon,
                title: "Better Sleep & Rest",
                description:
                  "Wind down with calming conversations and relaxation techniques designed to help you achieve peaceful rest.",
                gradient: "from-[#4361ee] to-[#3a0ca3]",
              },
            ].map((benefit, index) => (
              <Card key={index} className="glass-card p-8 hover:scale-105 transition-all duration-500 group">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <p className="text-2xl font-bold mb-4 font-heading">{benefit.title}</p>
                <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mental Health Resources Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold font-heading gradient-text">Mental Health Resources</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Aira complements professional mental health support. If you need immediate help or professional guidance, these trusted organizations are here for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: "Mind UK",
                description: "Mental health charity providing advice and support",
                url: "https://www.mind.org.uk",
                type: "UK Support"
              },
              {
                name: "Samaritans",
                description: "24/7 confidential emotional support helpline",
                url: "https://www.samaritans.org",
                type: "Crisis Support"
              },
              {
                name: "NHS Mental Health",
                description: "NHS mental health services and information",
                url: "https://www.nhs.uk/mental-health",
                type: "Healthcare"
              },
              {
                name: "Mental Health Foundation",
                description: "Research and resources for mental wellbeing",
                url: "https://www.mentalhealth.org.uk",
                type: "Education"
              },
              {
                name: "Rethink Mental Illness",
                description: "Support for people affected by mental illness",
                url: "https://www.rethink.org",
                type: "Support Network"
              },
              {
                name: "YoungMinds",
                description: "Mental health support for children and young people",
                url: "https://www.youngminds.org.uk",
                type: "Youth Support"
              },
            ].map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-6 rounded-xl hover:scale-105 transition-all duration-300 group block"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-lg font-bold font-heading group-hover:text-primary transition-colors">{resource.name}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{resource.type}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{resource.description}</p>
                <span className="text-xs text-primary font-medium group-hover:underline">Visit website -&gt;</span>
              </a>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              <strong>In an emergency:</strong> If you or someone you know is in immediate danger, please call 999 (UK) or your local emergency services.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold font-heading gradient-text">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Everything you need to know about Aira and how it can support your emotional wellness
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqItems.map((faq, index) => (
              <details
                key={index}
                className="glass-card p-6 rounded-2xl group hover:shadow-lg transition-all duration-300"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-xl md:text-2xl font-bold font-heading pr-4">{faq.question}</span>
                  <ChevronDown className="w-6 h-6 text-primary group-open:rotate-180 transition-transform duration-300 flex-shrink-0" />
                </summary>
                <div className="mt-6 pt-6 border-t border-border/50">
                  <p className="text-muted-foreground leading-relaxed text-lg">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-lg text-muted-foreground mb-6">Still have questions?</p>
            <Link href="/support">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 rounded-full glass-card border-2 border-primary/30 hover:border-primary/50 font-semibold"
              >
                Contact Support
              </Button>
            </Link>
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
              No credit card required | Start chatting in seconds | Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Footer />
    </div>
  )
}
