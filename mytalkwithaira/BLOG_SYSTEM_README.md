# Aira Blog System

## Overview

The Aira blog system is a fully automated, AI-powered blogging platform that allows you to:
- Read full-length, professionally written blog articles
- Generate new blog posts automatically using AI
- Manage blog images from Unsplash
- Organize content by categories and tags

## Features

### ✅ **Complete Blog Reading Experience**
- 6 pre-written, full-length blog articles (1500+ words each)
- Beautiful individual blog post pages with:
  - Featured images from Unsplash
  - Author information and bios
  - Read time estimates
  - Category and tag organization
  - Related articles section
  - Responsive markdown rendering

### ✅ **AI Blog Generation**
- Automated blog post creation using GPT-4
- Generates:
  - Engaging titles
  - Compelling excerpts
  - Full article content (1500+ words)
  - Relevant tags
  - Read time estimates
  - SEO-friendly slugs

### ✅ **Image Management**
- Automatic image selection from Unsplash
- Category-specific image curation
- Fallback images for offline/error scenarios
- High-quality, royalty-free images

### ✅ **Admin Interface**
- Easy-to-use blog generation interface at `/admin/blog`
- Suggested topic ideas
- Real-time preview
- One-click code copying
- Category and author customization

## File Structure

```
app/
├── blog/
│   ├── page.tsx                    # Blog listing page
│   └── [slug]/
│       └── page.tsx                # Individual blog post page
├── admin/
│   └── blog/
│       └── page.tsx                # Blog generation admin interface
└── api/
    └── blog/
        ├── generate/
        │   └── route.ts            # AI blog generation endpoint
        └── image/
            └── route.ts            # Image fetching endpoint

lib/
└── blog-data.ts                    # Centralized blog post data
```

## Existing Blog Posts

1. **Understanding Emotional Intelligence in AI** (8 min read)
   - Category: AI & Technology
   - Topics: AI, emotional intelligence, machine learning

2. **The Mental Health Crisis: Why We Need Better Support** (10 min read)
   - Category: Mental Health
   - Topics: Mental health accessibility, crisis support

3. **5 Ways to Practice Emotional Clarity Daily** (6 min read)
   - Category: Wellness
   - Topics: Mindfulness, self-care, emotional awareness

4. **The Science Behind Empathetic AI Conversations** (9 min read)
   - Category: AI & Technology
   - Topics: NLP, affective computing, AI research

5. **Breaking the Stigma: Mental Health in the Workplace** (11 min read)
   - Category: Mental Health
   - Topics: Workplace wellness, mental health stigma

6. **Journaling for Emotional Wellness: A Beginner's Guide** (7 min read)
   - Category: Wellness
   - Topics: Journaling, self-reflection, emotional processing

## How to Use

### Reading Blog Posts

1. Visit `/blog` to see all blog posts
2. Click on any blog card to read the full article
3. Browse related articles at the bottom of each post
4. Navigate back to the blog listing with the "Back to Blog" button

### Generating New Blog Posts

1. Visit `/admin/blog` (admin interface)
2. Enter a blog topic or click "Load Ideas" for suggestions
3. Select a category (Mental Health, Wellness, or AI & Technology)
4. Optionally add author name and bio
5. Click "Generate Blog Post"
6. Wait 30-60 seconds for AI generation
7. Review the generated content
8. Click "Copy Code" to copy the blog post object
9. Paste into `lib/blog-data.ts` in the `blogPosts` array
10. The new post will automatically appear on the blog!

### Customizing Images

**Option 1: Use Unsplash API (Recommended)**
1. Get a free Unsplash API key at https://unsplash.com/developers
2. Add to `.env.local`: `UNSPLASH_ACCESS_KEY=your_key_here`
3. Images will be automatically fetched based on category

**Option 2: Use Curated Fallback Images**
- The system includes curated Unsplash URLs for each category
- No API key needed
- Images are automatically selected

**Option 3: Manual Selection**
- After generating a blog post, update the `imageUrl` field
- Find images at https://unsplash.com
- Use format: `https://images.unsplash.com/photo-XXXXX?w=1200&h=600&fit=crop`

## API Endpoints

### `POST /api/blog/generate`
Generate a new blog post using AI.

**Request:**
```json
{
  "topic": "How to manage stress and anxiety",
  "category": "Mental Health",
  "author": "Dr. Sarah Chen",
  "authorBio": "Clinical psychologist specializing in anxiety disorders"
}
```

**Response:**
```json
{
  "success": true,
  "blogPost": {
    "slug": "how-to-manage-stress-and-anxiety",
    "title": "How to Manage Stress and Anxiety",
    "excerpt": "...",
    "content": "...",
    "author": "Dr. Sarah Chen",
    "authorBio": "...",
    "date": "December 1, 2025",
    "category": "Mental Health",
    "tags": ["stress", "anxiety", "mental health"],
    "readTime": 8,
    "image": "bg-gradient-to-br from-primary to-accent",
    "imageUrl": "https://images.unsplash.com/..."
  }
}
```

### `GET /api/blog/generate`
Get suggested blog topics.

### `GET /api/blog/image?category=Mental%20Health`
Get curated images for a category.

### `POST /api/blog/image`
Get a random image for a category.

## Deployment

The blog system is fully deployed and ready to use:
- Blog listing: https://v0-aira-web-app.vercel.app/blog
- Individual posts: https://v0-aira-web-app.vercel.app/blog/[slug]
- Admin interface: https://v0-aira-web-app.vercel.app/admin/blog

## Future Enhancements

Potential improvements:
- Database storage for blog posts (Supabase)
- Full CRUD admin interface
- Comment system
- Social sharing
- Newsletter integration
- Search and filtering
- Author pages
- RSS feed
- SEO optimization

