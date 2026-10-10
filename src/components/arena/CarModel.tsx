import React from 'react';
import { CAR_SKINS, CarVisual } from '../../../shared/types.ts';

interface CarModelProps {
  carId: string;
  isMoving?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CarModel: React.FC<CarModelProps> = ({
  carId,
  isMoving = false,
  className = '',
  size = 'md',
}) => {
  const skin: CarVisual = CAR_SKINS.find(c => c.id === carId) || CAR_SKINS[0];

  // Scale dimensions
  const scale = size === 'sm' ? 0.75 : size === 'lg' ? 1.3 : 1.0;
  const width = Math.round(130 * scale);
  const height = Math.round(52 * scale);

  return (
    <div className={`relative inline-flex items-center select-none ${className}`}>
      {/* Nitro exhaust particles when moving */}
      {isMoving && (
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <div
            className="w-5 h-2 rounded-full animate-ping opacity-75"
            style={{ backgroundColor: skin.primaryColor }}
          />
          <div
            className="w-3 h-1.5 -ml-2 rounded-full blur-[2px]"
            style={{ backgroundColor: '#ffffff' }}
          />
        </div>
      )}

      {/* SVG Supercar */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 130 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-md overflow-visible transition-transform duration-200"
      >
        <defs>
          {/* Body gradient */}
          <linearGradient id={`bodyGrad-${skin.id}`} x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor={skin.primaryColor} />
            <stop offset="60%" stopColor={skin.secondaryColor} />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Glass cockpit gradient */}
          <linearGradient id={`cockpitGrad-${skin.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
          </linearGradient>

          {/* Underglow blur */}
          <filter id={`underglow-${skin.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Neon Underglow */}
        <ellipse
          cx="65"
          cy="46"
          rx="52"
          ry="5"
          fill={skin.primaryColor}
          filter={`url(#underglow-${skin.id})`}
          opacity={isMoving ? 0.9 : 0.45}
        />

        {/* Rear Wing / Spoiler */}
        <path
          d="M 6 16 L 22 17 L 18 24 L 8 24 Z"
          fill={skin.secondaryColor}
          stroke="#0f172a"
          strokeWidth="1"
        />
        <line x1="12" y1="24" x2="12" y2="34" stroke="#475569" strokeWidth="2.5" />
        <line x1="18" y1="24" x2="18" y2="34" stroke="#475569" strokeWidth="2.5" />

        {/* Main Aerodynamic Chassis */}
        <path
          d="M 8 36 
             C 12 30, 24 28, 38 27 
             C 48 20, 58 13, 76 13 
             C 94 13, 102 24, 114 30 
             L 126 36 
             C 128 38, 126 42, 122 43 
             L 10 43 
             C 7 43, 6 39, 8 36 Z"
          fill={`url(#bodyGrad-${skin.id})`}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.2"
        />

        {/* Cockpit Canopy */}
        <path
          d="M 44 26 
             C 54 18, 65 16, 76 16 
             C 86 16, 92 21, 98 26 
             Z"
          fill={`url(#cockpitGrad-${skin.id})`}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1"
        />

        {/* Side Racing Decal / Vent Line */}
        <path
          d="M 52 32 L 86 32 L 78 35 L 48 35 Z"
          fill="#0f172a"
          opacity="0.6"
        />

        {/* Car Badge Label */}
        <text
          x="62"
          y="34"
          fill="#f8fafc"
          fontSize="6"
          fontWeight="bold"
          letterSpacing="0.8"
          opacity="0.8"
        >
          {skin.badge}
        </text>

        {/* Headlight (Front Right) */}
        <path
          d="M 120 33 L 127 37 L 121 39 Z"
          fill="#38bdf8"
          filter="drop-shadow(0 0 4px #06b6d4)"
        />
        {/* Headlight beam */}
        <path
          d="M 127 36 L 140 32 L 140 44 L 127 38 Z"
          fill="#38bdf8"
          opacity="0.15"
        />

        {/* Taillight (Rear Left) */}
        <rect
          x="7"
          y="33"
          width="4"
          height="5"
          rx="1"
          fill="#ef4444"
          filter="drop-shadow(0 0 4px #f43f5e)"
        />

        {/* Wheels & Rims */}
        {/* Rear Wheel */}
        <g transform="translate(26, 42)">
          <circle cx="0" cy="0" r="10" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <circle cx="0" cy="0" r="6" fill="#1e293b" />
          <circle cx="0" cy="0" r="3" fill={skin.primaryColor} />
          {/* Wheel Spokes */}
          <line x1="-5" y1="0" x2="5" y2="0" stroke="#94a3b8" strokeWidth="1.2" />
          <line x1="0" y1="-5" x2="0" y2="5" stroke="#94a3b8" strokeWidth="1.2" />
        </g>

        {/* Front Wheel */}
        <g transform="translate(104, 42)">
          <circle cx="0" cy="0" r="10" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <circle cx="0" cy="0" r="6" fill="#1e293b" />
          <circle cx="0" cy="0" r="3" fill={skin.primaryColor} />
          {/* Wheel Spokes */}
          <line x1="-5" y1="0" x2="5" y2="0" stroke="#94a3b8" strokeWidth="1.2" />
          <line x1="0" y1="-5" x2="0" y2="5" stroke="#94a3b8" strokeWidth="1.2" />
        </g>
      </svg>
    </div>
  );
};
