import { NextRequest, NextResponse } from "next/server"

// Unsplash API integration for blog post images
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query") || "mental health wellness"
  const category = searchParams.get("category") || ""

  // Map categories to better search terms
  const categorySearchTerms: Record<string, string> = {
    "Mental Health": "mental health therapy mindfulness meditation",
    "Wellness": "wellness yoga meditation nature peace",
    "AI & Technology": "artificial intelligence technology future digital",
  }

  const searchQuery = category && categorySearchTerms[category]
    ? categorySearchTerms[category]
    : query

  try {
    // Use Unsplash API if you have an access key
    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY

    if (unsplashAccessKey) {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=10&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${unsplashAccessKey}`,
          },
        }
      )

      const data = await response.json()

      if (data.results && data.results.length > 0) {
        const images = data.results.map((photo: any) => ({
          url: `${photo.urls.regular}&w=1200&h=600&fit=crop`,
          thumbnail: photo.urls.small,
          alt: photo.alt_description || photo.description || "Blog post image",
          photographer: photo.user.name,
          photographerUrl: photo.user.links.html,
        }))

        return NextResponse.json({ images })
      }
    }

    // Fallback: Return curated Unsplash URLs without API
    const fallbackImages = getCuratedImages(category || "Mental Health")
    return NextResponse.json({ images: fallbackImages })
  } catch (error) {
    console.error("Error fetching images:", error)
    
    // Return fallback images on error
    const fallbackImages = getCuratedImages(category || "Mental Health")
    return NextResponse.json({ images: fallbackImages })
  }
}

// Curated fallback images for each category
function getCuratedImages(category: string) {
  const imageCollections: Record<string, any[]> = {
    "Mental Health": [
      {
        url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&h=600&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop",
        alt: "Person meditating peacefully",
      },
      {
        url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=600&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop",
        alt: "Calm nature scene",
      },
      {
        url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=600&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
        alt: "Peaceful meditation",
      },
    ],
    "Wellness": [
      {
        url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=600&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop",
        alt: "Wellness and nature",
      },
      {
        url: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&h=600&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=300&fit=crop",
        alt: "Yoga and wellness",
      },
      {
        url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=600&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop",
        alt: "Journaling and self-care",
      },
    ],
    "AI & Technology": [
      {
        url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
        alt: "AI and technology",
      },
      {
        url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=600&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop",
        alt: "Artificial intelligence",
      },
      {
        url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
        alt: "Technology and innovation",
      },
    ],
  }

  return imageCollections[category] || imageCollections["Mental Health"]
}

// Helper endpoint to get a random image for a category
export async function POST(request: NextRequest) {
  const { category } = await request.json()
  
  const images = getCuratedImages(category || "Mental Health")
  const randomImage = images[Math.floor(Math.random() * images.length)]
  
  return NextResponse.json({ image: randomImage })
}

