import { ExtractedItem, FetchResult } from '../types';

export function exportToJson(data: FetchResult) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.targetDomain || 'extracted-items'}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCsv(items: ExtractedItem[], domain: string) {
  const headers = ['ID', 'Title', 'Price', 'Raw Price', 'Currency', 'Is Free', 'Author / Shop', 'URL', 'Image URL', 'Category', 'Tags'];
  const rows = items.map(item => [
    `"${(item.id || '').replace(/"/g, '""')}"`,
    `"${(item.title || '').replace(/"/g, '""')}"`,
    `"${(item.price || '').replace(/"/g, '""')}"`,
    item.rawPrice !== null && item.rawPrice !== undefined ? item.rawPrice : '',
    `"${(item.currency || '').replace(/"/g, '""')}"`,
    item.isFree ? 'TRUE' : 'FALSE',
    `"${(item.authorOrShop || '').replace(/"/g, '""')}"`,
    `"${(item.url || '').replace(/"/g, '""')}"`,
    `"${(item.imageUrl || '').replace(/"/g, '""')}"`,
    `"${(item.category || '').replace(/"/g, '""')}"`,
    `"${(item.tags || []).join(', ').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${domain || 'items'}-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateMarkdown(items: ExtractedItem[], siteTitle: string): string {
  let md = `# Extracted Items from ${siteTitle}\n\n`;
  md += `| Item | Price | Creator | Link |\n`;
  md += `| :--- | :---: | :---: | :---: |\n`;
  items.forEach(item => {
    const title = (item.title || 'Untitled').replace(/\|/g, '\\|');
    const price = (item.price || (item.isFree ? 'Free' : 'N/A')).replace(/\|/g, '\\|');
    const author = (item.authorOrShop || '-').replace(/\|/g, '\\|');
    const link = item.url ? `[View Item](${item.url})` : '-';
    md += `| ${title} | ${price} | ${author} | ${link} |\n`;
  });
  return md;
}

export function getProxyImageUrl(url?: string | null): string {
  if (!url) return '';
  // If it's from booth.pm or pximg or relative or requires proxying
  if (url.includes('booth.pm') || url.includes('pximg') || url.includes('cloudfront')) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}
