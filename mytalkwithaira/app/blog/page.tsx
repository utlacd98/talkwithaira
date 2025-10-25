import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, User, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

const blogPosts = [
  {
    id: 1,
    title: "Understanding Emotional Intelligence in AI",
    excerpt:
      "Explore how artificial intelligence is being trained to recognize and respond to human emotions with greater empathy and understanding.",
    author: "Dr. Sarah Chen",
    date: "January 15, 2025",
    category: "AI & Technology",
    image: "bg-gradient-to-br from-primary to-accent",
  },
  {
    id: 2,
    title: "The Mental Health Crisis: Why We Need Better Support",
    excerpt:
      "A deep dive into the growing mental health challenges facing society and how technology can bridge the gap in emotional support.",
    author: "James Mitchell",
    date: "January 10, 2025",
    category: "Mental Health",
    image: "bg-gradient-to-br from-accent to-secondary",
  },
  {
    id: 3,
    title: "5 Ways to Practice Emotional Clarity Daily",
    excerpt:
      "Practical tips and techniques to help you develop emotional awareness and find clarity in your daily life.",
    author: "Emma Rodriguez",
    date: "January 5, 2025",
    category: "Wellness",
    image: "bg-gradient-to-br from-secondary to-primary",
  },
  {
    id: 4,
    title: "The Science Behind Empathetic AI Conversations",
    excerpt:
      "Learn about the cutting-edge research and technology that powers Aira's ability to understand and respond with genuine empathy.",
    author: "Dr. Michael Park",
    date: "December 28, 2024",
    category: "AI & Technology",
    image: "bg-gradient-to-br from-primary/50 to-accent/50",
  },
  {
    id: 5,
    title: "Breaking the Stigma: Mental Health in the Workplace",
    excerpt:
      "How organizations can create supportive environments for mental health and why it matters for employee wellbeing.",
    author: "Lisa Thompson",
    date: "December 20, 2024",
    category: "Mental Health",
    image: "bg-gradient-to-br from-accent/50 to-secondary/50",
  },
  {
    id: 6,
    title: "Journaling for Emotional Wellness: A Beginner's Guide",
    excerpt:
      "Discover how journaling combined with AI support can help you process emotions and track your emotional journey.",
    author: "Alex Kumar",
    date: "December 15, 2024",
    category: "Wellness",
    image: "bg-gradient-to-br from-secondary/50 to-primary/50",
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold font-heading leading-tight">
              Aira <span className="gradient-text">Blog</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Insights, stories, and research on emotional intelligence, mental health, and the future of AI-powered support.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {blogPosts.map((post) => (
              <Card key={post.id} className="glass-card overflow-hidden hover:scale-105 transition-all duration-500 flex flex-col">
                {/* Featured Image */}
                <div className={`h-48 ${post.image}`} />

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary">
                      {post.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-3 line-clamp-2">{post.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">{post.excerpt}</p>

                  {/* Meta */}
                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>

                  {/* Read More */}
                  <Button variant="ghost" className="w-full mt-4 justify-between group">
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">Stay Updated</h2>
            <p className="text-lg text-muted-foreground">
              Subscribe to our newsletter for the latest insights on emotional intelligence and mental wellness.
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2 rounded-lg bg-background/50 border border-border focus:outline-none focus:border-primary"
              />
              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

