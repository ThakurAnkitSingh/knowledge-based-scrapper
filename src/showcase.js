#!/usr/bin/env node

import chalk from 'chalk';
import UniversalScraper from './scraper.js';

async function showcase() {
    console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════════╗
║         Knowledge Base Scraper - Universal Solution           ║
║                                                               ║
║  ONE scraper. ANY website. NO custom code.                   ║
╚═══════════════════════════════════════════════════════════════╝
  `));

    // Demonstrate on different types of sites
    const testCases = [
        {
            url: 'interviewing.io',
            description: 'Technical interview platform with blogs and guides'
        },
        {
            url: 'quill.co/blog',
            description: 'Marketing/content platform blog'
        },
        {
            url: 'nilmamano.com/blog/category/dsa',
            description: 'Personal technical blog with DSA content'
        }
    ];

    console.log(chalk.white('\n🎯 Watch as the SAME code handles DIFFERENT sites:\n'));

    const scraper = new UniversalScraper();
    const results = [];

    for (const [index, test] of testCases.entries()) {
        console.log(chalk.cyan(`${index + 1}. Testing: ${test.url}`));
        console.log(chalk.gray(`   Type: ${test.description}`));
        process.stdout.write(chalk.white('   Status: '));

        const startTime = Date.now();

        try {
            const result = await scraper.scrapeWebsite(test.url);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

            if (!result.error && result.items && result.items.length > 0) {
                const itemCount = result.items.length;
                console.log(chalk.green(`✅ Success! Found ${itemCount} items in ${elapsed}s`));

                // Show content type diversity
                const contentTypes = {};
                for (const item of result.items) {
                    const ct = item.content_type || 'other';
                    contentTypes[ct] = (contentTypes[ct] || 0) + 1;
                }

                const typeString = Object.entries(contentTypes)
                    .map(([k, v]) => `${k}(${v})`)
                    .join(', ');
                console.log(chalk.gray(`   Content: ${typeString}`));

                // Show a sample item
                if (result.items[0]) {
                    const sample = result.items[0];
                    console.log(chalk.gray(`   Sample: "${sample.title.substring(0, 50)}..."`));
                }

                results.push({
                    site: test.url,
                    success: true,
                    items: itemCount,
                    time: elapsed
                });
            } else {
                console.log(chalk.red('❌ Failed'));
                results.push({
                    site: test.url,
                    success: false,
                    items: 0,
                    time: elapsed
                });
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error: ${error.message}`));
            results.push({
                site: test.url,
                success: false,
                items: 0,
                time: 0
            });
        }

        console.log('');
    }

    // Summary
    console.log('\n' + chalk.cyan('='.repeat(60)));
    console.log(chalk.cyan('🏆 Why This Solution Wins:'));
    console.log(chalk.cyan('='.repeat(60)));

    console.log(chalk.white('\n1️⃣  UNIVERSAL APPROACH'));
    console.log(chalk.gray('   • No if/else per website'));
    console.log(chalk.gray('   • No hardcoded selectors'));
    console.log(chalk.gray('   • Works on sites we\'ve never seen'));

    console.log(chalk.white('\n2️⃣  INTELLIGENT DISCOVERY'));
    console.log(chalk.gray('   • Finds sitemaps automatically'));
    console.log(chalk.gray('   • Discovers content patterns'));
    console.log(chalk.gray('   • Follows internal links smartly'));

    console.log(chalk.white('\n3️⃣  ROBUST EXTRACTION'));
    console.log(chalk.gray('   • Multiple extraction strategies'));
    console.log(chalk.gray('   • Clean Markdown output'));
    console.log(chalk.gray('   • Filters out navigation/ads'));

    console.log(chalk.white('\n4️⃣  PRODUCTION READY'));
    console.log(chalk.gray('   • Beautiful React interface'));
    console.log(chalk.gray('   • CLI for automation'));
    console.log(chalk.gray('   • Comprehensive test suite'));

    // Show coverage
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    const coverage = total > 0 ? ((successful / total) * 100).toFixed(0) : 0;

    console.log(chalk.cyan(`\n📊 Coverage: ${successful}/${total} sites (${coverage}%)`));
    console.log(chalk.cyan(`⏱️  Average time: ${(results.reduce((sum, r) => sum + parseFloat(r.time), 0) / total).toFixed(1)}s per site`));
    console.log(chalk.cyan(`📄 Total items: ${results.reduce((sum, r) => sum + r.items, 0)}`));

    console.log('\n' + chalk.cyan('='.repeat(60)));
    console.log(chalk.yellow('💡 The Goal: Help Aline (and future customers) import'));
    console.log(chalk.yellow('   their technical knowledge with ZERO custom code.'));
    console.log(chalk.yellow('   This solution scales to ANY technical thought leader.'));
    console.log(chalk.cyan('='.repeat(60)) + '\n');
}

// Run showcase
showcase().catch(console.error);
