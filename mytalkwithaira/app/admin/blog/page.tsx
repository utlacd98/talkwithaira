"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, Copy, Check } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function BlogAdminPage() {
  const [topic, setTopic] = useState("")
  const [category, setCategory] = useState("Mental Health")
  const [author, setAuthor] = useState("")
  const [authorBio, setAuthorBio] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPost, setGeneratedPost] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [suggestedTopics, setSuggestedTopics] = useState<any[]>([])

  const categories = ["Mental Health", "Wellness", "AI & Technology"]

  // Load suggested topics
  const loadSuggestedTopics = async () => {
    try {
      const response = await fetch("/api/blog/generate")
      const data = await response.json()
      setSuggestedTopics(data.topics)
    } catch (error) {
      console.error("Error loading topics:", error)
    }
  }

  const generateBlogPost = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic")
      return
    }

    setIsGenerating(true)
    setGeneratedPost(null)

    try {
      const response = await fetch("/api/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          category,
          author: author || undefined,
          authorBio: authorBio || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedPost(data.blogPost)
      } else {
        alert("Failed to generate blog post: " + data.error)
      }
    } catch (error) {
      console.error("Error generating blog post:", error)
      alert("Failed to generate blog post")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    if (!generatedPost) return

    const blogPostCode = `  {
    id: ${Date.now()},
    slug: "${generatedPost.slug}",
    title: "${generatedPost.title}",
    excerpt: "${generatedPost.excerpt}",
    content: \`${generatedPost.content}\`,
    author: "${generatedPost.author}",
    authorBio: "${generatedPost.authorBio}",
    date: "${generatedPost.date}",
    category: "${generatedPost.category}",
    tags: ${JSON.stringify(generatedPost.tags)},
    image: "${generatedPost.image}",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop",
    readTime: ${generatedPost.readTime},
  },`

    navigator.clipboard.writeText(blogPostCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold font-heading">
              AI Blog <span className="gradient-text">Generator</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Generate high-quality blog posts automatically using AI
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card className="glass-card p-6 space-y-6">
              <h2 className="text-2xl font-bold">Generate New Post</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic">Blog Topic *</Label>
                  <Textarea
                    id="topic"
                    placeholder="e.g., How to manage stress and anxiety in daily life"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-2 px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:border-primary"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="author">Author (optional)</Label>
                  <Input
                    id="author"
                    placeholder="e.g., Dr. Sarah Chen"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="authorBio">Author Bio (optional)</Label>
                  <Textarea
                    id="authorBio"
                    placeholder="Brief bio about the author"
                    value={authorBio}
                    onChange={(e) => setAuthorBio(e.target.value)}
                    rows={2}
                    className="mt-2"
                  />
                </div>
              </div>

              <Button
                onClick={generateBlogPost}
                disabled={isGenerating || !topic.trim()}
                className="w-full bg-gradient-to-r from-primary to-accent"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Blog Post
                  </>
                )}
              </Button>

              {/* Suggested Topics */}
              <div className="pt-6 border-t border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Suggested Topics</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadSuggestedTopics}
                  >
                    Load Ideas
                  </Button>
                </div>
                {suggestedTopics.length > 0 && (
                  <div className="space-y-2">
                    {suggestedTopics.slice(0, 5).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setTopic(suggestion.topic)
                          setCategory(suggestion.category)
                        }}
                        className="w-full text-left p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors text-sm"
                      >
                        <div className="font-medium">{suggestion.topic}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {suggestion.category}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Generated Output */}
            <Card className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Generated Post</h2>
                {generatedPost && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                      </>
                    )}
                  </Button>
                )}
              </div>

              {!generatedPost && !isGenerating && (
                <div className="h-full flex items-center justify-center text-center text-muted-foreground py-20">
                  <div>
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Generated blog post will appear here</p>
                  </div>
                </div>
              )}

              {isGenerating && (
                <div className="h-full flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-muted-foreground">
                      Generating your blog post...
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      This may take 30-60 seconds
                    </p>
                  </div>
                </div>
              )}

              {generatedPost && (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  <div>
                    <Label className="text-xs text-muted-foreground">Title</Label>
                    <p className="font-bold text-lg mt-1">{generatedPost.title}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Slug</Label>
                    <p className="text-sm mt-1 font-mono bg-secondary/20 p-2 rounded">
                      {generatedPost.slug}
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Excerpt</Label>
                    <p className="text-sm mt-1">{generatedPost.excerpt}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Category & Tags
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary">
                        {generatedPost.category}
                      </span>
                      {generatedPost.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1 rounded-full bg-secondary/20 text-secondary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Read Time: {generatedPost.readTime} minutes
                    </Label>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Content Preview</Label>
                    <div className="mt-2 p-4 bg-secondary/10 rounded-lg text-sm max-h-60 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-sans">
                        {generatedPost.content.substring(0, 500)}...
                      </pre>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground mb-2">
                      Copy the code above and add it to <code className="bg-secondary/20 px-2 py-1 rounded">lib/blog-data.ts</code> in the blogPosts array.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Don't forget to update the image URL with an appropriate Unsplash image!
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


