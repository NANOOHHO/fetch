import React from 'react';
import { Search, LayoutGrid, List, Download, FileSpreadsheet, FileCode, Copy, Check } from 'lucide-react';

export type ViewMode = 'grid' | 'list';
export type PriceFilter = 'all' | 'free' | 'paid';
export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'title-asc';

interface FilterAndSortBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  priceFilter: PriceFilter;
  onPriceFilterChange: (filter: PriceFilter) => void;
  sortBy: SortOption;
  onSortByChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalItems: number;
  filteredCount: number;
  onExportJson: () => void;
  onExportCsv: () => void;
  onCopyMarkdown: () => void;
  onViewRawJson: () => void;
  isCopiedMarkdown: boolean;
}

export const FilterAndSortBar: React.FC<FilterAndSortBarProps> = ({
  searchQuery,
  onSearchChange,
  priceFilter,
  onPriceFilterChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  totalItems,
  filteredCount,
  onExportJson,
  onExportCsv,
  onCopyMarkdown,
  onViewRawJson,
  isCopiedMarkdown,
}) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-3 sm:p-4 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            id="items-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Filter ${totalItems} items by title, author, or tags...`}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
          />
          {searchQuery && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-zinc-400">
              {filteredCount} matching
            </span>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Price filter pills */}
          <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 bg-zinc-50 text-xs">
            <button
              type="button"
              onClick={() => onPriceFilterChange('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                priceFilter === 'all'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onPriceFilterChange('free')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                priceFilter === 'free'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Free
            </button>
            <button
              type="button"
              onClick={() => onPriceFilterChange('paid')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                priceFilter === 'paid'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Paid
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center">
            <label htmlFor="sort-by-select" className="sr-only">
              Sort by
            </label>
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as SortOption)}
              className="text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer"
            >
              <option value="default">Default Order</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title-asc">Title: A to Z</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 bg-zinc-50">
            <button
              type="button"
              id="view-mode-grid-btn"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              id="view-mode-list-btn"
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Export Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 text-xs text-zinc-600">
        <div>
          <span>Showing </span>
          <strong className="text-zinc-900 font-semibold">{filteredCount}</strong>
          <span> of </span>
          <strong className="text-zinc-900 font-semibold">{totalItems}</strong>
          <span> items</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="export-json-btn"
            onClick={onExportJson}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg transition-colors font-medium cursor-pointer"
            title="Download extracted items as JSON"
          >
            <FileCode className="w-3 h-3 text-zinc-600" />
            <span>JSON</span>
          </button>

          <button
            type="button"
            id="export-csv-btn"
            onClick={onExportCsv}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg transition-colors font-medium cursor-pointer"
            title="Download extracted items as CSV spreadsheet"
          >
            <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            id="copy-markdown-btn"
            onClick={onCopyMarkdown}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg transition-colors font-medium cursor-pointer"
            title="Copy as Markdown table"
          >
            {isCopiedMarkdown ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-zinc-600" />
                <span>Markdown</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="view-raw-json-btn"
            onClick={onViewRawJson}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-zinc-500 hover:text-zinc-900 transition-colors font-medium cursor-pointer"
          >
            <span>Inspect Raw</span>
          </button>
        </div>
      </div>
    </div>
  );
};
