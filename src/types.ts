export interface ExtractedItem {
  id: string;
  title: string;
  price?: string | null;
  originalPrice?: string | null;
  rawPrice?: number | null;
  currency?: string | null;
  isFree?: boolean;
  isSale?: boolean;
  imageUrl?: string | null;
  additionalImages?: string[];
  url: string;
  authorOrShop?: string | null;
  authorUrl?: string | null;
  description?: string | null;
  tags?: string[];
  category?: string | null;
  variations?: {
    name: string;
    price?: string | null;
    inStock?: boolean;
    type?: string | null;
  }[];
  rating?: {
    score?: number;
    count?: number;
  };
  availability?: string | null;
  sku?: string | null;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface FetchResult {
  sourceUrl: string;
  targetDomain: string;
  pageTitle: string;
  pageDescription?: string;
  favicon?: string;
  siteName?: string;
  extractedAt: string;
  extractionMethod: 'specialized_booth' | 'json_ld' | 'opengraph' | 'heuristic_catalog' | 'gemini_ai' | 'hybrid';
  itemCount: number;
  items: ExtractedItem[];
  warnings?: string[];
}

export interface FetchRequestOptions {
  url: string;
  htmlContent?: string;
  useAiFallback?: boolean;
  maxItems?: number;
}
