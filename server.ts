import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { extractBoothItems } from './server/boothExtractor.js';
import { extractHtmlItems } from './server/htmlExtractor.js';
import { extractWithGemini } from './server/geminiExtractor.js';
import { FetchResult } from './src/types.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON & forms
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Image proxy endpoint for bypassing hotlink restrictions (e.g. booth.pm, pixiv)
  app.get('/api/image-proxy', async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl || typeof targetUrl !== 'string') {
        res.status(400).send('Missing url query parameter');
        return;
      }

      const parsed = new URL(targetUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        res.status(400).send('Invalid URL protocol');
        return;
      }

      // Determine appropriate Referer
      let referer = `${parsed.protocol}//${parsed.hostname}/`;
      if (parsed.hostname.includes('booth.pm') || parsed.hostname.includes('pximg')) {
        referer = 'https://booth.pm/';
      }

      const imageResponse = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': referer,
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });

      if (!imageResponse.ok) {
        res.status(imageResponse.status).send('Failed to fetch upstream image');
        return;
      }

      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day cache

      const buffer = await imageResponse.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (err: any) {
      console.error('Image proxy error:', err?.message || err);
      res.status(500).send('Error proxying image');
    }
  });

  // Core Item Extraction API
  app.post('/api/fetch-items', async (req, res) => {
    try {
      const { url, htmlContent, useAi = false } = req.body;

      if (!url && !htmlContent) {
        res.status(400).json({ error: 'Either "url" or "htmlContent" must be provided.' });
        return;
      }

      let rawHtml = htmlContent || '';
      let targetUrl = url;

      if (url && !htmlContent) {
        let validUrl: URL;
        try {
          // Normalize URL
          const urlToTest = url.startsWith('http://') || url.startsWith('https://') 
            ? url 
            : `https://${url}`;
          validUrl = new URL(urlToTest);
          targetUrl = validUrl.href;
        } catch {
          res.status(400).json({ error: 'Please enter a valid URL (e.g., https://booth.pm/en/items/...)' });
          return;
        }

        // Fetch page content
        const fetchHeaders: Record<string, string> = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
        };

        const response = await fetch(targetUrl, {
          headers: fetchHeaders,
          redirect: 'follow',
        });

        if (!response.ok) {
          throw new Error(`Upstream server responded with HTTP ${response.status}: ${response.statusText}`);
        }

        rawHtml = await response.text();
      }

      // Identify domain
      let domain = 'custom-html';
      try {
        if (targetUrl) domain = new URL(targetUrl).hostname;
      } catch {}

      let result: FetchResult;

      // 1. Check if Booth.pm
      if (domain.includes('booth.pm')) {
        result = extractBoothItems(rawHtml, targetUrl || 'https://booth.pm');
        // If booth extractor didn't find items or user requested AI
        if ((result.items.length === 0 || useAi) && process.env.GEMINI_API_KEY) {
          try {
            const aiResult = await extractWithGemini(rawHtml, targetUrl || 'https://booth.pm', result);
            if (aiResult.items.length > 0) {
              result = {
                ...aiResult,
                extractionMethod: result.items.length > 0 ? 'hybrid' : 'gemini_ai',
              };
            }
          } catch (aiErr: any) {
            console.warn('Gemini extraction fallback notice:', aiErr?.message);
          }
        }
      } else {
        // 2. Generic HTML extraction (Schema.org JSON-LD, OpenGraph, Catalog cards)
        result = extractHtmlItems(rawHtml, targetUrl || 'https://example.com');

        // 3. If zero items found or user explicitly toggled AI, use Gemini
        if ((result.items.length === 0 || useAi) && process.env.GEMINI_API_KEY) {
          try {
            const aiResult = await extractWithGemini(rawHtml, targetUrl || 'https://example.com', result);
            if (aiResult.items.length > 0) {
              result = {
                ...aiResult,
                extractionMethod: result.items.length > 0 ? 'hybrid' : 'gemini_ai',
              };
            }
          } catch (aiErr: any) {
            console.warn('Gemini fallback notice:', aiErr?.message);
            if (result.items.length === 0) {
              result.warnings = [`AI extraction attempt: ${aiErr?.message || 'Failed'}`];
            }
          }
        }
      }

      res.json(result);
    } catch (err: any) {
      console.error('Extraction error:', err);
      res.status(500).json({
        error: err?.message || 'Failed to fetch and extract items from the provided URL.',
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Web Item Extractor server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
