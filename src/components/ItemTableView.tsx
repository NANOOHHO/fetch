import React from 'react';
import { ExternalLink, Eye, Image as ImageIcon } from 'lucide-react';
import { ExtractedItem } from '../types';
import { getProxyImageUrl } from '../utils/exportUtils';

interface ItemTableViewProps {
  items: ExtractedItem[];
  onSelect: (item: ExtractedItem) => void;
}

export const ItemTableView: React.FC<ItemTableViewProps> = ({ items, onSelect }) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-600 font-semibold text-xs">
              <th className="py-3 px-4 w-14">Image</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4 w-32">Price</th>
              <th className="py-3 px-4 w-44">Creator / Shop</th>
              <th className="py-3 px-4 w-40">Tags / Category</th>
              <th className="py-3 px-4 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-800">
            {items.map((item) => {
              const img = item.imageUrl ? getProxyImageUrl(item.imageUrl) : null;
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="hover:bg-zinc-50/70 transition-colors cursor-pointer"
                >
                  <td className="py-2.5 px-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden flex items-center justify-center shrink-0 border border-zinc-200">
                      {img ? (
                        <img
                          src={img}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
                  </td>

                  <td className="py-2.5 px-4 font-medium text-zinc-900 max-w-xs sm:max-w-md truncate">
                    <span title={item.title}>{item.title}</span>
                  </td>

                  <td className="py-2.5 px-4 whitespace-nowrap">
                    {item.isFree ? (
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                        FREE
                      </span>
                    ) : item.price ? (
                      <span className="font-semibold text-zinc-900">{item.price}</span>
                    ) : (
                      <span className="text-zinc-400 text-xs">N/A</span>
                    )}
                  </td>

                  <td className="py-2.5 px-4 text-zinc-600 truncate max-w-[160px]">
                    {item.authorOrShop || '-'}
                  </td>

                  <td className="py-2.5 px-4 text-zinc-500 truncate max-w-[150px]">
                    {item.tags && item.tags.length > 0
                      ? item.tags.slice(0, 2).map((t) => `#${t}`).join(' ')
                      : item.category || '-'}
                  </td>

                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onSelect(item)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                        title="Open source page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
