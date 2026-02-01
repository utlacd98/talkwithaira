import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { topic, category, author, authorBio } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    // Generate blog post using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert blog writer for Aira, an AI emotional support companion. Write engaging, empathetic, and informative blog posts about mental health, emotional wellness, AI technology, and related topics. 

Your writing should be:
- Warm and empathetic
- Evidence-based and informative
- Accessible to general audiences
- Structured with clear headings and sections
- Include practical tips and actionable advice
- Use markdown formatting

Format the response as a JSON object with these fields:
{
  "title": "Engaging blog post title",
  "excerpt": "Compelling 1-2 sentence summary",
  "content": "Full blog post content in markdown format (minimum 1500 words)",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "readTime": estimated_read_time_in_minutes
}`,
        },
        {
          role: "user",
          content: `Write a comprehensive blog post about: ${topic}

Category: ${category || "Mental Health"}
Author: ${author || "Aira Team"}

Make it engaging, informative, and helpful for readers seeking emotional wellness and mental health support.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    })

    const generatedContent = JSON.parse(completion.choices[0].message.content || "{}")

    // Generate slug from title
    const slug = generatedContent.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Fetch an appropriate image for the category
    let imageUrl = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop"
    try {
      const imageResponse = await fetch(
        `${request.nextUrl.origin}/api/blog/image`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: category || "Mental Health" }),
        }
      )
      const imageData = await imageResponse.json()
      if (imageData.image?.url) {
        imageUrl = imageData.image.url
      }
    } catch (error) {
      console.error("Error fetching image:", error)
      // Use default image on error
    }

    // Create blog post object
    const blogPost = {
      slug,
      title: generatedContent.title,
      excerpt: generatedContent.excerpt,
      content: generatedContent.content,
      author: author || "Aira Team",
      authorBio: authorBio || "The Aira team is dedicated to making emotional support accessible to everyone through AI technology.",
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      category: category || "Mental Health",
      tags: generatedContent.tags || [],
      readTime: generatedContent.readTime || 8,
      image: "bg-gradient-to-br from-primary to-accent",
      imageUrl,
    }

    return NextResponse.json({ success: true, blogPost })
  } catch (error) {
    console.error("Error generating blog post:", error)
    return NextResponse.json(
      { error: "Failed to generate blog post" },
      { status: 500 }
    )
  }
}

// Get suggested topics
export async function GET() {
  const suggestedTopics = [
    {
      topic: "How to Build Emotional Resilience in Difficult Times",
      category: "Wellness",
    },
    {
      topic: "The Role of AI in Mental Health Support",
      category: "AI & Technology",
    },
    {
      topic: "Understanding and Managing Anxiety",
      category: "Mental Health",
    },
    {
      topic: "The Power of Self-Compassion",
      category: "Wellness",
    },
    {
      topic: "Digital Wellness: Finding Balance in a Connected World",
      category: "Wellness",
    },
    {
      topic: "How AI Detects Emotional Patterns",
      category: "AI & Technology",
    },
    {
      topic: "Coping with Loneliness and Isolation",
      category: "Mental Health",
    },
    {
      topic: "The Science of Gratitude and Happiness",
      category: "Wellness",
    },
    {
      topic: "Building Healthy Boundaries",
      category: "Mental Health",
    },
    {
      topic: "The Future of Personalized Mental Health Care",
      category: "AI & Technology",
    },
  ]

  return NextResponse.json({ topics: suggestedTopics })
}

