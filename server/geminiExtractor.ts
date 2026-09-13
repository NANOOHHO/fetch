import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedItem, FetchResult } from '../src/types.js';
import { parsePriceString } from './boothExtractor.js';

export async function extractWithGemini(
  htmlOrText: string,
  pageUrl: string,
  fallbackResult?: Partial<FetchResult>
): Promise<FetchResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Extract a clean truncated snippet (up to ~35,000 chars) to prevent context bloat
  const sampleContent = htmlOrText.length > 35000 
    ? htmlOrText.slice(0, 35000) 
    : htmlOrText;

  const prompt = `Analyze this webpage content from URL: "${pageUrl}".
Identify all distinct products, store items, digital assets, catalog listings, or downloadable items on the page.
If it is a single item page (like a booth.pm item or store product), extract that single item in full detail (title, price, currency, thumbnail/image URL, author/seller, description, variations, tags).
If it is a catalog, category, search result, or store listing, extract every listed product/item up to 40 items.

Content:
${sampleContent}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction: 'You are an expert e-commerce and web item extractor. You identify items, prices, currencies, image URLs, descriptions, tags, and creators with extreme accuracy.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          pageTitle: { type: Type.STRING },
          pageDescription: { type: Type.STRING },
          siteName: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                price: { type: Type.STRING },
                currency: { type: Type.STRING },
                imageUrl: { type: Type.STRING },
                url: { type: Type.STRING },
                authorOrShop: { type: Type.STRING },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                isFree: { type: Type.BOOLEAN },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['title']
            }
          }
        },
        required: ['items']
      }
    }
  });

  const rawText = response.text;
  if (!rawText) {
    throw new Error("No response returned from Gemini API");
  }

  const parsed = JSON.parse(rawText);
  const baseUrl = new URL(pageUrl);

  const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
  const items: ExtractedItem[] = rawItems.map((item: any, idx: number) => {
    const priceStr = item.price || null;
    const { numPrice, currency: parsedCur, isFree } = priceStr ? parsePriceString(priceStr) : { numPrice: null, currency: null, isFree: !!item.isFree };

    let resolvedImg = item.imageUrl || null;
    if (resolvedImg) {
      try {
        resolvedImg = new URL(resolvedImg, pageUrl).href;
      } catch {
        // keep as is
      }
    }

    let itemUrl = item.url || pageUrl;
    try {
      itemUrl = new URL(itemUrl, pageUrl).href;
    } catch {
      // keep
    }

    return {
      id: `gemini-${idx + 1}-${Date.now()}`,
      title: item.title,
      price: item.price || (isFree ? 'Free' : null),
      rawPrice: numPrice,
      currency: item.currency || parsedCur,
      isFree: isFree || item.isFree,
      imageUrl: resolvedImg,
      url: itemUrl,
      authorOrShop: item.authorOrShop || parsed.siteName || null,
      description: item.description || null,
      category: item.category || null,
      tags: Array.isArray(item.tags) ? item.tags : undefined,
    };
  });

  return {
    sourceUrl: pageUrl,
    targetDomain: baseUrl.hostname,
    pageTitle: parsed.pageTitle || fallbackResult?.pageTitle || baseUrl.hostname,
    pageDescription: parsed.pageDescription || fallbackResult?.pageDescription || '',
    favicon: fallbackResult?.favicon || `https://www.google.com/s2/favicons?domain=${baseUrl.hostname}&sz=128`,
    siteName: parsed.siteName || fallbackResult?.siteName || baseUrl.hostname,
    extractedAt: new Date().toISOString(),
    extractionMethod: 'gemini_ai',
    itemCount: items.length,
    items,
  };
}
