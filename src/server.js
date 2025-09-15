import './polyfills.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import UniversalScraper from './scraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Initialize scraper
const scraper = new UniversalScraper();

// API Routes
app.post('/api/scrape', async (req, res) => {
    try {
        const { url, auth, cookies, headers } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`API: Starting scrape for ${url}`);

        // Create scraper with auth options if provided
        const scraperOptions = {};
        if (auth) scraperOptions.auth = auth;
        if (cookies) scraperOptions.cookies = cookies;
        if (headers) scraperOptions.headers = headers;

        const scraperInstance = Object.keys(scraperOptions).length > 0
            ? new UniversalScraper(scraperOptions)
            : scraper;

        // Start scraping
        const result = await scraperInstance.scrapeWebsite(url);

        // Add statistics
        if (result.items) {
            result.stats = {
                total_items: result.items.length,
                content_types: {}
            };

            for (const item of result.items) {
                const contentType = item.content_type || 'other';
                result.stats.content_types[contentType] =
                    (result.stats.content_types[contentType] || 0) + 1;
            }
        }

        res.json(result);

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: 'An error occurred while scraping',
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Knowledge Base Scraper is running' });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          Knowledge Base Scraper Server                        ║
║                                                               ║
║  Server is running on http://localhost:${PORT}                   ║
║  API endpoint: POST http://localhost:${PORT}/api/scrape          ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});
