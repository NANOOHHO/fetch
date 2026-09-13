import React from 'react';
import { ShoppingBag, Sparkles, CheckCircle2, ShieldCheck, Database, Layers, ArrowUpRight } from 'lucide-react';

interface EmptyStateProps {
  onSelectSample: (url: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectSample }) => {
  return (
    <div className="space-y-8 py-6">
      {/* Hero Explainer */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Multi-Engine Scraping & Extraction</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight mb-3">
            Fetch products and catalog listings from any website.
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-6">
            Extract titles, prices, currencies, author/shop profiles, image galleries, digital download variations, and tags in clean structured format. Specialized for <strong className="text-zinc-900">booth.pm</strong>, online marketplaces, Shopify, and arbitrary websites.
          </p>
        </div>

        {/* 3 Capabilities Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-100">
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-zinc-100" />
            </div>
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Booth.pm Specialist
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Full parsing for single items & catalog browse pages. Handles JPY currencies, download variations, tags, and anti-hotlinking image proxying.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <Database className="w-4 h-4 text-zinc-100" />
            </div>
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Universal Schema & JSON-LD
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Auto-extracts Schema.org <code className="text-zinc-800">Product</code> and <code className="text-zinc-800">ItemList</code> microdata, OpenGraph metadata, and catalog cards from any e-commerce site.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Gemini 3.8 Flash AI Engine
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              For complex or unconventional pages, Gemini analyzes the DOM to accurately extract items, prices, and specifications into clean JSON.
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Sites & Quick Launch */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4">
          Try With Popular Web Catalogs
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onSelectSample('https://booth.pm/en/browse/3D%20Characters')}
            className="p-3 text-left rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <div className="text-xs font-semibold text-zinc-900">Booth.pm — 3D Characters</div>
              <div className="text-[11px] text-zinc-500">Popular VRChat & 3D character catalog</div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            type="button"
            onClick={() => onSelectSample('https://booth.pm/en/items/5813187')}
            className="p-3 text-left rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <div className="text-xs font-semibold text-zinc-900">Booth.pm — Single Product</div>
              <div className="text-[11px] text-zinc-500">Detailed item with download variants & specs</div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            type="button"
            onClick={() => onSelectSample('https://itch.io/game-assets')}
            className="p-3 text-left rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <div className="text-xs font-semibold text-zinc-900">Itch.io — Game Assets</div>
              <div className="text-[11px] text-zinc-500">Digital game asset marketplace grid</div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
};
