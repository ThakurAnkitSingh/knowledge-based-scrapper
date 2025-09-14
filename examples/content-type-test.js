#!/usr/bin/env node

/**
 * Test the enhanced content type detection
 * 
 * This demonstrates how the scraper automatically detects different content types
 */

import UniversalScraper from '../src/scraper.js';
import chalk from 'chalk';

// Test content samples
const TEST_CONTENT = [
    {
        name: 'Book Chapter',
        url: 'https://example.com/book/chapter-1',
        content: `
Chapter 1: Introduction to Programming

Copyright © 2024 by Tech Author. All rights reserved.
First published in 2024.

In this chapter, we'll explore the fundamentals of programming...

Table of Contents:
1. Introduction
2. Basic Concepts
3. Your First Program

ISBN: 978-1234567890
    `
    },
    {
        name: 'Podcast Transcript',
        url: 'https://example.com/podcast/episode-42',
        content: `
Welcome to the Tech Talk Podcast - Episode 42

[00:00:00] Host: Hello everyone, welcome back to Tech Talk!
[00:00:15] Guest: Thanks for having me on the show.
[00:00:30] Host: Today we're discussing AI and machine learning...

Show notes and full transcript available at...
Listen to this episode on Spotify or Apple Podcasts.
    `
    },
    {
        name: 'Earnings Call Transcript',
        url: 'https://example.com/investor/q3-2024-call',
        content: `
Q3 2024 Earnings Call Transcript

Operator: Good morning and welcome to TechCorp's Q3 2024 earnings call.

CEO: Thank you operator. We're pleased to report strong results...

Analyst: Can you provide guidance on Q4?

CFO: We expect continued growth in the 15-20% range...

Operator instructions: Press *1 to ask a question.
    `
    },
    {
        name: 'LinkedIn Post',
        url: 'https://linkedin.com/posts/user/exciting-news',
        content: `
Exciting news! I'm thrilled to announce...

#Leadership #Innovation #TechNews
    `
    },
    {
        name: 'Reddit Comment',
        url: 'https://reddit.com/r/programming/comments/abc123',
        content: `
Great article! I've been using this approach for years...
    `
    },
    {
        name: 'Technical Blog Post',
        url: 'https://techblog.com/blog/how-to-optimize-react',
        content: `
How to Optimize React Performance

Posted by Jane Developer on March 15, 2024
Tags: React, Performance, JavaScript

In this tutorial, we'll explore various techniques...
    `
    }
];

async function testContentTypeDetection() {
    console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════════╗
║         Content Type Detection Test                           ║
╚═══════════════════════════════════════════════════════════════╝
  `));

    const scraper = new UniversalScraper();

    console.log(chalk.white('Testing content type detection on various samples:\n'));

    for (const test of TEST_CONTENT) {
        console.log(chalk.yellow(`Testing: ${test.name}`));
        console.log(chalk.gray(`URL: ${test.url}`));

        // Test the determineContentType method directly
        const detectedType = scraper.determineContentType(test.url, test.content);

        console.log(chalk.green(`Detected type: ${chalk.bold(detectedType)}`));
        console.log(chalk.gray('---\n'));
    }

    // Show expected results
    console.log(chalk.cyan('\nExpected Results:'));
    console.log(chalk.white('• Book Chapter → book'));
    console.log(chalk.white('• Podcast Transcript → podcast_transcript'));
    console.log(chalk.white('• Earnings Call → call_transcript'));
    console.log(chalk.white('• LinkedIn Post → linkedin_post'));
    console.log(chalk.white('• Reddit Comment → reddit_comment'));
    console.log(chalk.white('• Technical Blog → blog'));
}

// Test real-world detection
async function testRealWorldSite(url) {
    console.log(chalk.cyan('\n\nTesting Real-World Site:\n'));

    const scraper = new UniversalScraper();

    try {
        console.log(chalk.white(`Scraping: ${url}`));
        const result = await scraper.scrapeWebsite(url);

        if (result.items && result.items.length > 0) {
            console.log(chalk.green(`\n✅ Found ${result.items.length} items\n`));

            // Show content type breakdown
            const contentTypes = {};
            for (const item of result.items) {
                const type = item.content_type || 'other';
                contentTypes[type] = (contentTypes[type] || 0) + 1;
            }

            console.log(chalk.cyan('Content Type Breakdown:'));
            for (const [type, count] of Object.entries(contentTypes)) {
                console.log(chalk.white(`  ${type}: ${count} items`));
            }

            // Show sample items
            console.log(chalk.cyan('\nSample Items:'));
            result.items.slice(0, 3).forEach((item, i) => {
                console.log(chalk.white(`\n${i + 1}. ${item.title}`));
                console.log(chalk.gray(`   Type: ${chalk.bold(item.content_type)}`));
                console.log(chalk.gray(`   URL: ${item.source_url}`));
            });

        } else {
            console.log(chalk.yellow('No items found'));
        }

    } catch (error) {
        console.log(chalk.red(`Error: ${error.message}`));
    }
}

// Run tests
async function main() {
    // Test content type detection logic
    await testContentTypeDetection();

    // Test on a real site (optional - uncomment to test)
    // await testRealWorldSite('https://interviewing.io');
}

main().catch(console.error);
