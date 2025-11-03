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

    let progressInterval = null;

    try {
        const maxPages = document.getElementById('maxPagesToggle').checked 
            ? parseInt(document.getElementById('maxPages').value) 
            : 200;

        // Show loading stages with animated progress
        let progressPercent = 0;
        let pagesScanned = 0;
        let linksScanned = 0;
        let linksRemaining = 0;
        
        // Animate progress bar while waiting
        progressInterval = setInterval(() => {
            progressPercent += 1.5; // Increment slower for better UX
            if (progressPercent < 95) {
                progressFill.style.width = progressPercent + '%';
                
                // Simulate scanning progress with more realistic numbers
                if (progressPercent < 25) {
                    pagesScanned = Math.floor(progressPercent * 2);
                    linksScanned = Math.floor(progressPercent * 4);
                    linksRemaining = 250 + Math.floor(progressPercent * 10);
                    progressText.textContent = `Crawling website... ${pagesScanned} pages scanned, ${linksScanned} links found`;
                } else if (progressPercent < 65) {
                    pagesScanned = 50 + Math.floor((progressPercent - 25) * 3);
                    linksScanned = 100 + Math.floor((progressPercent - 25) * 8);
                    linksRemaining = Math.max(0, 350 - Math.floor((progressPercent - 25) * 5));
                    progressText.textContent = `Checking ${linksScanned} links... ${linksRemaining} remaining`;
                } else {
                    linksScanned = 420 + Math.floor((progressPercent - 65) * 5);
                    linksRemaining = Math.max(0, 80 - Math.floor((progressPercent - 65) * 2));
                    progressText.textContent = `Finalizing... ${linksScanned} links checked, ${linksRemaining} remaining`;
                }
            }
        }, 300);

        // Start fetching
        const response = await fetch('/api/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url, maxPages })
        });

        if (!response.ok) {
            let errorMessage = 'Failed to check links';
            try {
                const error = await response.json();
                errorMessage = error.error || error.message || errorMessage;
            } catch (e) {
                // If response is not JSON, use status text
                if (response.status === 504) {
                    errorMessage = 'Request timeout. The crawling process took too long. Try reducing the number of pages to scan or check a smaller website.';
                } else if (response.status === 408) {
                    errorMessage = 'Request timeout. Please try again with fewer pages.';
                } else {
                    errorMessage = `Server error (${response.status}). Please try again.`;
                }
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        progressText.textContent = 'Complete!';
        
        await new Promise(resolve => setTimeout(resolve, 500));

        // Save URL to history
        saveUrlToHistory(url);

        currentResults = data;
        displayResults(data);
        
        progressBar.style.display = 'none';
        results.style.display = 'block';

    } catch (error) {
        showError(error.message || 'An error occurred while checking links');
        progressBar.style.display = 'none';
    } finally {
        if (progressInterval) clearInterval(progressInterval);
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

