const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');
const cliProgress = require('cli-progress');
const colors = require('ansi-colors');
const { URL } = require('url');

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const downloadDir = path.join(process.cwd(), 'downloads');

// Helper to ask question
const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

// Main function
async function main() {
    console.log(colors.cyan('\n🚀 PDF Crawler & Downloader'));
    console.log(colors.gray('================================'));

    try {
        // Ask for URL
        let targetUrl = await askQuestion(colors.yellow('🌐 Enter the website URL to crawl: '));
        
        // Basic URL validation/cleanup
        if (!targetUrl.startsWith('http')) {
            targetUrl = 'https://' + targetUrl;
        }

        const startTime = Date.now();
        console.log(colors.cyan(`\n🔍 Crawling ${targetUrl}...`));

        // Fetch the page
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000,
            validateStatus: status => status < 500 // Accept all status codes < 500 to handle potential redirects or soft errors gracefully
        });

        // Load HTML
        const $ = cheerio.load(response.data);
        const pdfLinks = new Set();

        // Find all PDF links
        $('a').each((i, link) => {
            const href = $(link).attr('href');
            if (href && (href.toLowerCase().endsWith('.pdf') || href.toLowerCase().includes('.pdf?'))) {
                try {
                    // Resolve relative URLs
                    const absoluteUrl = new URL(href, targetUrl).href;
                    pdfLinks.add(absoluteUrl);
                } catch (e) {
                    // Ignore invalid URLs
                }
            }
        });

        const links = Array.from(pdfLinks);

        if (links.length === 0) {
            console.log(colors.red('❌ No PDF files found on this page.'));
            rl.close();
            return;
        }

        console.log(colors.green(`✅ Found ${links.length} PDF files.`));

        // Prepare download directory
        await fs.ensureDir(downloadDir);

        // Progress bar
        const bar = new cliProgress.SingleBar({
            format: colors.cyan('{bar}') + ' | {percentage}% | {value}/{total} Files | {filename}',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true
        });

        bar.start(links.length, 0, { filename: 'Starting...' });

        // Download files in parallel (limit concurrency to 5)
        const concurrencyLimit = 5;
        const results = [];
        
        for (let i = 0; i < links.length; i += concurrencyLimit) {
            const chunk = links.slice(i, i + concurrencyLimit);
            const promises = chunk.map(url => downloadPdf(url, bar));
            results.push(...await Promise.all(promises));
        }

        bar.stop();

        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('\n' + colors.gray('================================'));
        console.log(colors.green(`✅ Completed in ${duration}s`));
        console.log(colors.green(`📂 Downloaded: ${successCount}`));
        if (failCount > 0) console.log(colors.red(`❌ Failed: ${failCount}`));
        console.log(colors.cyan(`📁 Files saved to: ${downloadDir}`));
        console.log(colors.gray('================================'));

    } catch (error) {
        console.error(colors.red(`\n❌ Error: ${error.message}`));
        if (error.response) {
             console.error(colors.red(`Status: ${error.response.status}`));
        }
    } finally {
        rl.close();
        // Keep window open for a moment so user can read output if run from exe
        setTimeout(() => process.exit(0), 5000);
    }
}

async function downloadPdf(url, bar) {
    try {
        // Extract filename from URL
        let filename = path.basename(new URL(url).pathname);
        if (!filename.toLowerCase().endsWith('.pdf')) {
            filename += '.pdf';
        }
        // Decode filename (e.g. %20 -> space)
        filename = decodeURIComponent(filename);
        // Sanitize filename
        filename = filename.replace(/[^a-z0-9\.\-_]/gi, '_');

        const filePath = path.join(downloadDir, filename);

        // Update progress bar
        bar.increment(0, { filename: filename.substring(0, 20) + '...' });

        const writer = fs.createWriteStream(filePath);

        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            timeout: 60000
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                bar.increment();
                resolve({ success: true, url });
            });
            writer.on('error', (err) => {
                resolve({ success: false, url, error: err.message });
            });
        });

    } catch (error) {
        return { success: false, url, error: error.message };
    }
}

main();
