import React from 'react';
import { Globe, Sparkles, Layers, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  itemCount?: number;
  activeDomain?: string;
  onOpenHistory?: () => void;
  historyCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  itemCount,
  activeDomain,
  onOpenHistory,
  historyCount = 0,
}) => {
  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
            <ShoppingBag className="w-5 h-5 text-zinc-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-zinc-900 text-lg leading-tight tracking-tight">
                Web Item Extractor
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                Booth.pm & Web Catalog
              </span>
            </div>
            <p className="text-xs text-zinc-500 hidden sm:block">
              Universal product, price, and catalog scraper with structured data & AI parsing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeDomain && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Target: {activeDomain}</span>
              {typeof itemCount === 'number' && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-200/70 text-emerald-900 font-semibold">
                  {itemCount} items
                </span>
              )}
            </div>
          )}

          {onOpenHistory && historyCount > 0 && (
            <button
              id="history-toggle-btn"
              onClick={onOpenHistory}
              className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="View recent fetched websites"
            >
              <Layers className="w-3.5 h-3.5 text-zinc-500" />
              <span>History ({historyCount})</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-medium text-zinc-700">AI + Parser</span>
          </div>
        </div>
      </div>
    </header>
  );
};
