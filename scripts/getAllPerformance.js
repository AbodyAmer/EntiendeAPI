const fs = require('fs');
const https = require('https');
require('dotenv').config();

// Configuration
const BASE_URL = 'https://lahajati.ai/api/v1/performance-absolute-control';
const TOTAL_PAGES = 134;
const OUTPUT_FILE = './performance-data.json';
const AUTH_TOKEN = process.env.ARABIC_AUDIO || ''; // Set this in your .env file

// Merged data storage
let allPerformances = [];

// Function to fetch data from a specific page
function fetchPage(page) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${BASE_URL}?page=${page}`);

        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        https.get(options, (res) => {
            let data = '';

            // Accumulate data chunks
            res.on('data', (chunk) => {
                data += chunk;
            });

            // Parse when complete
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.success && parsed.data) {
                        resolve(parsed.data);
                    } else {
                        reject(new Error(`Invalid response format for page ${page}`));
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse JSON for page ${page}: ${error.message}`));
                }
            });
        }).on('error', (error) => {
            reject(new Error(`HTTP request failed for page ${page}: ${error.message}`));
        });
    });
}

// Main function to fetch all pages
async function fetchAllPages() {
    console.log(`Starting to fetch ${TOTAL_PAGES} pages...`);

    for (let page = 1; page <= TOTAL_PAGES; page++) {
        try {
            console.log(`Fetching page ${page}/${TOTAL_PAGES}...`);
            const pageData = await fetchPage(page);

            // Merge data
            allPerformances = allPerformances.concat(pageData);

            console.log(` Page ${page} fetched successfully (${pageData.length} items)`);

            // Add a small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
            console.error(` Error fetching page ${page}:`, error.message);
            // Continue with next page even if one fails
        }
    }

    // Save merged data to file
    try {
        const output = {
            success: true,
            totalItems: allPerformances.length,
            totalPages: TOTAL_PAGES,
            data: allPerformances
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
        console.log(`\n=== Complete ===`);
        console.log(`Total items fetched: ${allPerformances.length}`);
        console.log(`Data saved to: ${OUTPUT_FILE}`);
    } catch (error) {
        console.error('Error saving file:', error.message);
    }
}

// Run the script
fetchAllPages().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
