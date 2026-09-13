export interface Item {
  title: string;
  price?: string;
  description?: string;
  image?: string;
  url?: string;
  [key: string]: any;
}

export interface FetchResult {
  items: Item[];
  extractionMethod: 'booth_structured' | 'html_generic' | 'gemini_ai' | 'hybrid';
  warnings?: string[];
  [key: string]: any;
}
