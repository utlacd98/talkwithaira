import { notFound } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, User, Clock, ArrowLeft, Tag } from "lucide-react"
import Link from "next/link"
import { getBlogPostBySlug, getRelatedPosts, getAllBlogPosts } from "@/lib/blog-data"
import ReactMarkdown from "react-markdown"
import { BlogTracker } from "@/components/blog/blog-tracker"

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = getAllBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    return {
      title: "Blog Post Not Found",
    }
  }

  return {
    title: `${post.title} | Aira Blog`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = getRelatedPosts(post, 3)

  return (
    <div className="min-h-screen bg-background">
      <BlogTracker slug={slug} title={post.title} />
      <Navigation />

      {/* Hero Section with Featured Image */}
      <section className="relative overflow-hidden pt-24 pb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link href="/blog">
              <Button variant="ghost" className="mb-6 group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Blog
              </Button>
            </Link>

            {/* Category Badge */}
            <div className="mb-4">
              <span className="text-sm font-semibold px-4 py-2 rounded-full bg-primary/20 text-primary">
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading leading-tight mb-6">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap gap-6 text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{post.readTime} min read</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.imageUrl ? (
        <section className="pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="relative h-[400px] rounded-2xl overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className={`h-[400px] rounded-2xl ${post.image}`} />
            </div>
          </div>
        </section>
      )}

      {/* Article Content */}
      <article className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="glass-card p-8 md:p-12">
              <div className="prose prose-lg prose-invert max-w-none">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>

              {/* Tags */}
              <div className="mt-12 pt-8 border-t border-border/50">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-5 h-5 text-muted-foreground" />
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-sm px-3 py-1 rounded-full bg-secondary/20 text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Author Bio */}
              <div className="mt-8 p-6 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold">
                    {post.author.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{post.author}</h3>
                    <p className="text-muted-foreground">{post.authorBio}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-8 text-center">
                Related Articles
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                    <Card className="glass-card overflow-hidden hover:scale-105 transition-all duration-500 h-full flex flex-col">
                      {/* Featured Image */}
                      {relatedPost.imageUrl ? (
                        <div className="h-48 relative overflow-hidden">
                          <img
                            src={relatedPost.imageUrl}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`h-48 ${relatedPost.image}`} />
                      )}

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary">
                            {relatedPost.category}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold mb-3 line-clamp-2">{relatedPost.title}</h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
                          {relatedPost.excerpt}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border/50">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{relatedPost.readTime} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{relatedPost.date}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}

