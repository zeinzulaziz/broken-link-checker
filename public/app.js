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
    try {
        const history = JSON.parse(localStorage.getItem('urlHistory') || '[]');
        return Array.isArray(history) ? history : [];
    } catch (err) {
        console.warn('URL history unreadable, starting fresh.', err);
        return [];
    }
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
        <div class="suggestion-item" role="option">
            <span class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></span>
            <span class="url">${escapeHtml(url)}</span>
            <button class="delete-btn" data-url="${escapeHtml(url)}" type="button" aria-label="Remove from history"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.suggestion-item').forEach(item => {
        const url = item.querySelector('.url').textContent;
        item.addEventListener('click', (e) => {
            if (e.target.closest('.delete-btn')) {
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
const checkForm = document.getElementById('checkForm');
checkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    urlSuggestions.classList.remove('show');
    startCheck();
});

// Limit-pages toggle enables/disables the page cap input
const maxPagesToggle = document.getElementById('maxPagesToggle');
const maxPagesInput = document.getElementById('maxPages');
maxPagesToggle.addEventListener('change', () => {
    maxPagesInput.disabled = !maxPagesToggle.checked;
    if (maxPagesToggle.checked) maxPagesInput.focus();
});

urlInput.addEventListener('input', (e) => {
    showSuggestions(e.target.value);
});
urlInput.addEventListener('focus', (e) => {
    showSuggestions(e.target.value);
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!urlInput.contains(e.target) && !urlSuggestions.contains(e.target)) {
        urlSuggestions.classList.remove('show');
    }
});

function setProgress(pct) {
    progressFill.style.width = `${pct}%`;
    progressBar.setAttribute('aria-valuenow', String(Math.round(pct)));
}

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

function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function copyToClipboard(text) {
    if (navigator?.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.warn('Clipboard API failed, falling back to execCommand.', err);
        }
    }

    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    let success = false;
    try {
        success = document.execCommand('copy');
    } catch (err) {
        console.error('Fallback copy failed:', err);
    }

    document.body.removeChild(textarea);
    return success;
}

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
    setProgress(0);
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
            : 2000; // Default increased to handle large websites
        
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
        let totalPagesScanned = 0; // Track total pages scanned across all batches

        // Process each batch
        for (let batchIndex = 0; batchIndex < batches && hasMoreBatches; batchIndex++) {
            // Calculate remaining pages to scan
            const remainingPages = totalMaxPages - totalPagesScanned;
            const batchMaxPages = Math.min(BATCH_SIZE, remainingPages);
            
            // Stop if no more pages to scan
            if (batchMaxPages <= 0) {
                break;
            }
            
            const batchNumber = batchIndex + 1;
            
            const baseProgress = (batchIndex / batches) * 100;
            const batchProgressWidth = 100 / batches;
            
            progressText.textContent = `Batch ${batchNumber}/${batches}: Initializing...`;
            setProgress(baseProgress);

            // Setup animation for current batch
            let batchProgress = 0;
            const batchProgressInterval = setInterval(() => {
                batchProgress += 0.5;
                if (batchProgress < 95) {
                    const currentProgress = baseProgress + (batchProgress * batchProgressWidth / 100);
                    setProgress(currentProgress);
                    
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
                const batchPages = batchData.totalPages || 0;
                allResults.totalPages += batchPages;
                totalPagesScanned += batchPages; // Track total pages scanned
                
                // Stop if we've reached the limit
                if (totalPagesScanned >= totalMaxPages) {
                    hasMoreBatches = false;
                    break;
                }
                
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
                setProgress(((batchIndex + 1) / batches) * 95);
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
        
        setProgress(100);
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
        btnText.textContent = 'Check links';
        btnLoader.style.display = 'none';
    }
}

function displayResults(data) {
    // Update summary cards
    document.getElementById('totalPages').textContent = data.totalPages || 0;
    document.getElementById('totalLinks').textContent = data.totalLinks || 0;
    document.getElementById('brokenCount').textContent = data.brokenLinks || 0;
    document.getElementById('workingCount').textContent = data.workingLinks || 0;

    // Link-health strip: share of checked links that are working vs broken
    const totalForStrip = (data.brokenLinks || 0) + (data.workingLinks || 0);
    const brokenPct = totalForStrip > 0 ? Math.min(100, (data.brokenLinks / totalForStrip) * 100) : 0;
    const healthBroken = document.getElementById('healthBroken');
    const healthWorking = document.getElementById('healthWorking');
    const healthCaption = document.getElementById('healthCaption');
    if (healthBroken && healthWorking && healthCaption) {
        healthBroken.style.width = `${brokenPct}%`;
        healthWorking.style.width = `${100 - brokenPct}%`;
        healthCaption.textContent = totalForStrip > 0
            ? `${Math.round(100 - brokenPct)}% of ${totalForStrip} link${totalForStrip !== 1 ? 's' : ''} healthy`
            : 'No links checked';
    }

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
        brokenLinksList.innerHTML = '<div class="link-item empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><p>No broken links found on this site.</p></div>';
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
        
        const shortStatus = link.status > 0
            ? `${link.status} ${link.statusText || ''}`.trim()
            : (link.statusText || 'Connection failed');
        const fullStatus = link.error ? String(link.error) : shortStatus;

        const escapedLinkText = escapeHtml(linkText);
        const encodedLinkText = encodeURIComponent(linkText);
        const escapedUrl = escapeHtml(link.url);
        const escapedPage = escapeHtml(link.page || '');
        const escapedUrlAttr = escapedUrl.replace(/"/g, '&quot;');
        const escapedPageAttr = escapedPage.replace(/"/g, '&quot;');

        tableHTML += `
            <tr class="result-row">
                <td>${index + 1}</td>
                <td class="broken-link">
                    <a href="${escapedUrlAttr}" target="_blank" rel="noopener noreferrer">${escapedUrl}</a>
                </td>
                <td class="link-text">
                    <span class="text-value">${escapedLinkText}</span>
                    <button
                        class="btn-copy-text btn-icon"
                        data-clipboard="${encodedLinkText}"
                        type="button"
                        title="Copy link text"
                        aria-label="Copy link text"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                </td>
                <td class="page-found">
                    <a href="${escapedPageAttr}" target="_blank" rel="noopener noreferrer">view page</a>
                </td>
                <td>
                    <span class="status-badge ${link.status === 404 ? 'status-404' : ''}" title="${escapeHtml(fullStatus)}">
                        ${escapeHtml(shortStatus)}
                    </span>
                </td>
                <td>
                    <button class="btn-hide" data-url="${escapedUrlAttr}" type="button" title="Hide this row" aria-label="Hide this row">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
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
            // Don't trigger selection when clicking anything interactive
            if (e.target.closest('a, button, select, input')) return;
            
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

    // Add click handlers for copy buttons
    document.querySelectorAll('.btn-copy-text').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const text = decodeURIComponent(btn.dataset.clipboard || '');
            if (!text) return;

            const originalContent = btn.innerHTML;
            const success = await copyToClipboard(text);

            btn.innerHTML = success
                ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 10"/></svg>'
                : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
            btn.style.color = success ? 'var(--ok)' : 'var(--bad)';
            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.style.color = '';
            }, 1500);
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

