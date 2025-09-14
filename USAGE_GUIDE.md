# 📖 Knowledge Base Scraper - Visual Usage Guide

## 🎯 What This Tool Does

This scraper extracts content from ANY website and converts it into a structured JSON format with Markdown content, perfect for building knowledge bases for AI applications.

## 🖥️ Web Interface Guide

### Step 1: Start the Application

```bash
npm start
```

### Step 2: Open Browser

Navigate to: **http://localhost:3001**

### Step 3: What You'll See

```
┌─────────────────────────────────────────────────────────┐
│                Knowledge Base Scraper                    │
│                                                         │
│  Import technical knowledge from any website into       │
│  your knowledge base                                    │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │ Enter website URL (e.g., interviewing.io)     │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│         [ 🔍 Start Scraping ]                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Step 4: Enter URL and Click Start

**Valid Input Examples:**

- `interviewing.io`
- `https://quill.co/blog`
- `nilmamano.com/blog/category/dsa`
- `shreycation.substack.com`
- `resilio.com`

### Step 5: Watch Progress

```
┌─────────────────────────────────────────────────────────┐
│                    ⚡ Processing...                      │
│                                                         │
│              Discovering and scraping content...        │
│              This may take a few moments                │
│                                                         │
│                    [Loading spinner]                     │
└─────────────────────────────────────────────────────────┘
```

### Step 6: View Results

```
┌─────────────────────────────────────────────────────────┐
│                   Scraping Results                       │
│                                                         │
│  📊 275 items found                                     │
│     (blog: 270, other: 5)                               │
│                                                         │
│         [ 💾 Download JSON ]                             │
│                                                         │
│  Preview:                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 1. How to Ace Technical Interviews               │   │
│  │    Type: blog                                     │   │
│  │    URL: interviewing.io/blog/ace-technical...    │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 2. System Design Interview Guide                 │   │
│  │    Type: blog                                     │   │
│  │    URL: interviewing.io/guides/system-design     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ...and 265 more items                                  │
└─────────────────────────────────────────────────────────┘
```

## 📄 Downloaded JSON Structure

When you click "Download JSON", you get:

````json
{
  "site": "https://interviewing.io",
  "items": [
    {
      "title": "How to Ace Technical Interviews",
      "content": "# How to Ace Technical Interviews\n\nTechnical interviews can be daunting, but with the right preparation...\n\n## Key Points\n\n- Practice coding problems daily\n- Understand data structures\n- Master algorithms\n\n## Example Problem\n\n```python\ndef two_sum(nums, target):\n    # Implementation here\n```\n\n## Conclusion\n\nWith consistent practice...",
      "content_type": "blog",
      "source_url": "https://interviewing.io/blog/ace-technical-interviews"
    }
    // ... more items
  ],
  "stats": {
    "total_items": 275,
    "content_types": {
      "blog": 270,
      "other": 5
    }
  }
}
````

## 🎯 Real Test Cases

### Test Case 1: Technical Blog

**Input**: `interviewing.io`
**Result**:

- 270+ items
- Interview guides, coding questions, blog posts
- All in clean Markdown format

### Test Case 2: Documentation Site

**Input**: `quill.co`
**Result**:

- 30+ items
- Mix of blog posts and documentation
- API guides, tutorials

### Test Case 3: Personal Blog

**Input**: `nilmamano.com/blog/category/dsa`
**Result**:

- 31+ items
- Data structures & algorithms posts
- Technical tutorials

## 💡 Tips for Best Results

1. **Use the root domain** for comprehensive scraping
2. **Use specific paths** for targeted content
3. **Check robots.txt** - some sites may block scrapers
4. **Be patient** - large sites take time (1-3 minutes)

## 🔧 Advanced Features

### Authentication (for protected content)

```javascript
// Use API with cookies
{
  "url": "members-only-site.com",
  "cookies": {
    "session_id": "your-session-cookie"
  }
}
```

### Content Type Detection

The scraper automatically detects:

- `blog` - Articles, posts, guides
- `book` - Chapters with ISBN, copyright
- `podcast_transcript` - Episodes with timestamps
- `call_transcript` - Earnings calls
- `linkedin_post` - LinkedIn articles
- `reddit_comment` - Reddit posts
- `other` - Documentation, misc

## ⚡ Performance

| Site Size | Pages  | Time          |
| --------- | ------ | ------------- |
| Small     | < 50   | 5-15 seconds  |
| Medium    | 50-200 | 15-60 seconds |
| Large     | 200+   | 1-3 minutes   |

## 🆘 Common Issues

**"No items found"**

- Site may require login
- Try a more specific URL path
- Check if site blocks scrapers

**"Slow scraping"**

- Normal for large sites
- Concurrent limit prevents overload
- Be patient!

**"Port already in use"**

```bash
# Windows
taskkill /F /IM node.exe

# Mac/Linux
killall node
```

---

**That's it!** You now know everything about using the Knowledge Base Scraper. Happy scraping! 🚀
