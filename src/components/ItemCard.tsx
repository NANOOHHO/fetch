import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { ExtractedItem } from '../types';
import { getProxyImageUrl } from '../utils/exportUtils';

interface ItemCardProps {
  item: ExtractedItem;
  isSelected?: boolean;
  isLoved?: boolean;
  onToggleLove?: (id: string) => void;
  onSelect: (item: ExtractedItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  isSelected = false,
  isLoved = false,
  onToggleLove,
  onSelect,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [useProxy, setUseProxy] = useState(false);

  // Compute image URL: start with direct, switch to proxy if direct fails, or proxy if domain requires it
  const initialImg = item.imageUrl
    ? item.imageUrl.includes('booth.pm') || item.imageUrl.includes('pximg')
      ? getProxyImageUrl(item.imageUrl)
      : item.imageUrl
    : null;
  const currentImg = useProxy && item.imageUrl ? getProxyImageUrl(item.imageUrl) : initialImg;

  const handleImageError = () => {
    if (!useProxy && item.imageUrl && !item.imageUrl.includes('/api/image-proxy')) {
      setUseProxy(true);
    } else {
      setImageFailed(true);
    }
  };

  const isSale = item.isSale || (item.originalPrice && item.originalPrice !== item.price);
  const isFree = item.isFree || item.rawPrice === 0 || item.price?.toLowerCase() === 'free' || item.price === '0 JPY';
  const isNew = item.tags?.some((t) => t.toLowerCase() === 'new' || t === '新着');

  return (
    <div
      className={`card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(item)}
    >
      {/* Check indicator */}
      <div className="card-check">
        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
      </div>

      {/* Sale or New Badge */}
      {isFree ? (
        <span className="sale-badge">FREE</span>
      ) : isSale ? (
        <span className="sale-badge">SALE</span>
      ) : isNew ? (
        <span className="new-badge">NEW</span>
      ) : null}

      {/* Heart / Loved Button */}
      <button
        type="button"
        className={`card-heart ${isLoved ? 'loved' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleLove?.(item.id);
        }}
        title={isLoved ? 'Remove from favorites' : 'Add to favorites'}
        aria-label="Toggle favorite"
      >
        ♥
      </button>

      {/* Thumbnail or Placeholder */}
      {currentImg && !imageFailed ? (
        <img
          src={currentImg}
          alt={item.title}
          className="card-img"
          onError={handleImageError}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      ) : (
        <div className="card-placeholder">
          🛍️
        </div>
      )}

      {/* Card Body */}
      <div className="card-body">
        <div className="card-name" title={item.title}>
          {item.title}
        </div>
        <div className="card-price">
          {item.originalPrice && <span className="orig">{item.originalPrice}</span>}
          <span>{item.price || (isFree ? 'Free' : '')}</span>
        </div>
        {item.description && (
          <div className="card-desc line-clamp-2">
            {item.description}
          </div>
        )}
        {item.tags && item.tags.length > 0 && (
          <div className="card-tags">
            {item.tags.slice(0, 4).map((tag, idx) => (
              <span key={idx} className="card-tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
