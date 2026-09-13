import * as cheerio from 'cheerio';
import { ExtractedItem, FetchResult } from '../src/types.js';
import { parsePriceString } from './boothExtractor.js';

export function extractHtmlItems(html: string, pageUrl: string): FetchResult {
  const $ = cheerio.load(html);
  const baseUrl = new URL(pageUrl);
  let items: ExtractedItem[] = [];

  const pageTitle = $('title').text().trim() 
    || $('meta[property="og:title"]').attr('content') 
    || $('h1').first().text().trim() 
    || baseUrl.hostname;

  const pageDescription = $('meta[name="description"]').attr('content') 
    || $('meta[property="og:description"]').attr('content') 
    || '';

  const favicon = $('link[rel="icon"]').attr('href') 
    || $('link[rel="shortcut icon"]').attr('href') 
    || $('link[rel="apple-touch-icon"]').attr('href') 
    || '/favicon.ico';

  const siteName = $('meta[property="og:site_name"]').attr('content') || baseUrl.hostname;

  let extractionMethod: FetchResult['extractionMethod'] = 'heuristic_catalog';

  // Strategy 1: JSON-LD Schema.org extraction
  const jsonLdItems: ExtractedItem[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const rawText = $(el).html();
      if (!rawText) return;
      const parsed = JSON.parse(rawText);
      const objects = Array.isArray(parsed) ? parsed : [parsed];

      for (const obj of objects) {
        if (!obj || typeof obj !== 'object') continue;

        // Check if @graph is present
        const candidates = Array.isArray(obj['@graph']) ? obj['@graph'] : [obj];

        for (const item of candidates) {
          const type = item['@type'];
          if (!type) continue;

          // Product schema
          if (type === 'Product' || type === 'IndividualProduct') {
            const offers = item.offers ? (Array.isArray(item.offers) ? item.offers[0] : item.offers) : null;
            const price = offers?.price ? `${offers.priceCurrency || ''} ${offers.price}`.trim() : null;
            const { numPrice, currency, isFree } = price ? parsePriceString(price) : { numPrice: null, currency: null, isFree: false };

            let image = null;
            if (item.image) {
              if (typeof item.image === 'string') image = item.image;
              else if (Array.isArray(item.image)) image = item.image[0];
              else if (item.image.url) image = item.image.url;
            }

            jsonLdItems.push({
              id: item.sku || item['@id'] || `product-${jsonLdItems.length + 1}`,
              title: item.name || pageTitle,
              price: price || (isFree ? 'Free' : null),
              rawPrice: numPrice,
              currency: offers?.priceCurrency || currency,
              isFree,
              imageUrl: image ? resolveUrl(image, pageUrl) : null,
              url: item.url ? resolveUrl(item.url, pageUrl) : pageUrl,
              authorOrShop: item.brand?.name || item.seller?.name || siteName,
              description: item.description ? item.description.slice(0, 500) : null,
              category: item.category || null,
              rating: item.aggregateRating ? {
                score: parseFloat(item.aggregateRating.ratingValue),
                count: parseInt(item.aggregateRating.ratingCount || item.aggregateRating.reviewCount, 10),
              } : undefined,
              availability: offers?.availability || null,
              sku: item.sku || null,
            });
          }

          // ItemList schema (e.g. category or search results)
          if (type === 'ItemList' && Array.isArray(item.itemListElement)) {
            for (const elem of item.itemListElement) {
              const inner = elem.item || elem;
              if (inner && (inner.name || inner.title)) {
                const offers = inner.offers ? (Array.isArray(inner.offers) ? inner.offers[0] : inner.offers) : null;
                const price = offers?.price ? `${offers.priceCurrency || ''} ${offers.price}`.trim() : null;
                const { numPrice, currency, isFree } = price ? parsePriceString(price) : { numPrice: null, currency: null, isFree: false };

                let image = null;
                if (inner.image) {
                  if (typeof inner.image === 'string') image = inner.image;
                  else if (Array.isArray(inner.image)) image = inner.image[0];
                  else if (inner.image.url) image = inner.image.url;
                }

                jsonLdItems.push({
                  id: `list-${elem.position || jsonLdItems.length + 1}`,
                  title: inner.name || inner.title,
                  price: price || (isFree ? 'Free' : null),
                  rawPrice: numPrice,
                  currency: offers?.priceCurrency || currency,
                  isFree,
                  imageUrl: image ? resolveUrl(image, pageUrl) : null,
                  url: inner.url ? resolveUrl(inner.url, pageUrl) : pageUrl,
                  authorOrShop: inner.brand?.name || siteName,
                  description: inner.description ? inner.description.slice(0, 300) : null,
                });
              }
            }
          }
        }
      }
    } catch {
      // Ignore JSON parse errors in invalid scripts
    }
  });

  if (jsonLdItems.length > 0) {
    items = jsonLdItems;
    extractionMethod = 'json_ld';
  }

  // Strategy 2: OpenGraph product if JSON-LD found nothing and page looks like a single item
  if (items.length === 0) {
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogType = $('meta[property="og:type"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content');
    const ogPriceAmount = $('meta[property="og:price:amount"]').attr('content') || $('meta[property="product:price:amount"]').attr('content');
    const ogPriceCurrency = $('meta[property="og:price:currency"]').attr('content') || $('meta[property="product:price:currency"]').attr('content');

    if (ogTitle && (ogType === 'product' || ogPriceAmount || pageUrl.includes('/item') || pageUrl.includes('/product') || pageUrl.includes('/p/'))) {
      const priceText = ogPriceAmount ? `${ogPriceCurrency || '$'} ${ogPriceAmount}` : null;
      const { numPrice, currency, isFree } = priceText ? parsePriceString(priceText) : { numPrice: null, currency: null, isFree: false };

      items.push({
        id: `og-item-1`,
        title: ogTitle,
        price: priceText,
        rawPrice: numPrice,
        currency: ogPriceCurrency || currency,
        isFree,
        imageUrl: ogImage ? resolveUrl(ogImage, pageUrl) : null,
        url: $('meta[property="og:url"]').attr('content') || pageUrl,
        authorOrShop: siteName,
        description: pageDescription,
      });
      extractionMethod = 'opengraph';
    }
  }

  // Strategy 3: Heuristic DOM scanning for product cards / item cards
  if (items.length === 0) {
    const cardSelectors = [
      '.product-card',
      '.product-item',
      '.item-card',
      '.catalog-item',
      '.grid-product',
      '.search-result-item',
      '.store-item',
      '[data-product-id]',
      '[data-item-id]',
      'article.product',
      '.products li',
      '.product',
      '.card--product',
      '.cell.item',
      '.game_cell', // itch.io
      '.asset-card',
    ];

    for (const selector of cardSelectors) {
      const cards = $(selector);
      if (cards.length >= 2) {
        cards.each((idx, el) => {
          if (items.length >= 60) return; // Cap at 60 items
          const $card = $(el);

          const titleEl = $card.find('h2, h3, h4, .title, .product-title, .name, [class*="title"], [class*="name"]').first();
          const title = titleEl.text().trim() || $card.find('a').first().text().trim();
          if (!title || title.length < 2) return;

          const linkEl = $card.find('a[href]').first();
          const href = linkEl.attr('href');
          const itemUrl = href ? resolveUrl(href, pageUrl) : pageUrl;

          const imgEl = $card.find('img').first();
          const img = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || imgEl.attr('srcset')?.split(' ')[0];

          const priceEl = $card.find('.price, [class*="price"], .amount, .money').first();
          const priceText = priceEl.text().trim();
          const { numPrice, currency, isFree } = parsePriceString(priceText);

          const author = $card.find('.author, .seller, .creator, .vendor, [class*="author"]').first().text().trim() || null;

          items.push({
            id: `card-${idx + 1}`,
            title: title.slice(0, 150),
            price: priceText || (isFree ? 'Free' : null),
            rawPrice: numPrice,
            currency,
            isFree,
            imageUrl: img ? resolveUrl(img, pageUrl) : null,
            url: itemUrl,
            authorOrShop: author,
          });
        });

        if (items.length > 0) {
          extractionMethod = 'heuristic_catalog';
          break;
        }
      }
    }
  }

  // Deduplicate items by URL / title
  const seen = new Set<string>();
  items = items.filter(item => {
    const key = (item.url || '') + '::' + item.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    sourceUrl: pageUrl,
    targetDomain: baseUrl.hostname,
    pageTitle,
    pageDescription,
    favicon: resolveUrl(favicon, pageUrl),
    siteName,
    extractedAt: new Date().toISOString(),
    extractionMethod,
    itemCount: items.length,
    items,
  };
}

function resolveUrl(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}
