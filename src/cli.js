#!/usr/bin/env node

import './polyfills.js';
import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import UniversalScraper from './scraper.js';

// Banner
function printBanner() {
    console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════════╗
║     Knowledge Base Scraper - Technical Content Importer       ║
╚═══════════════════════════════════════════════════════════════╝
  `));
}

// Configure CLI
program
    .name('scraper')
    .description('Scrape websites and convert to knowledge base format')
    .version('1.0.0')
    .argument('<url>', 'The website URL to scrape')
    .option('-o, --output <file>', 'Output file path (default: knowledge_base_<timestamp>.json)')
    .option('-p, --pretty', 'Pretty print JSON output')
    .option('-v, --verbose', 'Show detailed progress')
    .action(async (url, options) => {
        printBanner();

        const spinner = ora({
            text: `Starting scrape for: ${url}`,
            color: 'cyan'
        }).start();

        try {
            const scraper = new UniversalScraper();
            const startTime = Date.now();

            // Perform scraping
            const result = await scraper.scrapeWebsite(url);

            const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);

            if (result.error) {
                spinner.fail(chalk.red(`Scraping failed: ${result.error}`));
                process.exit(1);
            }

            spinner.succeed(chalk.green(`Scraping completed in ${elapsedTime} seconds!`));

            // Display summary
            if (result.items && result.items.length > 0) {
                console.log(chalk.cyan('\n📊 Summary:'));
                console.log(chalk.white(`   Total items found: ${chalk.bold(result.items.length)}`));

                // Content type breakdown
                const contentTypes = {};
                for (const item of result.items) {
                    const type = item.content_type || 'other';
                    contentTypes[type] = (contentTypes[type] || 0) + 1;
                }

                console.log(chalk.white('   Content types:'));
                for (const [type, count] of Object.entries(contentTypes)) {
                    console.log(chalk.gray(`     - ${type}: ${count}`));
                }

                // Sample items
                if (options.verbose) {
                    console.log(chalk.cyan('\n📄 Sample items:'));
                    result.items.slice(0, 3).forEach((item, index) => {
                        console.log(chalk.white(`\n   ${index + 1}. ${item.title}`));
                        console.log(chalk.gray(`      Type: ${item.content_type}`));
                        console.log(chalk.gray(`      URL: ${item.source_url}`));
                        console.log(chalk.gray(`      Content: ${item.content.substring(0, 100)}...`));
                    });

                    if (result.items.length > 3) {
                        console.log(chalk.gray(`\n   ...and ${result.items.length - 3} more items`));
                    }
                }
            } else {
                console.log(chalk.yellow('\n⚠️  No content items found'));
            }

            // Save to file
            const outputFile = options.output ||
                `knowledge_base_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}.json`;

            const jsonOutput = options.pretty ?
                JSON.stringify(result, null, 2) :
                JSON.stringify(result);

            await fs.writeFile(outputFile, jsonOutput, 'utf8');

            console.log(chalk.green(`\n💾 Results saved to: ${chalk.bold(outputFile)}`));

        } catch (error) {
            spinner.fail(chalk.red('An error occurred'));
            console.error(chalk.red(error.message));
            if (options.verbose) {
                console.error(error.stack);
            }
            process.exit(1);
        }
    });

// Parse arguments
program.parse();

// Show help if no arguments
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
