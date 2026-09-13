import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download } from 'lucide-react';
import { FetchResult } from '../types';
import { exportToJson } from '../utils/exportUtils';

interface RawJsonModalProps {
  isOpen: boolean;
  data: FetchResult | null;
  onClose: () => void;
}

export const RawJsonModal: React.FC<RawJsonModalProps> = ({ isOpen, data, onClose }) => {
  const [copied, setCopied] = useState(false);

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

  if (!isOpen || !data) return null;

  const jsonStr = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div
        className="bg-zinc-900 text-zinc-100 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-zinc-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-zinc-400">Structured Data Inspector</span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-zinc-800 text-zinc-300">
              {data.itemCount} items
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy All'}</span>
            </button>
            <button
              type="button"
              onClick={() => exportToJson(data)}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
            <button
              type="button"
              id="close-raw-json-modal-btn"
              aria-label="Close raw JSON inspector"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-auto flex-1 font-mono text-xs leading-relaxed bg-zinc-900 text-emerald-400">
          <pre>{jsonStr}</pre>
        </div>
      </div>
    </div>
  );
};
