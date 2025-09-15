import './polyfills.js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import TurndownService from 'turndown';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { parseStringPromise } from 'xml2js';
import URL from 'url-parse';
import pLimit from 'p-limit';
import robotsParser from 'robots-parser';

class UniversalScraper {
    constructor(options = {}) {
        this.visitedUrls = new Set();
        this.turndownService = new TurndownService({
            headingStyle: 'atx',
            bulletListMarker: '-',
            codeBlockStyle: 'fenced'
        });

        // Configure turndown to handle more elements properly
        this.turndownService.addRule('strikethrough', {
            filter: ['del', 's', 'strike'],
            replacement: (content) => `~~${content}~~`
        });

        // Comprehensive content patterns covering all common URL structures
        this.contentPatterns = [
            // Content types
            '/blog', '/posts', '/post', '/articles', '/article', '/news', '/insights', '/stories',
            '/writings', '/write', '/read', '/content', '/publications', '/publish',

            // Learning resources
            '/learn', '/learning', '/guides', '/guide', '/tutorials', '/tutorial',
            '/how-to', '/howto', '/how_to', '/lessons', '/courses', '/course',
            '/education', '/training', '/workshop', '/webinar',

            // Documentation & Help
            '/docs', '/documentation', '/doc', '/api', '/reference', '/manual',
            '/help', '/support', '/faq', '/faqs', '/kb', '/knowledge-base',
            '/knowledge', '/wiki', '/resources', '/resource',

            // Technical content
            '/tech', '/technical', '/engineering', '/development', '/programming',
            '/coding', '/code', '/developers', '/dev', '/labs', '/research',

            // Media & Updates
            '/podcast', '/podcasts', '/video', '/videos', '/media', '/press',
            '/updates', '/changelog', '/releases', '/announcements',

            // Community & Insights
            '/community', '/forum', '/forums', '/discussion', '/insights',
            '/thoughts', '/opinions', '/perspectives', '/ideas', '/tips',

            // Categories & Topics
            '/topics', '/topic', '/categories', '/category', '/cat', '/tag',
            '/subject', '/subjects', '/area', '/areas', '/section',

            // Case studies & Examples
            '/case-study', '/case-studies', '/cases', '/examples', '/example',
            '/showcase', '/portfolio', '/work', '/projects', '/stories',

            // Company content
            '/about', '/team', '/careers', '/culture', '/values', '/mission',
            '/events', '/event', '/conference', '/meetup', '/talks',

            // Time-based
            '/archive', '/archives', '/history', '/timeline', '/recent',
            '/latest', '/new', '/trending', '/popular', '/featured'
        ];

        // Keywords that indicate content anywhere in URL
        this.contentKeywords = new RegExp(
            'tutorial|guide|article|blog|post|story|lesson|course|' +
            'how-to|howto|how_to|tip|trick|example|study|case|' +
            'learn|teach|explain|understand|master|practice|' +
            'introduction|intro|basic|advanced|beginner|intermediate|' +
            'documentation|docs|reference|manual|handbook|' +
            'resource|material|content|information|knowledge|' +
            'update|announcement|release|changelog|news|' +
            'insight|thought|opinion|perspective|analysis|' +
            'technical|tech|engineering|development|programming|' +
            'podcast|video|webinar|presentation|talk|' +
            'faq|help|support|troubleshoot|solve|fix|' +
            'best-practice|pattern|approach|method|technique|' +
            'framework|library|tool|platform|service|' +
            'review|comparison|versus|alternative|option',
            'i'
        );

        // URL patterns that indicate content structure
        this.datePatterns = [
            /\/\d{4}\/\d{2}\//, // /2024/03/
            /\/\d{4}\/\d{1,2}\//, // /2024/3/
            /\/\d{4}-\d{2}-\d{2}/, // /2024-03-15
            /\/\d{8}\//, // /20240315/
        ];

        // Patterns to identify content by URL structure
        this.structurePatterns = [
            /\/[a-z-]+\/[a-z0-9-]+\/?$/i, // /category/article-name
            /\/\d+\/[a-z0-9-]+\/?$/i, // /123/article-name (ID based)
            /\/[a-z]{2}\/[a-z-]+\/?$/i, // /en/article-name (language based)
            /\/[a-z-]+\/\d{4}\//, // /blog/2024/
            /\/(p|page|post|article)\/\d+/i, // /p/123 (common in CMSs)
        ];

        this.fileExtensionsToSkip = new Set([
            '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
            '.zip', '.rar', '.mp4', '.mp3', '.jpg', '.jpeg', '.png',
            '.gif', '.svg', '.exe', '.dmg', '.iso', '.tar', '.gz'
        ]);

        this.limit = pLimit(5); // Limit concurrent requests

        // Authentication options
        this.auth = options.auth || {};
        this.cookies = options.cookies || {};
        this.headers = options.headers || {};

        // Configure axios defaults with auth if provided
        this.axiosConfig = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; KnowledgeBaseScraper/1.0)',
                ...this.headers
            }
        };

        if (this.auth.username && this.auth.password) {
            this.axiosConfig.auth = {
                username: this.auth.username,
                password: this.auth.password
            };
        }

        if (this.cookies && Object.keys(this.cookies).length > 0) {
            const cookieString = Object.entries(this.cookies)
                .map(([key, value]) => `${key}=${value}`)
                .join('; ');
            this.axiosConfig.headers.Cookie = cookieString;
        }
    }

    async scrapeWebsite(inputUrl) {
        try {
            // Normalize URL
            let url = inputUrl;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }

            const baseUrl = this.getBaseUrl(url);
            console.log(`Starting scrape for: ${baseUrl}`);

            // Check robots.txt
            const robotsAllowed = await this.checkRobotsTxt(baseUrl);
            if (!robotsAllowed) {
                console.log('Robots.txt disallows scraping');
            }

            // Discover all URLs
            const allUrls = await this.discoverAllUrls(baseUrl);
            console.log(`Found ${allUrls.size} URLs to process`);

            // Scrape content from all URLs
            const items = [];
            const urlArray = Array.from(allUrls);

            // Process URLs in batches with concurrency limit
            const promises = urlArray.map(url =>
                this.limit(() => this.scrapeSingleUrl(url))
            );

            const results = await Promise.allSettled(promises);

            for (const result of results) {
                if (result.status === 'fulfilled' && result.value) {
                    items.push(result.value);
                }
            }

            console.log(`Successfully scraped ${items.length} items`);

            return {
                site: baseUrl,
                items: items
            };

        } catch (error) {
            console.error('Scraping failed:', error);
            return {
                site: inputUrl,
                error: error.message,
                items: []
            };
        }
    }

    getBaseUrl(url) {
        const parsed = new URL(url);
        return `${parsed.protocol}//${parsed.host}`;
    }

    async checkRobotsTxt(baseUrl) {
        try {
            const robotsUrl = `${baseUrl}/robots.txt`;
            const response = await axios.get(robotsUrl, {
                ...this.axiosConfig,
                timeout: 5000,
                validateStatus: (status) => status < 500
            });

            if (response.status === 200) {
                const robots = robotsParser(robotsUrl, response.data);
                return robots.isAllowed(baseUrl, 'KnowledgeBaseScraper');
            }

            return true; // If no robots.txt, assume allowed
        } catch (error) {
            return true; // If error fetching robots.txt, assume allowed
        }
    }

    async discoverAllUrls(baseUrl) {
        const urls = new Set();

        // Strategy 1: Check sitemap
        const sitemapUrls = await this.getUrlsFromSitemap(baseUrl);
        sitemapUrls.forEach(url => urls.add(url));

        // Strategy 2: Crawl from common content paths
        const crawlPromises = this.contentPatterns.map(pattern =>
            this.crawlPageForUrls(`${baseUrl}${pattern}`, baseUrl)
        );

        // Strategy 3: Crawl from homepage
        crawlPromises.push(this.crawlPageForUrls(baseUrl, baseUrl));

        const crawlResults = await Promise.allSettled(crawlPromises);

        for (const result of crawlResults) {
            if (result.status === 'fulfilled' && result.value) {
                result.value.forEach(url => urls.add(url));
            }
        }

        // Filter content URLs
        return this.filterContentUrls(urls, baseUrl);
    }

    async getUrlsFromSitemap(baseUrl) {
        const urls = new Set();
        const sitemapUrls = [
            `${baseUrl}/sitemap.xml`,
            `${baseUrl}/sitemap_index.xml`,
            `${baseUrl}/post-sitemap.xml`,
            `${baseUrl}/page-sitemap.xml`,
            `${baseUrl}/news-sitemap.xml`
        ];

        for (const sitemapUrl of sitemapUrls) {
            try {
                const response = await axios.get(sitemapUrl, {
                    ...this.axiosConfig,
                    timeout: 10000,
                    validateStatus: (status) => status === 200
                });

                if (response.data) {
                    const result = await parseStringPromise(response.data);

                    // Handle sitemap index
                    if (result.sitemapindex?.sitemap) {
                        for (const sitemap of result.sitemapindex.sitemap) {
                            if (sitemap.loc && sitemap.loc[0]) {
                                const childUrls = await this.getUrlsFromSitemap(sitemap.loc[0]);
                                childUrls.forEach(url => urls.add(url));
                            }
                        }
                    }

                    // Handle regular sitemap
                    if (result.urlset?.url) {
                        for (const url of result.urlset.url) {
                            if (url.loc && url.loc[0]) {
                                urls.add(url.loc[0]);
                            }
                        }
                    }
                }
            } catch (error) {
                // Silently continue if sitemap not found
            }
        }

        return urls;
    }

    async crawlPageForUrls(url, baseUrl, maxDepth = 2, currentDepth = 0) {
        if (currentDepth >= maxDepth || this.visitedUrls.has(url)) {
            return new Set();
        }

        this.visitedUrls.add(url);
        const urls = new Set();

        try {
            const response = await axios.get(url, {
                ...this.axiosConfig,
                timeout: 10000,
                validateStatus: (status) => status === 200
            });

            const $ = cheerio.load(response.data);

            // Find all links
            $('a[href]').each((_, element) => {
                const href = $(element).attr('href');
                if (href) {
                    const absoluteUrl = new URL(href, url).toString();
                    const parsed = new URL(absoluteUrl);

                    // Only include URLs from the same domain
                    if (parsed.host === new URL(baseUrl).host) {
                        // Remove fragment and query params for cleaner URLs
                        const cleanUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;

                        // Skip if it has a file extension we want to ignore
                        const hasSkipExtension = Array.from(this.fileExtensionsToSkip).some(ext =>
                            cleanUrl.toLowerCase().endsWith(ext)
                        );

                        if (!hasSkipExtension) {
                            urls.add(cleanUrl);

                            // Recursively crawl content pages
                            const pathLower = parsed.pathname.toLowerCase();

                            // Check multiple indicators for content
                            const isContentPage =
                                // 1. Matches our content patterns
                                this.contentPatterns.some(pattern => pathLower.includes(pattern)) ||
                                // 2. Contains content keywords
                                this.contentKeywords.test(pathLower) ||
                                // 3. Matches date-based patterns (blog posts often use dates)
                                this.datePatterns.some(pattern => pattern.test(parsed.pathname)) ||
                                // 4. Matches common content URL structures
                                this.structurePatterns.some(pattern => pattern.test(parsed.pathname));

                            if (isContentPage && currentDepth < maxDepth - 1) {
                                this.crawlPageForUrls(cleanUrl, baseUrl, maxDepth, currentDepth + 1)
                                    .then(childUrls => childUrls.forEach(url => urls.add(url)));
                            }
                        }
                    }
                }
            });

        } catch (error) {
            // Silently continue on error
        }

        return urls;
    }

    filterContentUrls(urls, baseUrl) {
        const filtered = new Set();

        // Patterns to exclude - updated to be more precise
        const excludePatterns = [
            // Navigation & pagination
            /\/page\/\d+$/i, /\/p\/\d+$/i, /\?page=\d+/i, /\/tag\/?$/i, /\/tags\/?$/i,
            /\/category\/?$/i, /\/categories\/?$/i, /\/author\/?$/i, /\/authors\/?$/i,

            // User & account pages
            /\/login\/?$/i, /\/signin\/?$/i, /\/signup\/?$/i, /\/register\/?$/i,
            /\/logout\/?$/i, /\/account\/?$/i, /\/profile\/?$/i, /\/settings\/?$/i,
            /\/dashboard\/?$/i, /\/admin/i, /\/wp-admin/i,

            // Legal & policy pages  
            /\/privacy\/?$/i, /\/terms\/?$/i, /\/tos\/?$/i, /\/disclaimer\/?$/i,
            /\/cookie/i, /\/gdpr/i, /\/legal\/?$/i, /\/policy\/?$/i,

            // Commerce
            /\/cart\/?$/i, /\/checkout\/?$/i, /\/shop\/?$/i, /\/store\/?$/i,
            /\/products?\/?$/i, /\/pricing\/?$/i, /\/plans\/?$/i, /\/subscribe\/?$/i,

            // Technical/Feed URLs
            /\.xml$/i, /\.json$/i, /\/feed\/?$/i, /\/rss\/?$/i, /\/atom\/?$/i,
            /\/sitemap/i, /\/robots\.txt$/i, /\/#/i,

            // Error pages
            /\/404\/?$/i, /\/error\/?$/i, /\/500\/?$/i, /\/403\/?$/i,

            // Search & filters
            /\/search\/?$/i, /\?q=/i, /\?s=/i, /\/filter\/?$/i,

            // Contact pages (but keep specific contact articles)
            /\/contact\/?$/i, /\/contact-us\/?$/i,

            // Print/PDF versions
            /\/print\/?$/i, /\.pdf$/i, /\/download\/?$/i
        ];

        for (const url of urls) {
            const parsed = new URL(url);
            const pathname = parsed.pathname;
            const pathLower = pathname.toLowerCase();

            // Skip if matches exclude pattern
            const shouldExclude = excludePatterns.some(pattern => pattern.test(url));

            // Skip if it's just the base URL
            const isBaseUrl = url.replace(/\/$/, '') === baseUrl.replace(/\/$/, '');

            // Include if it looks like content (even if it matches some exclude patterns)
            const looksLikeContent =
                this.contentKeywords.test(pathLower) ||
                this.datePatterns.some(pattern => pattern.test(pathname)) ||
                this.structurePatterns.some(pattern => pattern.test(pathname)) ||
                // Has substantial path depth (likely an article)
                (pathname.split('/').filter(p => p.length > 0).length >= 2 &&
                    /[a-z0-9-]{10,}/i.test(pathname)); // Long slug usually means article

            if (!isBaseUrl && (!shouldExclude || looksLikeContent)) {
                filtered.add(url);
            }
        }

        return filtered;
    }

    async scrapeSingleUrl(url) {
        try {
            console.log(`Scraping: ${url}`);

            // First try with axios for speed
            let content = await this.scrapeWithAxios(url);

            // If content is too short or missing, try with Puppeteer
            if (!content || content.content.length < 100) {
                console.log(`Using Puppeteer for: ${url}`);
                content = await this.scrapeWithPuppeteer(url);
            }

            if (!content || !content.title || content.content.length < 100) {
                return null;
            }

            return {
                title: content.title,
                content: content.content,
                content_type: this.determineContentType(url, content.content),
                source_url: url
            };

        } catch (error) {
            console.error(`Error scraping ${url}:`, error.message);
            return null;
        }
    }

    async scrapeWithAxios(url) {
        try {
            const response = await axios.get(url, {
                ...this.axiosConfig,
                timeout: 15000
            });

            const $ = cheerio.load(response.data);

            // Extract title
            const title = this.extractTitle($, response.data);

            // Extract content
            const content = this.extractContent(response.data, $);

            return { title, content };

        } catch (error) {
            throw error;
        }
    }

    async scrapeWithPuppeteer(url) {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (compatible; KnowledgeBaseScraper/1.0)');

            // Set cookies if provided
            if (this.cookies && Object.keys(this.cookies).length > 0) {
                const cookieArray = Object.entries(this.cookies).map(([name, value]) => ({
                    name,
                    value,
                    domain: new URL(url).hostname,
                    path: '/'
                }));
                await page.setCookie(...cookieArray);
            }

            // Set extra headers if provided
            if (this.headers && Object.keys(this.headers).length > 0) {
                await page.setExtraHTTPHeaders(this.headers);
            }

            await page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // Wait for content to load
            await page.waitForSelector('body', { timeout: 5000 });

            // Get the full HTML
            const html = await page.content();
            const $ = cheerio.load(html);

            // Extract title
            const title = this.extractTitle($, html);

            // Extract content
            const content = this.extractContent(html, $);

            return { title, content };

        } catch (error) {
            throw error;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    extractTitle($, html) {
        // Try multiple strategies
        const strategies = [
            () => $('h1').first().text().trim(),
            () => $('title').text().trim(),
            () => $('meta[property="og:title"]').attr('content'),
            () => $('meta[name="twitter:title"]').attr('content'),
            () => $('article header h1').text().trim(),
            () => $('.entry-title').text().trim(),
            () => $('.post-title').text().trim()
        ];

        for (const strategy of strategies) {
            try {
                const title = strategy();
                if (title && title.length > 5) {
                    return title;
                }
            } catch (e) {
                // Continue to next strategy
            }
        }

        return 'Untitled';
    }

    extractContent(html, $) {
        // Strategy 1: Use Readability
        try {
            const dom = new JSDOM(html, { url: 'https://example.com' });
            const reader = new Readability(dom.window.document);
            const article = reader.parse();

            if (article && article.content) {
                const contentDom = new JSDOM(article.content);
                const contentHtml = contentDom.window.document.body.innerHTML;
                const markdown = this.turndownService.turndown(contentHtml);

                if (markdown && markdown.length > 100) {
                    return this.cleanMarkdown(markdown);
                }
            }
        } catch (e) {
            // Continue to next strategy
        }

        // Strategy 2: Look for common content containers
        const contentSelectors = [
            'article', 'main', '[role="main"]', '.content', '#content',
            '.post', '.entry-content', '.post-content', '.article-content',
            '.blog-post', '.single-post', '[itemprop="articleBody"]',
            '.post-body', '.article-body', '.content-body', '.main-content'
        ];

        for (const selector of contentSelectors) {
            const element = $(selector).first();
            if (element.length > 0) {
                // Remove unwanted elements
                element.find('script, style, nav, aside, .sidebar, .advertisement').remove();

                const html = element.html();
                const markdown = this.turndownService.turndown(html);

                if (markdown && markdown.length > 100) {
                    return this.cleanMarkdown(markdown);
                }
            }
        }

        // Strategy 3: Find the largest text block
        let largestBlock = null;
        let largestLength = 0;

        $('div, section, article').each((_, element) => {
            const $elem = $(element);
            // Remove navigation, ads, etc.
            $elem.find('nav, aside, .sidebar, .ad, .advertisement').remove();

            const text = $elem.text().trim();
            if (text.length > largestLength && text.length > 100) {
                largestLength = text.length;
                largestBlock = $elem;
            }
        });

        if (largestBlock) {
            const html = largestBlock.html();
            const markdown = this.turndownService.turndown(html);
            return this.cleanMarkdown(markdown);
        }

        return '';
    }

    cleanMarkdown(markdown) {
        // Remove excessive newlines
        markdown = markdown.replace(/\n{3,}/g, '\n\n');

        // Remove HTML comments
        markdown = markdown.replace(/<!--[\s\S]*?-->/g, '');

        // Clean up spaces
        markdown = markdown.replace(/ {2,}/g, ' ');

        // Remove empty links
        markdown = markdown.replace(/\[([^\]]*)\]\(\)/g, '$1');

        // Remove leading/trailing whitespace
        markdown = markdown.trim();

        return markdown;
    }

    determineContentType(url, content) {
        const urlLower = url.toLowerCase();
        const contentLower = content.toLowerCase();

        // Check for LinkedIn posts
        if (url.includes('linkedin.com') || url.includes('linkedin')) {
            return 'linkedin_post';
        }

        // Check for Reddit content
        if (url.includes('reddit.com') || url.includes('reddit')) {
            return 'reddit_comment';
        }

        // Enhanced book detection
        if (/\/(book|chapter|excerpt|manuscript)/.test(urlLower) ||
            /chapter[\s-]?\d+/i.test(content) ||
            /table\s+of\s+contents/i.test(content) ||
            /copyright\s+©\s+\d{4}/i.test(content) ||
            /isbn[\s:-]?\d+/i.test(content) ||
            /(preface|foreword|epilogue|appendix)/i.test(content)) {

            // Additional book-specific patterns
            const bookIndicators = [
                /chapter\s+\d+:?\s+/i,
                /part\s+(one|two|three|i+|[0-9]+)/i,
                /section\s+\d+\.\d+/i,
                /©\s*\d{4}\s*(by|,)/i,
                /all\s+rights\s+reserved/i,
                /first\s+(published|edition|printing)/i
            ];

            const bookScore = bookIndicators.reduce((score, pattern) =>
                pattern.test(content) ? score + 1 : score, 0);

            if (bookScore >= 2 || /\/(book|chapter)/.test(urlLower)) {
                return 'book';
            }
        }

        // Enhanced podcast transcript detection
        if ((contentLower.includes('transcript') &&
            (contentLower.includes('podcast') ||
                contentLower.includes('episode') ||
                contentLower.includes('show notes'))) ||
            /\[(\d{1,2}:\d{2}(:\d{2})?)\]/.test(content) || // Timestamp pattern
            /(host|guest|interviewer|interviewee):/i.test(content) ||
            /welcome\s+to\s+(the\s+)?\w+\s+(podcast|show)/i.test(content) ||
            contentLower.includes('audio transcript') ||
            contentLower.includes('listen to this episode')) {
            return 'podcast_transcript';
        }

        // Enhanced call transcript detection
        if ((contentLower.includes('transcript') &&
            (contentLower.includes('call') ||
                contentLower.includes('meeting') ||
                contentLower.includes('conference'))) ||
            /^(speaker|participant|moderator)\s*\d*:/im.test(content) ||
            /(operator|analyst|ceo|cfo|executive):/i.test(content) ||
            /earnings\s+call/i.test(content) ||
            /q\d\s+\d{4}\s+(earnings|results)/i.test(content) ||
            contentLower.includes('operator instructions')) {
            return 'call_transcript';
        }

        // Check for technical documentation
        if (/\/(docs|documentation|api|reference|manual|spec)/.test(urlLower) ||
            /api\s+(reference|documentation|guide)/i.test(content) ||
            /installation\s+(guide|instructions)/i.test(content) ||
            /^#+\s*(parameters|returns|syntax|examples?):/im.test(content)) {
            return 'other';
        }

        // Blog post detection (enhanced)
        if (/\/(blog|post|article|news|story|insight)/.test(urlLower) ||
            /posted\s+(on|by)|published\s+(on|by)/i.test(content) ||
            /by\s+\w+\s+on\s+\w+\s+\d{1,2},?\s+\d{4}/i.test(content) || // Author byline
            /(tags?|categories?|filed under):/i.test(content)) {
            return 'blog';
        }

        // Guide/tutorial detection (still categorized as blog)
        if (/\/(guide|tutorial|learn|how-to|lesson|course)/.test(urlLower) ||
            /^(step|lesson)\s+\d+:?/im.test(content) ||
            /how\s+to\s+\w+/i.test(content) ||
            /in\s+this\s+(tutorial|guide|article)/i.test(content)) {
            return 'blog';
        }

        // Default to blog if no other type matches
        return 'blog';
    }
}

// Export for use in other modules
export default UniversalScraper;
