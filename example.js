#!/usr/bin/env node

/**
 * Example usage of the Knowledge Base Scraper
 * 
 * This script demonstrates how to use the scraper programmatically
 */

import UniversalScraper from './src/scraper.js';
import fs from 'fs/promises';
import chalk from 'chalk';

async function main() {
    console.log(chalk.cyan('Knowledge Base Scraper - Example Usage\n'));

    // Example 1: Scrape a single website
    console.log(chalk.yellow('Example 1: Scraping interviewing.io...'));

    const scraper = new UniversalScraper();
    const result = await scraper.scrapeWebsite('interviewing.io');

    if (result.error) {
        console.log(chalk.red(`Error: ${result.error}`));
    } else {
        console.log(chalk.green(`✅ Successfully scraped ${result.site}`));
        console.log(chalk.white(`📊 Found ${result.items?.length || 0} items\n`));

        // Show first few items
        if (result.items && result.items.length > 0) {
            result.items.slice(0, 3).forEach((item, index) => {
                console.log(chalk.cyan(`Item ${index + 1}:`));
                console.log(chalk.white(`  Title: ${item.title}`));
                console.log(chalk.gray(`  Type: ${item.content_type}`));
                console.log(chalk.gray(`  URL: ${item.source_url}`));
                console.log(chalk.gray(`  Content preview: ${item.content.substring(0, 100)}...`));
                console.log('');
            });
        }
    }

    // Save to file
    await fs.writeFile(
        'example_output.json',
        JSON.stringify(result, null, 2),
        'utf8'
    );
    console.log(chalk.green('💾 Full results saved to example_output.json'));

    // Example 2: Process multiple sites
    console.log(chalk.yellow('\n' + '='.repeat(60)));
    console.log(chalk.yellow('Example 2: Processing multiple sites\n'));

    const sites = [
        'quill.co/blog',
        'nilmamano.com/blog/category/dsa'
    ];

    const allItems = [];

    for (const site of sites) {
        process.stdout.write(chalk.white(`Scraping ${site}...`));

        try {
            const result = await scraper.scrapeWebsite(site);

            if (result.items) {
                allItems.push(...result.items);
                console.log(chalk.green(` ✅ Found ${result.items.length} items`));
            } else {
                console.log(chalk.red(` ❌ Failed`));
            }
        } catch (error) {
            console.log(chalk.red(` ❌ Error: ${error.message}`));
        }
    }

    console.log(chalk.cyan(`\n🎉 Total items collected: ${allItems.length}`));

    // Example 3: Filter by content type
    console.log(chalk.yellow('\n' + '='.repeat(60)));
    console.log(chalk.yellow('Example 3: Filtering by content type\n'));

    const blogPosts = allItems.filter(item => item.content_type === 'blog');
    console.log(chalk.white(`Blog posts: ${blogPosts.length}`));

    const otherContent = allItems.filter(item => item.content_type !== 'blog');
    console.log(chalk.white(`Other content: ${otherContent.length}`));

    // Example 4: Search for specific content
    console.log(chalk.yellow('\n' + '='.repeat(60)));
    console.log(chalk.yellow('Example 4: Finding specific content\n'));

    const keyword = 'interview';
    const matchingItems = allItems.filter(item =>
        item.title.toLowerCase().includes(keyword) ||
        item.content.toLowerCase().includes(keyword)
    );

    console.log(chalk.white(`Items mentioning '${keyword}': ${matchingItems.length}`));
    matchingItems.slice(0, 3).forEach(item => {
        console.log(chalk.gray(`  - ${item.title}`));
    });

    console.log(chalk.cyan('\n✨ Example completed!'));
}

// Run the example
main().catch(error => {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
});
