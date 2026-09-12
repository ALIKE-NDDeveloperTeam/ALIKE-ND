import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  isLightMode?: boolean;
  onClick?: () => void;
}

// Masterpiece Vector Speed-Bag Icon - Razor sharp at any resolution
export const AlikeBagIcon: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 transition-transform duration-300 drop-shadow-sm`}
    >
      <defs>
        {/* Rich Magenta Pink Gradient */}
        <linearGradient id="alikeBgPink" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#FF1E82" />
          <stop offset="60%" stopColor="#E91269" />
          <stop offset="100%" stopColor="#C20054" />
        </linearGradient>

        {/* Speed streak vibrant gradient */}
        <linearGradient id="alikeSpeedStreak" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#FF479C" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#E91269" />
        </linearGradient>
      </defs>

      {/* 3 Sharp Speed Wings on the Left */}
      {/* Top speed wing */}
      <path
        d="M 6 33 L 36 29.5 C 37.5 29.3, 38.5 30.5, 38 32 L 35 36.5 C 34.5 37.5, 33 38, 31.5 38 L 12 40 C 9.5 40.2, 5 36.5, 6 33 Z"
        fill="url(#alikeSpeedStreak)"
      />
      {/* Middle speed wing */}
      <path
        d="M 2 46 L 31 43 C 32.5 42.8, 33.5 44, 33 45.5 L 29.5 50.5 C 29 51.5, 27.5 52, 26 52 L 8 54 C 5 54.5, 1 50, 2 46 Z"
        fill="url(#alikeSpeedStreak)"
      />
      {/* Bottom speed wing */}
      <path
        d="M 8 59 L 26 56.5 C 27.5 56.3, 28.5 57.5, 28 59 L 25 63 C 24.5 64, 23 64.5, 21.5 64.5 L 14 65.5 C 11 66, 7 62.5, 8 59 Z"
        fill="url(#alikeSpeedStreak)"
      />

      {/* Modern Curved Bag Handle */}
      <path
        d="M 52 23 C 50 11, 70 8, 72 20"
        stroke="url(#alikeBgPink)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Main Shopping Bag Body with Chamfered Corners */}
      <path
        d="M 42 22 L 83 17.5 C 86 17.2, 88.5 19.5, 88 22.5 L 79.5 78 C 79 81, 76.5 83, 73.5 83 L 34 83 C 30.8 83, 28.5 80.2, 29 77 L 38 26 C 38.5 23.5, 40.2 22.2, 42 22 Z"
        fill="url(#alikeBgPink)"
      />

      {/* Dynamic Aerodynamic Swoosh Highlight on Bottom Left */}
      <path
        d="M 16 67 C 26 68, 34 60, 42 54 C 37 63, 35 73, 44 78 C 52 82, 64 77, 68 68 C 62 78, 51 84.5, 34 84.5 C 20 84.5, 13 74, 16 67 Z"
        fill="url(#alikeSpeedStreak)"
      />

      {/* Prominent White "AD" Monogram on Bag Face */}
      <text
        x="57"
        y="58"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#FFFFFF"
        fontSize="24"
        fontWeight="900"
        fontStyle="italic"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        letterSpacing="0.5"
        className="select-none"
      >
        AD
      </text>
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  isLightMode = false,
  onClick,
}) => {
  const sizeMap = {
    xs: {
      height: 'h-6 sm:h-7',
      iconSize: 'w-6 h-6',
      textSize: 'text-sm font-black tracking-tight',
      badgeSize: 'text-[9px] px-1.5 py-0.5',
      gap: 'gap-1.5',
    },
    sm: {
      height: 'h-7 sm:h-8',
      iconSize: 'w-7 h-7 sm:w-8 sm:h-8',
      textSize: 'text-base sm:text-lg font-black tracking-tight',
      badgeSize: 'text-[10px] px-1.5 py-0.5',
      gap: 'gap-2',
    },
    md: {
      height: 'h-9 sm:h-10 md:h-11',
      iconSize: 'w-8 h-8 sm:w-9 sm:h-9',
      textSize: 'text-lg sm:text-xl font-black tracking-tight',
      badgeSize: 'text-xs px-2 py-0.5',
      gap: 'gap-2',
    },
    lg: {
      height: 'h-11 sm:h-12 md:h-14',
      iconSize: 'w-10 h-10 sm:w-12 sm:h-12',
      textSize: 'text-2xl sm:text-3xl font-black tracking-tight',
      badgeSize: 'text-sm px-2.5 py-0.5',
      gap: 'gap-2.5',
    },
    xl: {
      height: 'h-14 sm:h-16 md:h-20',
      iconSize: 'w-14 h-14 sm:w-16 sm:h-16',
      textSize: 'text-3xl sm:text-4xl md:text-5xl font-black tracking-tight',
      badgeSize: 'text-base px-3 py-1',
      gap: 'gap-3',
    },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none group ${
        onClick ? 'cursor-pointer active:scale-98' : ''
      } ${current.gap} ${className}`}
    >
      {/* Original Masterpiece Vector Speed-Bag Icon */}
      <AlikeBagIcon className={`${current.iconSize} transition-transform duration-300 group-hover:scale-105 shrink-0`} />

      {/* Official ALIKE ND Brand Typography matching user-provided exact design */}
      {showText && (
        <span
          className={`font-sans font-black uppercase text-[#FF007F] select-none leading-none tracking-wider transition-all duration-200 group-hover:brightness-110 ${current.textSize}`}
          style={{ letterSpacing: '0.08em' }}
        >
          ALIKE ND
        </span>
      )}
    </div>
  );
};

export default Logo;
