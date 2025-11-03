let currentResults = null;
let currentFilter = 'all';
let currentStatusFilter = 'all';

// Elements
const urlInput = document.getElementById('urlInput');
const checkBtn = document.getElementById('checkBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const results = document.getElementById('results');
const errorMessage = document.getElementById('errorMessage');
const brokenLinksList = document.getElementById('brokenLinksList');
const statusMessage = document.getElementById('statusMessage');
const statusFilter = document.getElementById('statusFilter');
const urlSuggestions = document.getElementById('urlSuggestions');

// URL History Functions
function getUrlHistory() {
    const history = localStorage.getItem('urlHistory');
    return history ? JSON.parse(history) : [];
}

function saveUrlToHistory(url) {
    let history = getUrlHistory();
    // Remove if already exists
    history = history.filter(u => u !== url);
    // Add to beginning
    history.unshift(url);
    // Keep only last 20 URLs
    history = history.slice(0, 20);
    localStorage.setItem('urlHistory', JSON.stringify(history));
}

function deleteUrlFromHistory(url) {
    let history = getUrlHistory();
    history = history.filter(u => u !== url);
    localStorage.setItem('urlHistory', JSON.stringify(history));
    showSuggestions(urlInput.value);
}

function showSuggestions(query = '') {
    const history = getUrlHistory();
    if (history.length === 0 || query === '') {
        urlSuggestions.classList.remove('show');
        return;
    }

    const filtered = history.filter(url => 
        url.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
        urlSuggestions.classList.remove('show');
        return;
    }

    urlSuggestions.innerHTML = filtered.map(url => `
        <div class="suggestion-item">
            <span class="icon">🔗</span>
            <span class="url">${url}</span>
            <span class="delete-btn" data-url="${url}">🗑️</span>
        </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.suggestion-item').forEach(item => {
        const url = item.querySelector('.url').textContent;
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                deleteUrlFromHistory(url);
                e.stopPropagation();
            } else {
                urlInput.value = url;
                urlSuggestions.classList.remove('show');
                startCheck();
            }
        });
    });

    urlSuggestions.classList.add('show');
}

// Event listeners
checkBtn.addEventListener('click', startCheck);
urlInput.addEventListener('input', (e) => {
    showSuggestions(e.target.value);
});
urlInput.addEventListener('focus', (e) => {
    showSuggestions(e.target.value);
});
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        urlSuggestions.classList.remove('show');
        startCheck();
    }
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!urlInput.contains(e.target) && !urlSuggestions.contains(e.target)) {
        urlSuggestions.classList.remove('show');
    }
});

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        displayResults(currentResults);
    });
});

// Status filter dropdown
statusFilter.addEventListener('change', () => {
    currentStatusFilter = statusFilter.value;
    displayResults(currentResults);
});

// Show all hidden rows button
const showAllBtn = document.getElementById('showAllBtn');
showAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.result-row').forEach(row => {
        row.style.display = '';
    });
});

async function startCheck() {
    const url = urlInput.value.trim();
    if (!url) {
        showError('Please enter a website URL');
        return;
    }

    // Reset UI
    hideError();
    results.style.display = 'none';
    checkBtn.disabled = true;
    btnText.textContent = 'Checking...';
    btnLoader.style.display = 'inline-block';
    progressBar.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Initializing...';
    
    // Reset filters
    currentFilter = 'all';
    currentStatusFilter = 'all';
    statusFilter.value = 'all';
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.filter-btn[data-filter="all"]')?.classList.add('active');

    try {
        const totalMaxPages = document.getElementById('maxPagesToggle').checked 
            ? parseInt(document.getElementById('maxPages').value) 
            : 500;
        
        // Batch processing: split into smaller chunks to avoid timeout
        const BATCH_SIZE = 100; // Pages per batch
        const batches = Math.ceil(totalMaxPages / BATCH_SIZE);
        
        progressText.textContent = `Preparing to scan up to ${totalMaxPages} pages in ${batches} batch(es)...`;

        // Accumulate results
        let allResults = {
            totalPages: 0,
            totalLinks: 0,
            brokenLinks: 0,
            workingLinks: 0,
            brokenLinksDetails: [],
            workingLinksDetails: [],
            baseDomain: '',
            allUniqueLinks: new Set(), // Track all unique link URLs across batches
            allLinkDetails: new Map() // Track link details by url+page key
        };

        // State for batch continuation
        let visitedUrls = [];
        let nextUrlsToVisit = [];
        let hasMoreBatches = true;

        // Process each batch
        for (let batchIndex = 0; batchIndex < batches && hasMoreBatches; batchIndex++) {
            const batchMaxPages = Math.min(BATCH_SIZE, totalMaxPages - (batchIndex * BATCH_SIZE));
            const batchNumber = batchIndex + 1;
            
            const baseProgress = (batchIndex / batches) * 100;
            const batchProgressWidth = 100 / batches;
            
            progressText.textContent = `Batch ${batchNumber}/${batches}: Initializing...`;
            progressFill.style.width = `${baseProgress}%`;

            // Setup animation for current batch
            let batchProgress = 0;
            const batchProgressInterval = setInterval(() => {
                batchProgress += 0.5;
                if (batchProgress < 95) {
                    const currentProgress = baseProgress + (batchProgress * batchProgressWidth / 100);
                    progressFill.style.width = `${currentProgress}%`;
                    
                    if (batchProgress < 30) {
                        progressText.textContent = `Batch ${batchNumber}/${batches}: Crawling website... (${Math.floor(batchProgress * 2)} pages scanned)`;
                    } else if (batchProgress < 70) {
                        progressText.textContent = `Batch ${batchNumber}/${batches}: Checking links... (${Math.floor(batchProgress * 2)} links checked)`;
                    } else {
                        progressText.textContent = `Batch ${batchNumber}/${batches}: Finalizing... (${Math.floor(batchProgress * 2)} links verified)`;
                    }
                }
            }, 200);

            try {
                const response = await fetch('/api/check', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        url, 
                        maxPages: batchMaxPages,
                        visitedUrls: visitedUrls,
                        nextUrlsToVisit: nextUrlsToVisit
                    })
                });
                
                // Clear batch progress animation
                clearInterval(batchProgressInterval);

                if (!response.ok) {
                    let errorMessage = 'Failed to check links';
                    try {
                        const error = await response.json();
                        errorMessage = error.error || error.message || errorMessage;
                    } catch (e) {
                        if (response.status === 504 || response.status === 408) {
                            errorMessage = `Batch ${batchNumber} timed out. Continuing with next batch...`;
                            console.warn(errorMessage);
                            // Clear batch progress animation on timeout
                            clearInterval(batchProgressInterval);
                            // Continue to next batch instead of failing completely
                            continue;
                        } else {
                            errorMessage = `Server error (${response.status}). Please try again.`;
                        }
                    }
                    if (response.status !== 504 && response.status !== 408) {
                        clearInterval(batchProgressInterval);
                        throw new Error(errorMessage);
                    }
                    // For timeout errors, log and continue
                    console.warn(`Batch ${batchNumber} failed: ${errorMessage}`);
                    clearInterval(batchProgressInterval);
                    continue;
                }

                const batchData = await response.json();
                
                // Save state for next batch
                if (batchData.visitedUrls) {
                    visitedUrls = batchData.visitedUrls;
                }
                if (batchData.nextUrlsToVisit) {
                    nextUrlsToVisit = batchData.nextUrlsToVisit;
                }
                hasMoreBatches = batchData.hasMore !== false && nextUrlsToVisit.length > 0;
                
                // Merge batch results
                allResults.totalPages += batchData.totalPages || 0;
                
                // Collect all unique link URLs from this batch
                const batchLinks = new Set();
                
                // Process broken links from this batch
                if (batchData.brokenLinksDetails && Array.isArray(batchData.brokenLinksDetails)) {
                    batchData.brokenLinksDetails.forEach(link => {
                        const linkKey = `${link.url}|${link.page}`;
                        batchLinks.add(link.url);
                        allResults.allUniqueLinks.add(link.url);
                        
                        // Add to broken links details if not duplicate (by url+page)
                        if (!allResults.allLinkDetails.has(linkKey)) {
                            allResults.allLinkDetails.set(linkKey, link);
                            allResults.brokenLinksDetails.push(link);
                        }
                    });
                }
                
                // Process working links from this batch
                if (batchData.workingLinksDetails && Array.isArray(batchData.workingLinksDetails)) {
                    batchData.workingLinksDetails.forEach(link => {
                        const linkKey = `${link.url}|${link.page}`;
                        batchLinks.add(link.url);
                        allResults.allUniqueLinks.add(link.url);
                        
                        // Add to working links details if not duplicate (by url+page)
                        if (!allResults.allLinkDetails.has(linkKey)) {
                            allResults.allLinkDetails.set(linkKey, link);
                            allResults.workingLinksDetails.push(link);
                        }
                    });
                }
                
                // Update counts based on accumulated data
                // totalLinks should be the count of unique link URLs (not occurrences)
                allResults.totalLinks = allResults.allUniqueLinks.size;
                
                // Count unique broken and working links (not occurrences)
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
                
                // Fallback: if workingLinks seems wrong, recalculate from totalLinks
                if (allResults.totalLinks > 0 && allResults.brokenLinks + allResults.workingLinks > allResults.totalLinks) {
                    // Some links might appear in both broken and working (edge case)
                    // Recalculate workingLinks from totalLinks
                    allResults.workingLinks = Math.max(0, allResults.totalLinks - allResults.brokenLinks);
                }
                
                if (!allResults.baseDomain && batchData.baseDomain) {
                    allResults.baseDomain = batchData.baseDomain;
                }

                // Update progress
                progressFill.style.width = `${((batchIndex + 1) / batches) * 95}%`;
                const remainingBatches = hasMoreBatches ? ` (${nextUrlsToVisit.length} pages remaining)` : '';
                progressText.textContent = `Batch ${batchNumber}/${batches} complete. Found ${allResults.brokenLinks} broken links so far${remainingBatches}...`;
                
                // Stop if no more pages to crawl
                if (!hasMoreBatches && batchIndex < batches - 1) {
                    progressText.textContent = `All pages crawled! Found ${allResults.brokenLinks} broken links total.`;
                    break;
                }
                
                // Small delay between batches to avoid overwhelming server
                if (batchIndex < batches - 1 && hasMoreBatches) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
            } catch (error) {
                // Clear batch progress animation on error
                clearInterval(batchProgressInterval);
                
                console.error(`Error in batch ${batchNumber}:`, error);
                // Continue with next batch even if one fails
                if (error.message && !error.message.includes('timeout')) {
                    throw error;
                }
            }
        }
        
        progressFill.style.width = '100%';
        progressText.textContent = `Complete! Scanned ${allResults.totalPages} pages, found ${allResults.brokenLinks} broken links`;
        
        await new Promise(resolve => setTimeout(resolve, 500));

        // Save URL to history
        saveUrlToHistory(url);

        currentResults = allResults;
        displayResults(allResults);
        
        progressBar.style.display = 'none';
        results.style.display = 'block';

    } catch (error) {
        showError(error.message || 'An error occurred while checking links');
        progressBar.style.display = 'none';
    } finally {
        checkBtn.disabled = false;
        btnText.textContent = 'Find Broken Links';
        btnLoader.style.display = 'none';
    }
}

function displayResults(data) {
    // Update summary cards
    document.getElementById('totalPages').textContent = data.totalPages || 0;
    document.getElementById('totalLinks').textContent = data.totalLinks || 0;
    document.getElementById('brokenCount').textContent = data.brokenLinks || 0;
    document.getElementById('workingCount').textContent = data.workingLinks || 0;

    // Filter broken links
    let filteredLinks = data.brokenLinksDetails || [];
    
    // Filter by internal/external
    if (currentFilter === 'internal') {
        filteredLinks = filteredLinks.filter(link => link.isInternal);
    } else if (currentFilter === 'external') {
        filteredLinks = filteredLinks.filter(link => !link.isInternal);
    }
    
    // Filter by status code
    if (currentStatusFilter !== 'all') {
        const statusCode = parseInt(currentStatusFilter);
        filteredLinks = filteredLinks.filter(link => link.status === statusCode);
    }

    // Display broken links
    if (filteredLinks.length === 0) {
        brokenLinksList.innerHTML = '<div class="link-item" style="border-left-color: var(--success-color); text-align: center; padding: 40px;"><p style="font-size: 1.2rem; color: var(--text-secondary);">🎉 No broken links found!</p></div>';
        const statusSummary = document.querySelector('.status-summary');
        statusSummary.textContent = `Processed ${data.totalPages} web-page${data.totalPages !== 1 ? 's' : ''} and ${data.totalLinks} link${data.totalLinks !== 1 ? 's' : ''}`;
        statusMessage.style.display = 'block';
        return;
    }

    let tableHTML = `
        <div class="table-container">
            <table class="results-table">
                <thead>
                    <tr>
                        <th style="width: 50px;">#</th>
                        <th>Broken Link</th>
                        <th>Link Text</th>
                        <th>Page Where Found</th>
                        <th style="width: 150px;">Server Response</th>
                        <th style="width: 80px;">Action</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    filteredLinks.forEach((link, index) => {
        // Use linkText from server, with fallback
        let linkText = link.linkText || '';
        if (!linkText) {
            if (link.url.includes('image') || link.url.includes('img')) {
                linkText = `IMAGE`;
            } else if (link.pageTitle) {
                linkText = link.pageTitle.substring(0, 50);
            } else {
                try {
                    const urlParts = new URL(link.url);
                    linkText = urlParts.hostname.replace('www.', '');
                } catch (e) {
                    linkText = link.url.substring(0, 30);
                }
            }
        }
        
        tableHTML += `
            <tr class="result-row">
                <td>${index + 1}</td>
                <td class="broken-link">
                    <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.url}</a>
                </td>
                <td class="link-text">${linkText}</td>
                <td class="page-found">
                    <a href="${link.page}" target="_blank" rel="noopener noreferrer">view page</a>
                </td>
                <td>
                    <span class="status-badge ${link.status === 404 ? 'status-404' : ''}">
                        ${link.error || link.statusText || link.status || 'N/A'}
                    </span>
                </td>
                <td>
                    <button class="btn-hide" data-url="${link.url}" title="Hide this row">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    brokenLinksList.innerHTML = tableHTML;
    
    // Add click handlers for row selection
    document.querySelectorAll('.result-row').forEach(row => {
        row.addEventListener('click', (e) => {
            // Don't trigger selection if clicking on links or buttons
            if (e.target.tagName === 'A' || e.target.tagName === 'SPAN' || e.target.tagName === 'BUTTON') return;
            
            // Remove selection from other rows
            document.querySelectorAll('.result-row').forEach(r => r.classList.remove('selected'));
            // Add selection to clicked row
            row.classList.add('selected');
        });
    });
    
    // Add click handlers for hide buttons
    document.querySelectorAll('.btn-hide').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent row selection
            const row = btn.closest('tr');
            if (row) {
                row.style.display = 'none';
            }
        });
    });
    
    // Update status message
    const statusSummary = document.querySelector('.status-summary');
    statusSummary.textContent = `Processed ${data.totalPages} web-page${data.totalPages !== 1 ? 's' : ''} and ${data.totalLinks} link${data.totalLinks !== 1 ? 's' : ''}`;
    statusMessage.style.display = 'block';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

// Export functions
document.getElementById('exportBtn').addEventListener('click', () => {
    if (!currentResults) return;
    
    const dataStr = JSON.stringify(currentResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `broken-links-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
});

document.getElementById('exportCSVBtn').addEventListener('click', () => {
    if (!currentResults || !currentResults.brokenLinksDetails) return;
    
    const headers = ['Broken Link', 'Link Text', 'Page Where Found', 'Server Response'];
    const rows = currentResults.brokenLinksDetails.map(link => [
        link.url,
        link.linkText || '',
        link.page || '',
        link.statusText || link.error || link.status || ''
    ]);

    const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Add BOM for Excel compatibility
    const BOM = '\uFEFF';
    const dataBlob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `broken-links-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
});

