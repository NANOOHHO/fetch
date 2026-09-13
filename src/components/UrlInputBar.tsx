import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, Loader2, Code2, Clipboard, X, Check, Globe } from 'lucide-react';

interface UrlInputBarProps {
  onFetch: (url: string, useAi: boolean, htmlContent?: string) => Promise<void>;
  isLoading: boolean;
}

const PRESET_EXAMPLES = [
  {
    name: 'Booth.pm 3D Model',
    url: 'https://booth.pm/en/items/5813187',
    desc: 'Booth single 3D item with specs & variants',
    badge: 'Booth Single',
  },
  {
    name: 'Booth.pm 3D Browse',
    url: 'https://booth.pm/en/browse/3D%20Characters',
    desc: 'Booth multi-item catalog grid',
    badge: 'Booth Catalog',
  },
  {
    name: 'Itch.io Game Assets',
    url: 'https://itch.io/game-assets',
    desc: 'Asset store cards with prices',
    badge: 'Store Grid',
  },
  {
    name: 'Shopify Store Demo',
    url: 'https://demo.vercel.store',
    desc: 'JSON-LD structured e-commerce',
    badge: 'JSON-LD',
  },
];

export const UrlInputBar: React.FC<UrlInputBarProps> = ({ onFetch, isLoading }) => {
  const [url, setUrl] = useState('');
  const [useAi, setUseAi] = useState(false);
  const [showRawHtmlInput, setShowRawHtmlInput] = useState(false);
  const [rawHtml, setRawHtml] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showRawHtmlInput && rawHtml.trim()) {
      onFetch(url.trim() || 'https://custom-pasted-html.local', useAi, rawHtml);
    } else if (url.trim()) {
      onFetch(url.trim(), useAi);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
      }
    } catch {
      // Fallback
    }
  };

  const handlePresetSelect = (presetUrl: string) => {
    setUrl(presetUrl);
    setShowRawHtmlInput(false);
    onFetch(presetUrl, useAi);
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-6 shadow-xs transition-all">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* URL Input Row */}
        <div>
          <label htmlFor="website-url-input" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
            Target Website URL or Store Link
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
              <Globe className="w-5 h-5" />
            </div>

            <input
              id="website-url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. https://booth.pm/en/items/4849366 or any store/catalog URL..."
              disabled={isLoading}
              className="w-full pl-11 pr-24 sm:pr-32 py-3 rounded-xl border border-zinc-300 bg-zinc-50/50 text-zinc-900 placeholder-zinc-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all font-mono"
            />

            <div className="absolute right-2 flex items-center gap-1">
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg transition-colors cursor-pointer"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handlePaste}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors cursor-pointer"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3 h-3" />
                <span>Paste</span>
              </button>
            </div>
          </div>
        </div>

        {/* Optional Raw HTML accordion */}
        {showRawHtmlInput && (
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="raw-html-textarea" className="text-xs font-semibold text-zinc-700">
                Paste Raw HTML Source (useful if behind login or cloudflare)
              </label>
              <button
                type="button"
                onClick={() => setShowRawHtmlInput(false)}
                className="text-xs text-zinc-500 hover:text-zinc-800 cursor-pointer"
              >
                Close
              </button>
            </div>
            <textarea
              id="raw-html-textarea"
              rows={4}
              value={rawHtml}
              onChange={(e) => setRawHtml(e.target.value)}
              placeholder="Paste <html> ... </html> source code here..."
              className="w-full p-2.5 text-xs font-mono bg-white rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        )}

        {/* Action Controls & AI Mode */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-4">
            {/* AI Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-zinc-700">
              <input
                id="ai-toggle-checkbox"
                type="checkbox"
                checked={useAi}
                onChange={(e) => setUseAi(e.target.checked)}
                className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900 border-zinc-300 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Sparkles className={`w-3.5 h-3.5 ${useAi ? 'text-amber-500' : 'text-zinc-400'}`} />
                AI-Enhanced Extraction (Gemini 3.8 Flash)
              </span>
            </label>

            {/* Paste HTML Toggle */}
            <button
              type="button"
              id="toggle-raw-html-btn"
              onClick={() => setShowRawHtmlInput(!showRawHtmlInput)}
              className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showRawHtmlInput ? 'Hide HTML Input' : 'Paste HTML directly'}</span>
            </button>
          </div>

          <button
            type="submit"
            id="fetch-items-submit-btn"
            disabled={isLoading || (!url.trim() && !rawHtml.trim())}
            className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Fetching & Extracting...</span>
              </>
            ) : (
              <>
                <span>Fetch Items</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preset Quick Samples */}
      <div className="mt-4 pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-2">
          <span>Quick test presets:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PRESET_EXAMPLES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePresetSelect(preset.url)}
              disabled={isLoading}
              className="p-2.5 text-left rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/70 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-zinc-800 group-hover:text-zinc-950 truncate">
                  {preset.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-medium shrink-0">
                  {preset.badge}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 truncate">{preset.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
