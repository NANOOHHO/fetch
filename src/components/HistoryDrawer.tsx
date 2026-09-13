import React, { useEffect } from 'react';
import { X, Clock, Trash2, ArrowRight, Globe } from 'lucide-react';
import { FetchResult } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: FetchResult[];
  onSelectHistory: (result: FetchResult) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onClearHistory,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end"
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-zinc-200 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-600" />
            <h3 className="font-semibold text-zinc-900 text-sm">Recent Fetches</h3>
            <span className="text-xs text-zinc-500">({history.length})</span>
          </div>
          <button
            type="button"
            id="close-history-drawer-btn"
            aria-label="Close history"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 divide-y divide-zinc-100">
          {history.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs">
              No recent fetches yet. Start by entering a website URL above!
            </div>
          ) : (
            history.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectHistory(item);
                  onClose();
                }}
                className="py-3 px-2 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-zinc-900 truncate max-w-[240px]">
                    {item.pageTitle || item.targetDomain}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-medium">
                    {item.itemCount} items
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 truncate flex items-center gap-1 font-mono">
                  <Globe className="w-3 h-3 shrink-0 text-zinc-400" />
                  <span>{item.sourceUrl}</span>
                </div>
                <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1">
                  <span>{new Date(item.extractedAt).toLocaleTimeString()}</span>
                  <span className="text-zinc-700 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    <span>Load</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex justify-end">
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer px-2 py-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
