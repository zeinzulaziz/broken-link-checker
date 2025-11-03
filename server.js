const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const Url = require('url-parse');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Helper function untuk normalisasi URL
function normalizeUrl(url, baseUrl) {
  try {
    // Skip non-HTTP protocols (mailto:, tel:, javascript:, etc.)
    if (url.toLowerCase().startsWith('mailto:') || 
        url.toLowerCase().startsWith('tel:') ||
        url.toLowerCase().startsWith('javascript:') ||
        url.toLowerCase().startsWith('data:')) {
      return null;
    }
    
    const parsed = new Url(url);
    if (parsed.hostname) {
      let href = parsed.href.split('#')[0]; // Remove fragment
      // Force https for all URLs
      if (href.startsWith('http://')) {
        href = 'https://' + href.substring(7);
      }
      return href;
    }
    const base = new Url(baseUrl);
    let normalized = new Url(url, base.href).href.split('#')[0];
    // Force https for relative URLs
    if (normalized.startsWith('http://')) {
      normalized = 'https://' + normalized.substring(7);
    }
    return normalized;
  } catch (e) {
    return null;
  }
}

// Helper function untuk check apakah URL internal
function isInternalUrl(url, baseDomain) {
  try {
    const urlObj = new Url(url);
    return urlObj.hostname === baseDomain || 
           urlObj.hostname === null || 
           urlObj.hostname === '';
  } catch (e) {
    return false;
  }
}

// Crawl website dan ekstrak semua links
async function crawlWebsite(startUrl, maxPages = 500) {
  const visited = new Set();
  const toVisit = [startUrl];
  const links = new Map(); // Map<url, Set<link>>
  const pageData = new Map(); // Map<url, {status, html}>
  const linkMetadata = new Map(); // Map<url, Array<{pageUrl, linkText, pageTitle}>>
  
  const baseUrl = new Url(startUrl);
  const baseDomain = baseUrl.hostname;

  while (toVisit.length > 0 && visited.size < maxPages) {
    const currentUrl = toVisit.shift();
    
    if (visited.has(currentUrl)) continue;
    
    visited.add(currentUrl);
    
    try {
      const response = await axios.get(currentUrl, {
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: (status) => true, // Accept all status codes
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('text/html')) {
        pageData.set(currentUrl, { status: response.status, html: null });
        continue;
      }

      const $ = cheerio.load(response.data);
      const foundLinks = new Set();
      
      // Extract semua links
      $('a[href]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (!href) return;
        
        const normalizedUrl = normalizeUrl(href, currentUrl);
        if (!normalizedUrl) return;
        
        // Get link text
        let linkText = $(elem).text().trim();
        if (!linkText && $(elem).find('img').length > 0) {
          linkText = $(elem).find('img').attr('alt') || 'IMAGE';
        }
        if (!linkText) {
          linkText = href; // fallback
        }
        
        foundLinks.add(normalizedUrl);
        
        // Store metadata
        if (!linkMetadata.has(normalizedUrl)) {
          linkMetadata.set(normalizedUrl, []);
        }
        linkMetadata.get(normalizedUrl).push({
          pageUrl: currentUrl,
          linkText: linkText.substring(0, 100),
          pageTitle: $('title').text() || 'No title'
        });
        
        // Jika internal link dan belum dikunjungi, tambahkan ke queue
        if (isInternalUrl(normalizedUrl, baseDomain) && 
            !visited.has(normalizedUrl) && 
            !toVisit.includes(normalizedUrl)) {
          toVisit.push(normalizedUrl);
        }
      });

      links.set(currentUrl, foundLinks);
      pageData.set(currentUrl, { 
        status: response.status, 
        html: response.data,
        title: $('title').text() || 'No title'
      });

    } catch (error) {
      pageData.set(currentUrl, { 
        status: error.response?.status || 500, 
        html: null,
        error: error.message 
      });
    }
  }

  return { links, pageData, baseDomain, linkMetadata };
}

// Check status sebuah URL
async function checkLinkStatus(url, retries = 2) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
  };
  
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await axios.head(url, {
        timeout: 8000,
        maxRedirects: 5,
        validateStatus: () => true, // Accept all status codes
        headers
      });

      // Jika HEAD tidak didukung atau return 4xx error, coba GET
      if (response.status === 405 || response.status === 501 || 
          (response.status >= 400 && response.status < 500)) {
        const getResponse = await axios.get(url, {
          timeout: 8000,
          maxRedirects: 5,
          validateStatus: () => true,
          headers
        });
        return { status: getResponse.status, error: null };
      }

      return { status: response.status, error: null };
    } catch (error) {
      if (i === retries) {
        return { 
          status: error.response?.status || 0, 
          error: error.message || 'Connection failed' 
        };
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Check multiple links secara parallel
async function checkLinksParallel(urls, concurrency = 10) {
  const results = new Map();
  const queue = [...urls];
  
  const workers = Array(Math.min(concurrency, queue.length)).fill(null).map(async () => {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) break;
      
      const result = await checkLinkStatus(url);
      results.set(url, result);
      
      // Emit progress (dalam real implementation bisa pakai WebSocket)
      if (results.size % 10 === 0 || queue.length === 0) {
        // Progress tracking bisa dikirim via WebSocket di sini
      }
    }
  });
  
  await Promise.all(workers);
  return results;
}

