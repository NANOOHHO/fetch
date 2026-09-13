import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Copy, Check, ShoppingBag, Layers, Tag, User, Download } from 'lucide-react';
import { ExtractedItem } from '../types';
import { getProxyImageUrl } from '../utils/exportUtils';

interface ItemDetailModalProps {
  item: ExtractedItem | null;
  onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (item) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  useEffect(() => {
    if (item) {
      setSelectedImage(item.imageUrl || (item.additionalImages && item.additionalImages[0]) || '');
      setCopiedLink(false);
      setCopiedJson(false);
    }
  }, [item]);

  if (!item) return null;

  const allImages = [
    ...(item.imageUrl ? [item.imageUrl] : []),
    ...(item.additionalImages || []),
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(item.url || '');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(item, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const activeImgUrl = selectedImage ? getProxyImageUrl(selectedImage) : null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-zinc-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:px-6 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-zinc-200 text-zinc-700">
              Item Details
            </span>
            {item.category && (
              <span className="text-xs text-zinc-500 font-medium">
                in {item.category}
              </span>
            )}
          </div>
          <button
            type="button"
            id="close-item-detail-modal-btn"
            aria-label="Close details"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gallery Column */}
            <div className="space-y-3">
              <div className="aspect-4/3 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center relative">
                {activeImgUrl ? (
                  <img
                    src={activeImgUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain bg-zinc-950/5"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-400 p-6 text-center">
                    <ShoppingBag className="w-10 h-10 mb-2 stroke-1" />
                    <span className="text-xs">No image preview</span>
                  </div>
                )}
                {item.isFree && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white shadow-xs">
                    FREE ITEM
                  </span>
                )}
              </div>

              {/* Thumbnails list if multiple images exist */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {allImages.map((imgUrl, idx) => {
                    const isSelected = selectedImage === imgUrl;
                    const proxyUrl = getProxyImageUrl(imgUrl);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImage(imgUrl)}
                        className={`w-14 h-14 rounded-lg border-2 overflow-hidden shrink-0 transition-all cursor-pointer ${
                          isSelected ? 'border-zinc-900 ring-2 ring-zinc-900/20' : 'border-zinc-200 hover:border-zinc-400 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={proxyUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Info Column */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                {/* Creator / Shop */}
                {item.authorOrShop && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Creator / Shop:</span>
                    {item.authorUrl ? (
                      <a
                        href={item.authorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-zinc-900 hover:underline inline-flex items-center gap-1"
                      >
                        {item.authorOrShop}
                        <ExternalLink className="w-3 h-3 text-zinc-400" />
                      </a>
                    ) : (
                      <span className="font-semibold text-zinc-900">{item.authorOrShop}</span>
                    )}
                  </div>
                )}

                {/* Title */}
                <h2 className="text-lg sm:text-xl font-bold text-zinc-900 leading-snug">
                  {item.title}
                </h2>

                {/* Price Display */}
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-medium text-zinc-500">Price</div>
                    <div className="text-xl font-bold text-zinc-900">
                      {item.isFree ? (
                        <span className="text-emerald-600">Free / ¥0</span>
                      ) : (
                        item.price || 'Price on request'
                      )}
                    </div>
                  </div>
                  {item.currency && (
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-zinc-200 text-zinc-800">
                      {item.currency}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-zinc-700 mb-1.5 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Tags & Labels</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-xs bg-zinc-100 text-zinc-700 font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center gap-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span>Open Item on Website</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy direct product link"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied' : 'Copy URL'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-3 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy item JSON"
                >
                  {copiedJson ? <Check className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4" />}
                  <span>JSON</span>
                </button>
              </div>
            </div>
          </div>

          {/* Variations / Digital Download Options (Especially Booth.pm) */}
          {item.variations && item.variations.length > 0 && (
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-zinc-600" />
                <span>Available Variations & Downloads ({item.variations.length})</span>
              </div>
              <div className="divide-y divide-zinc-200">
                {item.variations.map((variant, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-800">{variant.name}</span>
                    <div className="flex items-center gap-2">
                      {variant.price && (
                        <span className="font-semibold text-zinc-900">{variant.price}</span>
                      )}
                      {variant.inStock !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            variant.inStock
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-zinc-200 text-zinc-600'
                          }`}
                        >
                          {variant.inStock ? 'Available' : 'Unavailable'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Description */}
          {item.description && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Product Description & Notes
              </h4>
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-zinc-700 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap font-sans">
                {item.description}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
