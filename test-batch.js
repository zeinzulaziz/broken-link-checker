const axios = require('axios');

async function testBatch() {
    console.log('Testing batch processing with thefreedomstory.org...\n');
    
    const url = 'https://thefreedomstory.org';
    const maxPages = 50;
    
    try {
        console.log(`Testing single batch (maxPages: ${maxPages})...`);
        const response = await axios.post('http://localhost:3000/api/check', {
            url,
            maxPages
        });
        
        const data = response.data;
        console.log('\n=== SINGLE BATCH RESULTS ===');
        console.log(`Total Pages: ${data.totalPages}`);
        console.log(`Total Links (unique): ${data.totalLinks}`);
        console.log(`Broken Links (unique): ${data.brokenLinks}`);
        console.log(`Working Links (unique): ${data.workingLinks}`);
        console.log(`Broken Links Details (occurrences): ${data.brokenLinksDetails.length}`);
        console.log(`Working Links Details (occurrences): ${data.workingLinksDetails.length}`);
        
        // Now test with batch processing simulation (2 batches of 25)
        console.log('\n\n=== TESTING BATCH PROCESSING (2 batches of 25) ===');
        
        let allResults = {
            totalPages: 0,
            totalLinks: 0,
            brokenLinks: 0,
            workingLinks: 0,
            brokenLinksDetails: [],
            workingLinksDetails: [],
            allUniqueLinks: new Set(),
            allLinkDetails: new Map()
        };
        
        let visitedUrls = [];
        let nextUrlsToVisit = [];
        
        // Batch 1
        console.log('\nProcessing Batch 1 (25 pages)...');
        const batch1 = await axios.post('http://localhost:3000/api/check', {
            url,
            maxPages: 25,
            visitedUrls,
            nextUrlsToVisit
        });
        
        const batch1Data = batch1.data;
        if (batch1Data.visitedUrls) visitedUrls = batch1Data.visitedUrls;
        if (batch1Data.nextUrlsToVisit) nextUrlsToVisit = batch1Data.nextUrlsToVisit;
        
        // Merge batch 1
        allResults.totalPages += batch1Data.totalPages || 0;
        
        if (batch1Data.brokenLinksDetails && Array.isArray(batch1Data.brokenLinksDetails)) {
            batch1Data.brokenLinksDetails.forEach(link => {
                const linkKey = `${link.url}|${link.page}`;
                allResults.allUniqueLinks.add(link.url);
                if (!allResults.allLinkDetails.has(linkKey)) {
                    allResults.allLinkDetails.set(linkKey, link);
                    allResults.brokenLinksDetails.push(link);
                }
            });
        }
        
        if (batch1Data.workingLinksDetails && Array.isArray(batch1Data.workingLinksDetails)) {
            batch1Data.workingLinksDetails.forEach(link => {
                const linkKey = `${link.url}|${link.page}`;
                allResults.allUniqueLinks.add(link.url);
                if (!allResults.allLinkDetails.has(linkKey)) {
                    allResults.allLinkDetails.set(linkKey, link);
                    allResults.workingLinksDetails.push(link);
                }
            });
        }
        
        // Batch 2
        console.log('Processing Batch 2 (25 pages, continuing from batch 1)...');
        const batch2 = await axios.post('http://localhost:3000/api/check', {
            url,
            maxPages: 25,
            visitedUrls,
            nextUrlsToVisit
        });
        
        const batch2Data = batch2.data;
        
        // Merge batch 2
        allResults.totalPages += batch2Data.totalPages || 0;
        
        if (batch2Data.brokenLinksDetails && Array.isArray(batch2Data.brokenLinksDetails)) {
            batch2Data.brokenLinksDetails.forEach(link => {
                const linkKey = `${link.url}|${link.page}`;
                allResults.allUniqueLinks.add(link.url);
                if (!allResults.allLinkDetails.has(linkKey)) {
                    allResults.allLinkDetails.set(linkKey, link);
                    allResults.brokenLinksDetails.push(link);
                }
            });
        }
        
        if (batch2Data.workingLinksDetails && Array.isArray(batch2Data.workingLinksDetails)) {
            batch2Data.workingLinksDetails.forEach(link => {
                const linkKey = `${link.url}|${link.page}`;
                allResults.allUniqueLinks.add(link.url);
                if (!allResults.allLinkDetails.has(linkKey)) {
                    allResults.allLinkDetails.set(linkKey, link);
                    allResults.workingLinksDetails.push(link);
                }
            });
        }
        
        // Calculate final counts
        allResults.totalLinks = allResults.allUniqueLinks.size;
        
        const uniqueBrokenLinks = new Set();
        const uniqueWorkingLinks = new Set();
        
        allResults.brokenLinksDetails.forEach(link => {
            uniqueBrokenLinks.add(link.url);
        });
        
        allResults.workingLinksDetails.forEach(link => {
            uniqueWorkingLinks.add(link.url);
        });
        
        allResults.brokenLinks = uniqueBrokenLinks.size;
        allResults.workingLinks = uniqueWorkingLinks.size;
        
        if (allResults.totalLinks > 0 && allResults.brokenLinks + allResults.workingLinks > allResults.totalLinks) {
            allResults.workingLinks = Math.max(0, allResults.totalLinks - allResults.brokenLinks);
        }
        
        console.log('\n=== BATCH PROCESSING RESULTS (2 batches) ===');
        console.log(`Total Pages: ${allResults.totalPages}`);
        console.log(`Total Links (unique): ${allResults.totalLinks}`);
        console.log(`Broken Links (unique): ${allResults.brokenLinks}`);
        console.log(`Working Links (unique): ${allResults.workingLinks}`);
        console.log(`Broken Links Details (occurrences): ${allResults.brokenLinksDetails.length}`);
        console.log(`Working Links Details (occurrences): ${allResults.workingLinksDetails.length}`);
        
        console.log('\n=== COMPARISON ===');
        console.log(`Pages match: ${data.totalPages === allResults.totalPages ? '✅' : '❌'} (Single: ${data.totalPages}, Batch: ${allResults.totalPages})`);
        console.log(`Total Links match: ${data.totalLinks === allResults.totalLinks ? '✅' : '❌'} (Single: ${data.totalLinks}, Batch: ${allResults.totalLinks})`);
        console.log(`Broken Links match: ${Math.abs(data.brokenLinks - allResults.brokenLinks) <= 1 ? '✅' : '❌'} (Single: ${data.brokenLinks}, Batch: ${allResults.brokenLinks})`);
        console.log(`Working Links match: ${Math.abs(data.workingLinks - allResults.workingLinks) <= 1 ? '✅' : '❌'} (Single: ${data.workingLinks}, Batch: ${allResults.workingLinks})`);
        
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testBatch();




