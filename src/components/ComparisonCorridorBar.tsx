import React, { useState } from 'react';
import { X, Trash2, GitCompare } from 'lucide-react';

export interface ActionButtonsProps {
  count?: number;
  onPurge?: () => void;
  onCompare?: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  count = 1,
  onPurge,
  onCompare,
}) => {
  return (
    <div className="flex items-center space-x-3 shrink-0">
      {/* Purge Matrix Button (Subtle red/rose border theme with clean text) */}
      <button
        type="button"
        id="purge-matrix-btn"
        onClick={onPurge}
        className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 hover:border-rose-500/60 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-rose-500/10 active:scale-95 transition-all cursor-pointer"
        title="Clear all compared items"
      >
        <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
        <span>Purge Matrix</span>
      </button>

      {/* Compare Specs Button (High-contrast solid amber/gold primary CTA with bold dark text) */}
      <button
        type="button"
        id="compare-specs-btn"
        onClick={onCompare}
        className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:brightness-105 active:scale-95 transition-all cursor-pointer border border-amber-400/40"
        title={`Compare ${count} selected creations`}
      >
        <GitCompare className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Compare Specs ({count})</span>
      </button>
    </div>
  );
};

export interface ComparisonProductItem {
  id: string | number;
  image: string;
  name?: string;
  price?: number;
  brand?: string;
}

export interface ComparisonCorridorBarProps {
  selectedItems?: ComparisonProductItem[];
  onRemoveItem?: (id: string | number) => void;
  onCloseBar?: () => void;
  onPurge?: () => void;
  onCompare?: () => void;
}

export const ComparisonCorridorBar: React.FC<ComparisonCorridorBarProps> = ({
  selectedItems = [],
  onRemoveItem,
  onCloseBar,
  onPurge,
  onCompare,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || selectedItems.length === 0) return null;

  const handleClose = () => {
    setIsVisible(false);
    if (onCloseBar) onCloseBar();
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-40 animate-page-in pointer-events-auto">
      <div className="relative bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-300 dark:border-neutral-700 shadow-2xl rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
        
        {/* Close (X) Button - Top Right Floating Corner Badge */}
        <button
          type="button"
          onClick={handleClose}
          id="close-comparison-bar-btn"
          className="absolute -top-3 -right-3 w-8 h-8 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 border-2 border-white dark:border-neutral-900 cursor-pointer z-10"
          title="Dismiss Comparison Bar"
          aria-label="Dismiss Comparison Bar"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Left Side: Title & Selected Item Thumbnails */}
        <div className="flex items-center space-x-4 min-w-0">
          <div className="shrink-0">
            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-900 dark:text-white">
              Comparison Corridor
            </h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              {selectedItems.length} premium creation{selectedItems.length === 1 ? '' : 's'} selected
            </p>
          </div>

          {/* Item Thumbnails with Small 'X' Overlay to Remove Individual Items */}
          <div className="flex items-center gap-2.5 overflow-x-auto py-1">
            {selectedItems.map((item, idx) => (
              <div
                key={`compare-thumb-${item.id}-${idx}`}
                className="relative group shrink-0 w-12 h-12 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 shadow-xs"
              >
                <img
                  src={item.image}
                  alt={item.name || 'Selected Product'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() => onRemoveItem && onRemoveItem(item.id)}
                  className="absolute -top-1 -right-1 bg-neutral-900/90 text-white hover:bg-rose-600 rounded-full p-0.5 shadow-md transition-colors cursor-pointer border border-white/20"
                  title={`Remove ${item.name || 'item'} from comparison`}
                  aria-label={`Remove ${item.name || 'item'} from comparison`}
                >
                  <X className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <ActionButtons
          count={selectedItems.length}
          onPurge={onPurge}
          onCompare={onCompare}
        />

      </div>
    </div>
  );
};

export default ComparisonCorridorBar;
