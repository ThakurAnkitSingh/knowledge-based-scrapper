#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import chalk from 'chalk';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function quickstart() {
    console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════════╗
║          Knowledge Base Scraper - Quick Start                 ║
║                                                               ║
║  Built for technical thought leaders to import their          ║
║  knowledge into AI-powered tools                              ║
╚═══════════════════════════════════════════════════════════════╝
  `));

    // Check if dependencies are installed
    const nodeModulesExists = existsSync('./node_modules');
    const clientNodeModulesExists = existsSync('./client/node_modules');

    if (!nodeModulesExists || !clientNodeModulesExists) {
        console.log(chalk.yellow('\n⚠️  Dependencies not installed.'));
        const install = await question('\nWould you like to install them now? (y/n): ');

        if (install.toLowerCase() === 'y') {
            console.log(chalk.cyan('\nInstalling dependencies...'));
            try {
                execSync('npm run setup', { stdio: 'inherit' });
                console.log(chalk.green('\n✅ Dependencies installed successfully!'));
            } catch (error) {
                console.log(chalk.red('\n❌ Failed to install dependencies.'));
                console.log(chalk.white('Please run: npm run setup'));
                process.exit(1);
            }
        } else {
            console.log(chalk.white('\nPlease install dependencies manually:'));
            console.log(chalk.gray('  npm run setup'));
            process.exit(0);
        }
    }

    console.log(chalk.cyan('\n' + '='.repeat(60)));
    console.log(chalk.cyan('Choose how to run the scraper:'));
    console.log(chalk.cyan('='.repeat(60)));
    console.log(chalk.white('\n1. Web Interface (Recommended) - Beautiful UI'));
    console.log(chalk.white('2. Command Line Interface - For automation'));
    console.log(chalk.white('3. Run Example Showcase - See it in action'));
    console.log(chalk.white('4. Run Tests - Test coverage on multiple sites'));
    console.log(chalk.white('5. API Server Only - For integration'));
    console.log(chalk.white('6. Exit'));

    const choice = await question('\nEnter your choice (1-6): ');

    switch (choice) {
        case '1':
            console.log(chalk.green('\n🚀 Starting web interface...'));
            console.log(chalk.white('   Opening http://localhost:3001 in your browser'));
            console.log(chalk.gray('   Press Ctrl+C to stop the server\n'));
            execSync('npm start', { stdio: 'inherit' });
            break;

        case '2':
            console.log(chalk.cyan('\n📝 Command Line Usage:'));
            console.log(chalk.white('   npm run scrape <URL>'));
            console.log(chalk.gray('\nExamples:'));
            console.log(chalk.gray('   npm run scrape interviewing.io'));
            console.log(chalk.gray('   npm run scrape https://quill.co/blog -- --output data.json'));
            console.log(chalk.gray('   npm run scrape example.com -- --pretty --verbose'));

            const url = await question('\nEnter a URL to scrape (or press Enter to skip): ');
            if (url.trim()) {
                execSync(`npm run scrape ${url}`, { stdio: 'inherit' });
            }
            break;

        case '3':
            console.log(chalk.green('\n🎯 Running showcase...'));
            execSync('node src/showcase.js', { stdio: 'inherit' });
            break;

        case '4':
            console.log(chalk.green('\n🧪 Running test suite...'));
            execSync('npm test', { stdio: 'inherit' });
            break;

        case '5':
            console.log(chalk.green('\n🚀 Starting API server...'));
            console.log(chalk.white('   Server running at http://localhost:3001'));
            console.log(chalk.white('   API endpoint: POST http://localhost:3001/api/scrape'));
            console.log(chalk.gray('\nExample curl command:'));
            console.log(chalk.gray('   curl -X POST http://localhost:3001/api/scrape \\'));
            console.log(chalk.gray('     -H "Content-Type: application/json" \\'));
            console.log(chalk.gray('     -d \'{"url": "interviewing.io"}\''));
            console.log(chalk.gray('\nPress Ctrl+C to stop the server\n'));
            execSync('npm start', { stdio: 'inherit' });
            break;

        case '6':
            console.log(chalk.yellow('\n👋 Goodbye!'));
            break;

        default:
            console.log(chalk.red('\n❌ Invalid choice. Please run the script again.'));
    }

    rl.close();
}

// Handle errors
process.on('unhandledRejection', (error) => {
    console.error(chalk.red('\n❌ An error occurred:'), error.message);
    process.exit(1);
});

// Run quickstart
quickstart().catch(console.error);
