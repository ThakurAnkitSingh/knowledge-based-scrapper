# 🚀 Knowledge Base Scraper - Complete Usage Guide

## 📋 Start the Application

### Option 1: Production Mode (Recommended)

```bash
# 1. Install dependencies (first time only)
npm run setup

# 2. Build the React frontend
npm run build-ui

# 3. Start the server
npm start

# 4. Open browser at http://localhost:3001
```

### Option 2: Development Mode (with hot reload)

```bash
# Terminal 1 - Start backend server
npm start

# Terminal 2 - Start React dev server
cd client
npm start

# Opens automatically at http://localhost:3000
```

## 🖥️ Using the Web Interface

### What You'll See:

- **Title**: "Knowledge Base Scraper"
- **Input Field**: Enter website URL here
- **Button**: "Start Scraping"

### 📝 Input Format:

Enter any website URL in these formats:

- `interviewing.io` (without protocol)
- `https://quill.co/blog` (with protocol)
- `nilmamano.com/blog/category/dsa` (specific paths)

### ✅ Supported Websites:

- ✅ Blogs (WordPress, Medium, Substack, custom)
- ✅ Documentation sites
- ✅ Company websites
- ✅ Technical platforms
- ✅ Personal blogs

### 🎯 What Happens When You Click "Start Scraping":

1. **Progress Indicator** appears with "Discovering and scraping content..."
2. **Backend Process**:

   - Discovers all URLs (sitemap, crawling)
   - Extracts content from each page
   - Converts HTML to clean Markdown
   - Detects content type automatically

3. **Results Display**:

   ```
   Scraping Results
   275 items found (blog(270), other(5))

   [Download JSON button]

   Preview of items...
   ```

## 📊 Expected Response Format

The JSON output follows this exact structure:

```json
{
  "site": "https://interviewing.io",
  "items": [
    {
      "title": "How to Ace Technical Interviews",
      "content": "# How to Ace Technical Interviews\n\nContent in markdown format...",
      "content_type": "blog",
      "source_url": "https://interviewing.io/blog/ace-technical-interviews"
    },
    {
      "title": "System Design Interview Guide",
      "content": "# System Design Interview Guide\n\n## Introduction\n\nMarkdown content...",
      "content_type": "blog",
      "source_url": "https://interviewing.io/guides/system-design"
    }
  ],
  "stats": {
    "total_items": 275,
    "content_types": {
      "blog": 270,
      "other": 5
    }
  }
}
```

### Content Types Detected:

- `blog` - Blog posts, articles, guides
- `book` - Book chapters, manuscripts
- `podcast_transcript` - Podcast episodes with timestamps
- `call_transcript` - Earnings calls, conferences
- `linkedin_post` - LinkedIn articles
- `reddit_comment` - Reddit posts
- `other` - Documentation, misc content

## 🧪 Test Examples

### Example 1: Technical Blog

**Input**: `interviewing.io`
**Expected Output**:

- ~275 items
- Mostly "blog" content type
- Includes interview guides, blog posts, questions

### Example 2: Marketing Blog

**Input**: `quill.co/blog`
**Expected Output**:

- ~30 items
- Mix of "blog" and "other" types
- Marketing and product content

### Example 3: Personal Technical Blog

**Input**: `nilmamano.com/blog/category/dsa`
**Expected Output**:

- ~31 items
- All "blog" content type
- Data structures and algorithms content

## 💻 Command Line Usage

```bash
# Basic usage
npm run scrape interviewing.io

# With options
npm run scrape quill.co/blog -- --pretty --output results.json

# Verbose mode
npm run scrape example.com -- --verbose
```

## 🔌 API Usage

```bash
curl -X POST http://localhost:3001/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "interviewing.io"}'
```

With authentication:

```bash
curl -X POST http://localhost:3001/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "protected-site.com",
    "cookies": {"session": "abc123"},
    "headers": {"Authorization": "Bearer token"}
  }'
```

## ⏱️ Performance Expectations

- **Small sites** (< 50 pages): 5-15 seconds
- **Medium sites** (50-200 pages): 15-60 seconds
- **Large sites** (200+ pages): 1-3 minutes

## 🚨 Troubleshooting

**Port already in use?**

```bash
# Kill all Node processes
taskkill /F /IM node.exe  # Windows
killall node              # Mac/Linux
```

**No items found?**

- Site may require authentication
- Site may block scrapers
- Try a different URL path

---

**Ready to scrape!** Start with `npm start` and test with any website! 🎉
