#!/usr/bin/env node

/**
 * Example: Using the scraper with authentication
 * 
 * This demonstrates how to scrape sites that require:
 * - Basic authentication
 * - Cookie-based authentication
 * - Custom headers
 */

import UniversalScraper from '../src/scraper.js';

async function scrapeWithAuth() {
    console.log('Knowledge Base Scraper - Authentication Examples\n');

    // Example 1: Basic Authentication
    console.log('1. Scraping with Basic Authentication:');
    const scraperWithBasicAuth = new UniversalScraper({
        auth: {
            username: 'your-username',
            password: 'your-password'
        }
    });

    // Example usage (replace with actual URL requiring auth)
    // const result1 = await scraperWithBasicAuth.scrapeWebsite('https://protected-site.com');

    // Example 2: Cookie-based Authentication
    console.log('\n2. Scraping with Cookies:');
    const scraperWithCookies = new UniversalScraper({
        cookies: {
            'session_id': 'your-session-id',
            'auth_token': 'your-auth-token',
            'user_id': '12345'
        }
    });

    // Example usage
    // const result2 = await scraperWithCookies.scrapeWebsite('https://members-only-site.com');

    // Example 3: Custom Headers
    console.log('\n3. Scraping with Custom Headers:');
    const scraperWithHeaders = new UniversalScraper({
        headers: {
            'Authorization': 'Bearer your-api-token',
            'X-API-Key': 'your-api-key',
            'Accept': 'application/json'
        }
    });

    // Example usage
    // const result3 = await scraperWithHeaders.scrapeWebsite('https://api-protected-site.com');

    // Example 4: Combined Authentication
    console.log('\n4. Scraping with Combined Auth Methods:');
    const scraperWithFullAuth = new UniversalScraper({
        auth: {
            username: 'api-user',
            password: 'api-pass'
        },
        cookies: {
            'session': 'abc123',
            'preference': 'dark-mode'
        },
        headers: {
            'X-Custom-Header': 'custom-value',
            'Referer': 'https://trusted-referrer.com'
        }
    });

    // Example usage
    // const result4 = await scraperWithFullAuth.scrapeWebsite('https://fully-protected-site.com');

    console.log('\n✅ Authentication configuration examples shown above.');
    console.log('\nTo use these in practice:');
    console.log('1. Replace the placeholder values with actual credentials');
    console.log('2. Uncomment the scraping lines');
    console.log('3. Handle the results as shown in the main example.js');
}

// Example: Scraping LinkedIn (requires authentication)
async function scrapeLinkedIn() {
    console.log('\n\nExample: Scraping LinkedIn Articles\n');

    // LinkedIn typically requires authentication
    const linkedInScraper = new UniversalScraper({
        cookies: {
            'li_at': 'your-linkedin-session-cookie', // Get this from browser DevTools
            'JSESSIONID': 'your-jsessionid'
        },
        headers: {
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache'
        }
    });

    console.log('Note: LinkedIn requires valid session cookies.');
    console.log('To get these:');
    console.log('1. Log into LinkedIn in your browser');
    console.log('2. Open DevTools (F12)');
    console.log('3. Go to Application > Cookies');
    console.log('4. Copy the li_at cookie value');

    // Example usage (uncomment with valid cookies)
    // try {
    //   const result = await linkedInScraper.scrapeWebsite('https://www.linkedin.com/pulse/your-article-url');
    //   console.log(`Found ${result.items?.length || 0} items`);
    //   
    //   // The content type should be detected as 'linkedin_post'
    //   if (result.items?.[0]) {
    //     console.log(`Content type: ${result.items[0].content_type}`);
    //   }
    // } catch (error) {
    //   console.error('Error:', error.message);
    // }
}

// Run examples
scrapeWithAuth()
    .then(() => scrapeLinkedIn())
    .catch(console.error);
