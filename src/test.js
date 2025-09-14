import chalk from 'chalk';
import ora from 'ora';
import UniversalScraper from './scraper.js';

// Test sites from the problem statement - Extended list
const TEST_SITES = [
    // Core test sites
    { url: 'interviewing.io', description: 'Technical interview platform' },
    { url: 'quill.co/blog', description: 'Marketing/content platform blog' },
    { url: 'nilmamano.com/blog/category/dsa', description: 'Personal technical blog' },

    // Extended test sites from the problem statement
    { url: 'shreycation.substack.com', description: 'Substack blog' },
    { url: 'lioness.io', description: 'News/media site' },
    { url: 'resilio.com', description: 'Tech company site' },
    { url: 'biconnector.com', description: 'Business intelligence' },
    { url: 'thebluedot.co', description: 'Content site' },
    { url: 'assorthealth.com', description: 'Health platform' },
    { url: 'franchiseki.com', description: 'Business franchise site' },

    // Additional challenging test sites
    { url: 'quill.co', description: 'Quill main site' },
    { url: 'thebluedot.co', description: 'The Blue Dot site' }
];

async function runCoverageTest() {
    console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════════╗
║        Universal Scraper - Coverage Test Suite                ║
╚═══════════════════════════════════════════════════════════════╝
  `));

    console.log(chalk.white('Testing coverage across multiple sites...\n'));

    const scraper = new UniversalScraper();
    const results = [];

    for (const site of TEST_SITES) {
        const spinner = ora({
            text: `Testing ${site.url} - ${site.description}`,
            color: 'cyan'
        }).start();

        const startTime = Date.now();

        try {
            const result = await scraper.scrapeWebsite(site.url);
            const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);

            if (result.error) {
                spinner.fail(chalk.red(`${site.url} - Failed: ${result.error}`));
                results.push({
                    site: site.url,
                    status: 'failed',
                    items: 0,
                    time: elapsedTime,
                    error: result.error
                });
            } else {
                const itemCount = result.items ? result.items.length : 0;

                if (itemCount > 0) {
                    spinner.succeed(chalk.green(`${site.url} - Success: ${itemCount} items (${elapsedTime}s)`));
                    results.push({
                        site: site.url,
                        status: 'success',
                        items: itemCount,
                        time: elapsedTime
                    });
                } else {
                    spinner.warn(chalk.yellow(`${site.url} - No items found (${elapsedTime}s)`));
                    results.push({
                        site: site.url,
                        status: 'no_items',
                        items: 0,
                        time: elapsedTime
                    });
                }
            }
        } catch (error) {
            spinner.fail(chalk.red(`${site.url} - Exception: ${error.message}`));
            results.push({
                site: site.url,
                status: 'exception',
                items: 0,
                time: 0,
                error: error.message
            });
        }
    }

    // Print summary
    console.log(chalk.cyan('\n' + '='.repeat(60)));
    console.log(chalk.cyan('Coverage Summary:'));
    console.log(chalk.cyan('='.repeat(60) + '\n'));

    const successCount = results.filter(r => r.status === 'success').length;
    const totalCount = results.length;
    const coverage = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : 0;

    console.log(chalk.white(`Total sites tested: ${chalk.bold(totalCount)}`));
    console.log(chalk.green(`Successful: ${chalk.bold(successCount)}`));
    console.log(chalk.yellow(`Coverage: ${chalk.bold(coverage + '%')}`));

    const totalItems = results.reduce((sum, r) => sum + r.items, 0);
    console.log(chalk.white(`Total items scraped: ${chalk.bold(totalItems)}`));

    const avgTime = results.reduce((sum, r) => sum + parseFloat(r.time), 0) / totalCount;
    console.log(chalk.white(`Average time per site: ${chalk.bold(avgTime.toFixed(1) + 's')}`));

    // Show failed sites
    const failed = results.filter(r => r.status !== 'success');
    if (failed.length > 0) {
        console.log(chalk.red('\n❌ Failed sites:'));
        for (const result of failed) {
            console.log(chalk.gray(`   - ${result.site}: ${result.error || 'No items found'}`));
        }
    }

    // Show successful sites with most content
    const successful = results
        .filter(r => r.status === 'success')
        .sort((a, b) => b.items - a.items)
        .slice(0, 3);

    if (successful.length > 0) {
        console.log(chalk.green('\n✅ Top performing sites:'));
        for (const result of successful) {
            console.log(chalk.gray(`   - ${result.site}: ${result.items} items`));
        }
    }
}

async function testSingleSite(url) {
    console.log(chalk.cyan(`\nTesting single site: ${url}\n`));

    const spinner = ora({
        text: `Scraping ${url}...`,
        color: 'cyan'
    }).start();

    try {
        const scraper = new UniversalScraper();
        const startTime = Date.now();

        const result = await scraper.scrapeWebsite(url);
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);

        spinner.succeed(chalk.green(`Completed in ${elapsedTime} seconds`));

        if (result.error) {
            console.log(chalk.red(`\nError: ${result.error}`));
        } else {
            console.log(chalk.cyan('\nResults:'));
            console.log(chalk.white(`Site: ${result.site}`));
            console.log(chalk.white(`Items found: ${result.items ? result.items.length : 0}`));

            if (result.items && result.items.length > 0) {
                // Content type breakdown
                const contentTypes = {};
                for (const item of result.items) {
                    const type = item.content_type || 'other';
                    contentTypes[type] = (contentTypes[type] || 0) + 1;
                }

                console.log(chalk.white('\nContent types:'));
                for (const [type, count] of Object.entries(contentTypes)) {
                    console.log(chalk.gray(`  - ${type}: ${count}`));
                }

                // Sample items
                console.log(chalk.cyan('\nSample items:'));
                result.items.slice(0, 5).forEach((item, index) => {
                    console.log(chalk.white(`\n${index + 1}. ${item.title}`));
                    console.log(chalk.gray(`   Type: ${item.content_type}`));
                    console.log(chalk.gray(`   URL: ${item.source_url}`));
                    console.log(chalk.gray(`   Content preview: ${item.content.substring(0, 100)}...`));
                });

                if (result.items.length > 5) {
                    console.log(chalk.gray(`\n...and ${result.items.length - 5} more items`));
                }
            }
        }

    } catch (error) {
        spinner.fail(chalk.red('Test failed'));
        console.error(chalk.red(error.message));
        console.error(error.stack);
    }
}

// Main execution
const args = process.argv.slice(2);

if (args.length > 0 && args[0] !== '--coverage') {
    // Test single site
    testSingleSite(args[0]);
} else {
    // Run coverage test
    runCoverageTest();
}
