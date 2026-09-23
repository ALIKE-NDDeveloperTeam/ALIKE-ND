import React from 'react';
import { X } from 'lucide-react';

export interface GlassCloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  isLightMode?: boolean;
  size?: 'sm' | 'md' | 'lg';
  iconSize?: 'sm' | 'md' | 'lg';
  'aria-label'?: string;
}

/**
 * Premium unified glassmorphic close button with translucent frosted glass background,
 * subtle border, hover elevation/scale, and sharp X icon.
 */
export const GlassCloseButton: React.FC<GlassCloseButtonProps> = ({
  onClick,
  className = '',
  isLightMode = false,
  size = 'md',
  iconSize,
  'aria-label': ariaLabel = 'Close',
  title = 'Close',
  type = 'button',
  ...rest
}) => {
  // Dimension definitions
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8 sm:w-9 sm:h-9',
    lg: 'w-9 h-9 sm:w-10 sm:h-10'
  }[size];

  // Icon sizing
  const iconClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4 sm:w-4.5 sm:h-4.5',
    lg: 'w-4.5 h-4.5 sm:w-5 sm:h-5'
  }[iconSize || (size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md')];

  // Theme-aware glass styling
  // Light context: semi-translucent crisp white frost with high-contrast neutral icon
  // Dark/image context: dark glass with translucent border and bright icon
  const themeClasses = isLightMode
    ? 'bg-white/70 hover:bg-white/95 text-neutral-800 border-white/60 shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)]'
    : 'bg-black/40 hover:bg-black/60 text-white/90 hover:text-white border-white/20 hover:border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.35)]';

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      className={`rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer select-none shrink-0 ${sizeClasses} ${themeClasses} ${className}`}
      {...rest}
    >
      <X className={`${iconClasses} stroke-[2.25] transition-transform duration-200`} />
    </button>
  );
};

export default GlassCloseButton;
