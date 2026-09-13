import * as cheerio from 'cheerio';
import { ExtractedItem, FetchResult } from '../src/types.js';

export function extractBoothItems(html: string, pageUrl: string): FetchResult {
  const $ = cheerio.load(html);
  const baseUrl = new URL(pageUrl);
  const items: ExtractedItem[] = [];

  const pageTitle = $('title').text().trim() || $('meta[property="og:title"]').attr('content') || 'Booth.pm';
  const pageDescription = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
  const favicon = $('link[rel="shortcut icon"]').attr('href') || $('link[rel="icon"]').attr('href') || 'https://booth.pm/favicon.ico';

  const isSingleItemPage = pageUrl.includes('/items/') || $('.item-detail').length > 0 || $('.market-item-detail').length > 0;

  if (isSingleItemPage) {
    // Single product item page on booth.pm
    const title = $('.item-name, h1.font-bold, .item-summary__title, [itemprop="name"]').first().text().trim() 
      || $('meta[property="og:title"]').attr('content') 
      || 'Booth Item';

    // Price
    let priceText = $('.item-detail__price, .price, .u-text-price, [itemprop="price"]').first().text().trim();
    if (!priceText) {
      priceText = $('meta[property="product:price:amount"]').attr('content') || '';
      const cur = $('meta[property="product:price:currency"]').attr('content');
      if (priceText && cur) priceText = `${cur} ${priceText}`;
    }

    // Images
    const mainImage = $('meta[property="og:image"]').attr('content') 
      || $('.item-detail__image img, .market-item-detail__image img, .item-summary__image img').first().attr('src')
      || $('[data-origin-image]').first().attr('data-origin-image');

    const additionalImages: string[] = [];
    $('[data-origin-image], .item-detail__thumbnail img, .thumbnail-image, .market-item-detail__thumbnails img').each((_, el) => {
      const src = $(el).attr('data-origin-image') || $(el).attr('src') || $(el).attr('data-src');
      if (src && src !== mainImage && !additionalImages.includes(src)) {
        additionalImages.push(resolveUrl(src, pageUrl));
      }
    });

    // Author / Shop
    const authorOrShop = $('.shop-name, .shop-info__name, .u-text-ellipsis, a[href*="booth.pm"]').first().text().trim()
      || $('.market-item-detail__shop-name').text().trim()
      || $('meta[property="og:site_name"]').attr('content')
      || null;

    const authorUrlRaw = $('.shop-name a, .shop-info a, a.shop-name').first().attr('href') || null;
    const authorUrl = authorUrlRaw ? resolveUrl(authorUrlRaw, pageUrl) : null;

    // Description
    const description = $('.item-description, .market-item-detail__description, [itemprop="description"]').text().trim()
      || pageDescription;

    // Tags
    const tags: string[] = [];
    $('.tag-list .tag-item, .item-tags a, a[href*="/tags/"], .u-tag').each((_, el) => {
      const tag = $(el).text().trim().replace(/^#/, '');
      if (tag && !tags.includes(tag)) {
        tags.push(tag);
      }
    });

    // Variations / Download options
    const variations: { name: string; price?: string | null; inStock?: boolean; type?: string | null }[] = [];
    $('.variation-item, .item-variation, .market-item-detail__variation, .u-variation-item').each((_, el) => {
      const vName = $(el).find('.variation-name, .variation-title, .name').text().trim() || $(el).text().trim().split('\n')[0];
      const vPrice = $(el).find('.variation-price, .price').text().trim();
      const isOutOfStock = $(el).hasClass('out-of-stock') || $(el).text().includes('Sold out') || $(el).text().includes('完売');
      if (vName) {
        variations.push({
          name: vName.slice(0, 100),
          price: vPrice || null,
          inStock: !isOutOfStock,
        });
      }
    });

    // Parse numerical price
    const { numPrice, currency, isFree } = parsePriceString(priceText);

    items.push({
      id: pageUrl.match(/items\/(\d+)/)?.[1] || `item-${Date.now()}`,
      title,
      price: priceText || (isFree ? 'Free' : null),
      rawPrice: numPrice,
      currency: currency || 'JPY',
      isFree,
      imageUrl: mainImage ? resolveUrl(mainImage, pageUrl) : null,
      additionalImages,
      url: pageUrl,
      authorOrShop,
      authorUrl,
      description: description ? description.slice(0, 800) : null,
      tags: tags.slice(0, 15),
      category: 'Digital Item',
      variations: variations.length > 0 ? variations : undefined,
    });
  } else {
    // Catalog / Search / Browse / Shop list page on booth.pm
    $('.item-card, .market-item-card, li[data-product-id], .u-card, .item-grid__item, [data-item-id]').each((idx, el) => {
      const $card = $(el);
      
      const titleEl = $card.find('.item-card__title, .title, .item-name, h2, h3, a.font-bold').first();
      const title = titleEl.text().trim();
      if (!title) return;

      const linkEl = $card.find('a[href*="/items/"]').first().length ? $card.find('a[href*="/items/"]').first() : $card.find('a').first();
      const href = linkEl.attr('href');
      const itemUrl = href ? resolveUrl(href, pageUrl) : pageUrl;

      // Image
      let img: string | undefined = undefined;
      const thumbImg = $card.find('.item-card__thumbnail-image, .item-card__thumbnail img, [data-original]').first();
      if (thumbImg.length) {
        img = thumbImg.attr('data-original') || thumbImg.attr('data-src') || thumbImg.attr('src');
      }
      if (!img) {
        $card.find('img').each((_, el) => {
          const src = $(el).attr('data-original') || $(el).attr('data-src') || $(el).attr('src');
          if (src && !src.includes('badge') && !src.includes('icon') && !img) {
            img = src;
          }
        });
      }
      if (!img) {
        const fallbackEl = $card.find('img').first();
        img = fallbackEl.attr('data-original') || fallbackEl.attr('data-src') || fallbackEl.attr('src');
      }

      // Price
      const priceText = $card.find('.price, .item-card__price, .u-text-price, [class*="price"]').first().text().trim();
      const { numPrice, currency, isFree } = parsePriceString(priceText);

      // Shop
      const shop = $card.find('.item-card__shop-name, .shop-name, .shop-info__name').first().text().trim() || null;
      const shopUrlRaw = $card.find('.item-card__shop-name a, .shop-name a').first().attr('href');
      const authorUrl = shopUrlRaw ? resolveUrl(shopUrlRaw, pageUrl) : null;

      // Category / Tag
      const category = $card.find('.item-card__category, .category').first().text().trim() || null;

      const id = itemUrl.match(/items\/(\d+)/)?.[1] || `booth-${idx}-${Date.now()}`;

      items.push({
        id,
        title,
        price: priceText || (isFree ? 'Free' : null),
        rawPrice: numPrice,
        currency: currency || 'JPY',
        isFree,
        imageUrl: img ? resolveUrl(img, pageUrl) : null,
        url: itemUrl,
        authorOrShop: shop,
        authorUrl,
        category,
      });
    });
  }

  return {
    sourceUrl: pageUrl,
    targetDomain: baseUrl.hostname,
    pageTitle,
    pageDescription,
    favicon: resolveUrl(favicon, pageUrl),
    siteName: 'Booth.pm',
    extractedAt: new Date().toISOString(),
    extractionMethod: 'specialized_booth',
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

export function parsePriceString(str: string): { numPrice: number | null; currency: string | null; isFree: boolean } {
  if (!str) return { numPrice: null, currency: null, isFree: false };
  const lower = str.toLowerCase().trim();

  if (lower.includes('free') || lower.includes('無料') || lower === '0' || lower === '¥0' || lower === '$0') {
    return { numPrice: 0, currency: null, isFree: true };
  }

  let currency = null;
  if (str.includes('¥') || lower.includes('jpy') || str.includes('円')) currency = 'JPY';
  else if (str.includes('$') || lower.includes('usd')) currency = 'USD';
  else if (str.includes('€') || lower.includes('eur')) currency = 'EUR';
  else if (str.includes('£') || lower.includes('gbp')) currency = 'GBP';

  // Extract digits
  const cleaned = str.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);

  return {
    numPrice: isNaN(num) ? null : num,
    currency,
    isFree: num === 0,
  };
}
