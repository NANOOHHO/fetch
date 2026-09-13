import { useState } from 'react';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { FetchResult, Item } from './types';

export default function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FetchResult | null>(null);
  const [error, setError] = useState<string>('');
  const [useAi, setUseAi] = useState(false);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/fetch-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, useAi }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: FetchResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!result) return;
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = 'extracted-items.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <h1 className="font-[Cormorant] text-4xl font-bold text-white">Web Item Extractor</h1>
          <p className="mt-2 text-slate-400">Fetch and extract product details, listings, prices, images, and metadata from any website</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Input Form */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
          <form onSubmit={handleFetch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Website URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://booth.pm/en/items/... or any website"
                className="w-full rounded border border-slate-600 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAi}
                  onChange={(e) => setUseAi(e.target.checked)}
                  className="rounded border-slate-600"
                />
                <span className="text-sm text-slate-300">Use AI extraction (requires API key)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                'Extract Items'
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-500/50 bg-red-950/30 p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-400">Error</h3>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6">
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Extraction Results</h2>
                  <p className="text-sm text-slate-400 mt-1">Method: {result.extractionMethod}</p>
                </div>
                <button
                  onClick={downloadJSON}
                  className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download JSON
                </button>
              </div>

              <p className="text-slate-300 mb-4">Found <span className="font-bold text-white">{result.items.length}</span> items</p>

              {result.warnings && result.warnings.length > 0 && (
                <div className="mb-4 text-sm text-yellow-300 bg-yellow-950/30 rounded p-3">
                  {result.warnings.map((w, i) => <p key={i}>⚠️ {w}</p>)}
                </div>
              )}

              {result.items.length > 0 ? (
                <div className="space-y-4">
                  {result.items.map((item: Item, idx: number) => (
                    <div key={idx} className="rounded border border-slate-600 bg-slate-900/50 p-4">
                      <div className="flex gap-4">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-24 w-24 rounded object-cover flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23374151%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E';
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{item.title}</h3>
                          {item.price && <p className="text-sm text-green-400 font-medium mt-1">{item.price}</p>}
                          {item.description && <p className="text-sm text-slate-400 mt-2 line-clamp-2">{item.description}</p>}
                          {item.url && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-2 inline-block">
                              View Item →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No items found. Try using AI extraction or check the URL.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}