// API: Check broken links
app.post('/api/check', async (req, res) => {
  const { url, maxPages = 500 } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    // Crawl website
    console.log(`Crawling ${normalizedUrl}...`);
    const { links, pageData, baseDomain, linkMetadata } = await crawlWebsite(normalizedUrl, maxPages);

    // Collect semua unique links
    const allLinks = new Set();
    links.forEach((linkSet) => {
      linkSet.forEach(link => allLinks.add(link));
    });

    console.log(`Found ${allLinks.size} unique links, checking status...`);

    // Check semua links secara parallel
    const linkStatuses = await checkLinksParallel([...allLinks], 15);

    // Analyze results
    const brokenLinks = [];
    const workingLinks = [];
    
    // Group by unique link
    allLinks.forEach(link => {
      const status = linkStatuses.get(link);
      if (!status) return;
      
      const isBroken = status.status >= 400 || status.status === 0;
      const isInternal = isInternalUrl(link, baseDomain);
      
      // Get all occurrences of this link
      const occurrences = linkMetadata.get(link) || [];
      
      if (occurrences.length > 0) {
        occurrences.forEach(occurrence => {
          const linkInfo = {
            url: link,
            status: status.status,
            error: status.error,
            page: occurrence.pageUrl,
            pageTitle: occurrence.pageTitle,
            linkText: occurrence.linkText,
            isInternal,
            statusText: status.status === 0 ? 'Failed' : 
                        status.status === 404 ? 'Not Found' :
                        status.status === 403 ? 'Forbidden' :
                        status.status === 500 ? 'Server Error' :
                        status.status >= 400 ? `Error ${status.status}` : 'OK'
          };

          if (isBroken) {
            brokenLinks.push(linkInfo);
          } else {
            workingLinks.push(linkInfo);
          }
        });
      } else {
        // Fallback if no metadata
        const linkInfo = {
          url: link,
          status: status.status,
          error: status.error,
          page: normalizedUrl,
          pageTitle: 'Unknown',
          linkText: link,
          isInternal,
          statusText: status.status === 0 ? 'Failed' : 
                      status.status === 404 ? 'Not Found' :
                      status.status === 403 ? 'Forbidden' :
                      status.status === 500 ? 'Server Error' :
                      status.status >= 400 ? `Error ${status.status}` : 'OK'
        };

        if (isBroken) {
          brokenLinks.push(linkInfo);
        } else {
          workingLinks.push(linkInfo);
        }
      }
    });

    const result = {
      startUrl: normalizedUrl,
      totalPages: pageData.size,
      totalLinks: allLinks.size,
      brokenLinks: brokenLinks.length,
      workingLinks: workingLinks.length,
      brokenLinksDetails: brokenLinks,
      workingLinksDetails: workingLinks,
      summary: {
        internalBroken: brokenLinks.filter(l => l.isInternal).length,
        externalBroken: brokenLinks.filter(l => !l.isInternal).length,
        statusCodes: brokenLinks.reduce((acc, link) => {
          acc[link.status] = (acc[link.status] || 0) + 1;
          return acc;
        }, {})
      },
      timestamp: new Date().toISOString()
    };

    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get link details dengan HTML highlight
app.post('/api/link-details', async (req, res) => {
  const { pageUrl, brokenLinkUrl } = req.body;
  
  if (!pageUrl || !brokenLinkUrl) {
    return res.status(400).json({ error: 'Page URL and broken link URL are required' });
  }

  try {
    const response = await axios.get(pageUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const highlightedHtml = [];
    
    $('a[href]').each((i, elem) => {
      const href = $(elem).attr('href');
      const normalizedHref = normalizeUrl(href, pageUrl);
      
      if (normalizedHref === brokenLinkUrl) {
        // Highlight broken link
        $(elem).addClass('broken-link-highlight');
        highlightedHtml.push({
          tag: $.html(elem),
          line: $(elem).prop('outerHTML'),
          context: $(elem).parent().html()
        });
      }
    });

    res.json({
      pageUrl,
      brokenLinkUrl,
      highlightedElements: highlightedHtml,
      fullHtml: response.data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export untuk Vercel
module.exports = app;

// Untuk local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Broken Link Checker server running on http://localhost:${PORT}`);
  });
}

