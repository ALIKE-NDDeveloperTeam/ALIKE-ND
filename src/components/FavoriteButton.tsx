import React, { useState } from 'react';
import { Heart } from 'lucide-react';

export interface FavoriteButtonProps {
  isLiked?: boolean;
  onToggle?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  'aria-label'?: string;
  className?: string;
  iconClassName?: string;
  id?: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isLiked: controlledLiked,
  onToggle,
  onClick,
  'aria-label': ariaLabel = 'Add to Wishlist',
  className = '',
  iconClassName = '',
  id,
  title,
  size = 'lg',
}) => {
  const [internalLiked, setInternalLiked] = useState(false);
  const isLiked = controlledLiked !== undefined ? controlledLiked : internalLiked;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (controlledLiked === undefined) {
      setInternalLiked(!internalLiked);
    }
    if (onToggle) {
      onToggle(e);
    }
    if (onClick) {
      onClick(e);
    }
  };

  // Default size w-7 h-7 (28px) as requested
  const sizeClasses = size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-6 h-6' : 'w-7 h-7';

  return (
    <button
      id={id}
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      title={title || (isLiked ? 'Remove from Wishlist' : 'Add to Wishlist')}
      className={`p-1.5 bg-transparent border-0 shadow-none outline-none focus:outline-none transition-transform duration-200 hover:scale-115 active:scale-90 cursor-pointer flex items-center justify-center select-none ${className}`}
    >
      <Heart
        className={`${sizeClasses} transition-all duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] ${
          isLiked
            ? 'fill-rose-500 text-rose-500 drop-shadow-md animate-heart-pop'
            : 'text-neutral-800 dark:text-white/90 hover:text-rose-500 dark:hover:text-rose-400 fill-none stroke-[2]'
        } ${iconClassName}`}
      />
    </button>
  );
};

export default FavoriteButton;
