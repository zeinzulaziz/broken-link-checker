let currentResults = null;
let currentFilter = 'all';

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

// Event listeners
checkBtn.addEventListener('click', startCheck);
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') startCheck();
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

    let progressInterval = null;

    try {
        const maxPages = document.getElementById('maxPagesToggle').checked 
            ? parseInt(document.getElementById('maxPages').value) 
            : 100;

        // Start fetching
        const response = await fetch('/api/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url, maxPages })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to check links');
        }

        // Show loading stages
        progressFill.style.width = '30%';
        progressText.textContent = 'Crawling and analyzing website...';
        
        // Animate progress bar while waiting
        progressInterval = setInterval(() => {
            const currentWidth = parseInt(progressFill.style.width);
            if (currentWidth < 90) {
                progressFill.style.width = (currentWidth + 5) + '%';
                const pagesText = currentWidth < 50 ? 'Crawling website...' : 'Checking links...';
                progressText.textContent = pagesText;
            }
        }, 300);

        const data = await response.json();
        
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        progressText.textContent = 'Complete!';
        
        await new Promise(resolve => setTimeout(resolve, 500));

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
    
    if (currentFilter === 'internal') {
        filteredLinks = filteredLinks.filter(link => link.isInternal);
    } else if (currentFilter === 'external') {
        filteredLinks = filteredLinks.filter(link => !link.isInternal);
    }

    // Display broken links
    if (filteredLinks.length === 0) {
        brokenLinksList.innerHTML = '<div class="link-item" style="border-left-color: var(--success-color); text-align: center; padding: 40px;"><p style="font-size: 1.2rem; color: var(--text-secondary);">🎉 No broken links found!</p></div>';
        const statusSummary = document.querySelector('.status-summary');
        statusSummary.textContent = `Processed ${data.totalPages} web page${data.totalPages !== 1 ? 's' : ''}, found 0 broken links`;
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
            <tr>
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
            </tr>
        `;
    });
    
    tableHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    brokenLinksList.innerHTML = tableHTML;
    
    // Update status message
    const statusSummary = document.querySelector('.status-summary');
    statusSummary.textContent = `Processed ${data.totalPages} web page${data.totalPages !== 1 ? 's' : ''}, found ${data.brokenLinks} broken link${data.brokenLinks !== 1 ? 's' : ''}`;
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
    
    const headers = ['URL', 'Status', 'Status Text', 'Page', 'Page Title', 'Is Internal', 'Error'];
    const rows = currentResults.brokenLinksDetails.map(link => [
        link.url,
        link.status || '',
        link.statusText || '',
        link.page || '',
        link.pageTitle || '',
        link.isInternal ? 'Yes' : 'No',
        link.error || ''
    ]);

    const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const dataBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `broken-links-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
});

