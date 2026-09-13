import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { UrlInputBar } from './components/UrlInputBar';
import { FilterAndSortBar, ViewMode, PriceFilter, SortOption } from './components/FilterAndSortBar';
import { ItemCard } from './components/ItemCard';
import { ItemDetailModal } from './components/ItemDetailModal';
import { RawJsonModal } from './components/RawJsonModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { EmptyState } from './components/EmptyState';
import { FetchResult, ExtractedItem } from './types';
import { exportToJson, exportToCsv, generateMarkdown } from './utils/exportUtils';
import { AlertCircle, ExternalLink, Globe, Sparkles, RefreshCw } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'web_extractor_history_v1';

export default function App() {
  const [result, setResult] = useState<FetchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & display
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modals & Drawers
  const [selectedItem, setSelectedItem] = useState<ExtractedItem | null>(null);
  const [lovedIds, setLovedIds] = useState<Set<string>>(new Set());
  const [showRawJson, setShowRawJson] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCopiedMarkdown, setIsCopiedMarkdown] = useState(false);

  const handleToggleLove = (id: string) => {
    setLovedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // History
  const [history, setHistory] = useState<FetchResult[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveToHistory = (item: FetchResult) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.sourceUrl !== item.sourceUrl);
      const updated = [item, ...filtered].slice(0, 15);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}
  };

  // Fetch API call
  const handleFetch = async (url: string, useAi: boolean, htmlContent?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/fetch-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, useAi, htmlContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch items from the target website.');
      }

      setResult(data);
      saveToHistory(data);
      setSearchQuery('');
      setPriceFilter('all');
      setSortBy('default');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'An error occurred while fetching items.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    if (!result?.items) return [];

    let list = [...result.items];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(q);
        const authorMatch = item.authorOrShop?.toLowerCase().includes(q);
        const categoryMatch = item.category?.toLowerCase().includes(q);
        const tagsMatch = item.tags?.some((t) => t.toLowerCase().includes(q));
        const descMatch = item.description?.toLowerCase().includes(q);
        return titleMatch || authorMatch || categoryMatch || tagsMatch || descMatch;
      });
    }

    // Price filter
    if (priceFilter === 'free') {
      list = list.filter((item) => item.isFree || item.rawPrice === 0 || item.price?.toLowerCase().includes('free'));
    } else if (priceFilter === 'paid') {
      list = list.filter((item) => !item.isFree && (item.rawPrice === null || item.rawPrice > 0));
    }

    // Sort
    if (sortBy === 'price-asc') {
      list.sort((a, b) => (a.rawPrice ?? Infinity) - (b.rawPrice ?? Infinity));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => (b.rawPrice ?? -Infinity) - (a.rawPrice ?? -Infinity));
    } else if (sortBy === 'title-asc') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [result, searchQuery, priceFilter, sortBy]);

  // Export handlers
  const handleExportJson = () => {
    if (result) exportToJson(result);
  };

  const handleExportCsv = () => {
    if (result) exportToCsv(filteredAndSortedItems, result.targetDomain);
  };

  const handleCopyMarkdown = () => {
    if (!result) return;
    const md = generateMarkdown(filteredAndSortedItems, result.pageTitle || result.targetDomain);
    navigator.clipboard.writeText(md);
    setIsCopiedMarkdown(true);
    setTimeout(() => setIsCopiedMarkdown(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      {/* Header */}
      <Header
        activeDomain={result?.targetDomain}
        itemCount={result?.itemCount}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* URL Input Bar */}
        <UrlInputBar onFetch={handleFetch} isLoading={isLoading} />

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold block mb-0.5">Extraction Failed</strong>
              <p className="text-red-700">{error}</p>
              <p className="text-xs text-red-600/80 mt-2">
                Tip: Try enabling "AI-Enhanced Extraction" or paste the raw HTML source if the site blocks automated requests.
              </p>
            </div>
          </div>
        )}

        {/* Result Area */}
        {result ? (
          <div className="space-y-4">
            {/* Website Metadata Header Banner */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center shrink-0">
                  {result.favicon ? (
                    <img
                      src={result.favicon}
                      alt=""
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Globe className="w-5 h-5 text-zinc-400" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-base sm:text-lg font-bold text-zinc-900 leading-snug">
                      {result.pageTitle || result.targetDomain}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {result.extractionMethod === 'specialized_booth'
                        ? 'Booth.pm Engine'
                        : result.extractionMethod === 'gemini_ai'
                        ? 'Gemini 3.8 Flash AI'
                        : result.extractionMethod === 'json_ld'
                        ? 'Schema.org JSON-LD'
                        : 'Web Parser'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                    <span className="font-mono text-zinc-600 truncate max-w-xs sm:max-w-md">
                      {result.sourceUrl}
                    </span>
                    <a
                      href={result.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-zinc-700 hover:text-zinc-950 font-medium hover:underline"
                    >
                      <span>Visit Target</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick stats badge */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <div className="px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-800 text-xs font-semibold">
                  {result.itemCount} items extracted
                </div>
              </div>
            </div>

            {/* Warning if any */}
            {result.warnings && result.warnings.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                {result.warnings.join(' • ')}
              </div>
            )}

            {/* Filter, Sort & Export Controls */}
            {result.items.length > 0 ? (
              <>
                <FilterAndSortBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  priceFilter={priceFilter}
                  onPriceFilterChange={setPriceFilter}
                  sortBy={sortBy}
                  onSortByChange={setSortBy}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  totalItems={result.items.length}
                  filteredCount={filteredAndSortedItems.length}
                  onExportJson={handleExportJson}
                  onExportCsv={handleExportCsv}
                  onCopyMarkdown={handleCopyMarkdown}
                  onViewRawJson={() => setShowRawJson(true)}
                  isCopiedMarkdown={isCopiedMarkdown}
                />

                {/* Items Presentation */}
                {filteredAndSortedItems.length > 0 ? (
                  <div className={`grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                    {filteredAndSortedItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        isSelected={selectedItem?.id === item.id}
                        isLoved={lovedIds.has(item.id)}
                        onToggleLove={handleToggleLove}
                        onSelect={(selected) => setSelectedItem(selected)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center text-zinc-500 text-sm">
                    No items match the current search or filter criteria.
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl border border-zinc-200 p-10 text-center space-y-3">
                <p className="text-zinc-600 text-sm">
                  0 items were detected using standard heuristic selectors on this page.
                </p>
                <button
                  type="button"
                  onClick={() => handleFetch(result.sourceUrl, true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Re-analyze with Gemini AI Extraction</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          !isLoading && (
            <EmptyState
              onSelectSample={(sampleUrl) => handleFetch(sampleUrl, false)}
            />
          )
        )}
      </main>

      {/* Item Details Modal */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Raw JSON Modal */}
      <RawJsonModal
        isOpen={showRawJson}
        data={result}
        onClose={() => setShowRawJson(false)}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistory={(histItem) => {
          setResult(histItem);
          setSearchQuery('');
        }}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
