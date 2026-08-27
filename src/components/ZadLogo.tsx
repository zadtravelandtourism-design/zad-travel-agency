import React from 'react';

interface ZadLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showText?: boolean;
  textColor?: string;
}

export const ZadLogo: React.FC<ZadLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'text-slate-900',
}) => {
  const sizeMap = {
    sm: { icon: 'w-10 h-10', textAr: 'text-xs', textEn: 'text-[9px]' },
    md: { icon: 'w-16 h-16', textAr: 'text-base', textEn: 'text-xs' },
    lg: { icon: 'w-24 h-24', textAr: 'text-xl', textEn: 'text-sm' },
    xl: { icon: 'w-32 h-32', textAr: 'text-2xl', textEn: 'text-base' },
    custom: { icon: 'w-full h-full', textAr: 'text-base', textEn: 'text-xs' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      {/* SVG Icon Artwork */}
      <div className={`relative ${currentSize.icon} flex items-center justify-center`}>
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full drop-shadow-xs"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gold Gradient for the Swoop Arc */}
            <linearGradient id="zadGoldSwoosh" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F7C948" />
              <stop offset="45%" stopColor="#D99B26" />
              <stop offset="85%" stopColor="#BF831A" />
              <stop offset="100%" stopColor="#A86F12" />
            </linearGradient>

            {/* Deep Navy Gradient for Building */}
            <linearGradient id="zadNavy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E3A5F" />
              <stop offset="100%" stopColor="#12243D" />
            </linearGradient>

            {/* Pure Gold Accent */}
            <linearGradient id="zadGoldAccent" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFDE6A" />
              <stop offset="100%" stopColor="#E5A93C" />
            </linearGradient>
          </defs>

          {/* 1. Airplane & Jet Streak */}
          <g id="airplane-group">
            {/* Golden Jet Streak */}
            <path
              d="M110 82 L125 80 L115 85 Z"
              fill="#E5A93C"
              opacity="0.9"
            />
            {/* Plane Silhouette */}
            <path
              d="M102 74 
                 L116 71 
                 L122 75 
                 L118 78 
                 L106 80 
                 L101 89 
                 L97 88 
                 L101 79 
                 L92 81 
                 L88 86 
                 L85 85 
                 L87 79 
                 L82 80 
                 L86 76 
                 L93 76 
                 L100 71 
                 Z"
              fill="#1E3A5F"
            />
          </g>

          {/* 2. Top Golden Crescent */}
          <g id="crescent">
            <path
              d="M148 26 
                 C154 26 158 31 157 37 
                 C156 43 150 47 144 47 
                 C138 47 132 43 131 37 
                 C130 31 134 26 140 26 
                 C136 29 135 34 137 38 
                 C139 42 144 44 148 43 
                 C152 42 155 38 155 34 
                 C155 30 152 27 148 26 Z"
              fill="url(#zadGoldAccent)"
            />
            {/* Small pinnacle dot */}
            <circle cx="144" cy="48" r="2.5" fill="url(#zadGoldAccent)" />
          </g>

          {/* 3. Clock Tower Spire */}
          <g id="clock-tower-spire">
            {/* Spire needle */}
            <polygon points="144,50 146,80 142,80" fill="#1E3A5F" />
            <polygon points="144,50 145,80 144,80" fill="#2A4B75" />

            {/* Spire stepped balconies */}
            <rect x="139" y="80" width="10" height="5" rx="1" fill="#1E3A5F" />
            <rect x="137" y="85" width="14" height="6" rx="1" fill="url(#zadNavy)" />
            <rect x="135" y="91" width="18" height="7" rx="1.5" fill="#1E3A5F" />

            {/* Main Clock Housing */}
            <rect x="127" y="98" width="34" height="35" rx="2" fill="url(#zadNavy)" />
            
            {/* Golden Clock Face */}
            <circle cx="144" cy="115" r="11" fill="url(#zadGoldAccent)" stroke="#12243D" strokeWidth="1.5" />
            <circle cx="144" cy="115" r="2" fill="#1E3A5F" />
            {/* Clock Hands */}
            <line x1="144" y1="115" x2="144" y2="108" stroke="#1E3A5F" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="144" y1="115" x2="149" y2="115" stroke="#1E3A5F" strokeWidth="1.5" strokeLinecap="round" />

            {/* Tower Base transition */}
            <rect x="123" y="133" width="42" height="10" rx="1" fill="#1E3A5F" />
          </g>

          {/* 4. The Holy Kaaba Building */}
          <g id="kaaba-building">
            {/* Main Cube Body */}
            <rect x="95" y="143" width="98" height="104" rx="4" fill="url(#zadNavy)" />

            {/* 3D Roof / Upper Trim */}
            <polygon points="95,143 144,136 193,143" fill="#2B4D78" />

            {/* Upper Golden Kiswa Band */}
            <rect x="95" y="156" width="98" height="16" fill="url(#zadGoldAccent)" />
            {/* Kiswah Inscription Accents */}
            <rect x="100" y="159" width="10" height="10" fill="#1E3A5F" rx="1" />
            <rect x="114" y="159" width="10" height="10" fill="#1E3A5F" rx="1" />
            <rect x="128" y="159" width="10" height="10" fill="#1E3A5F" rx="1" />
            <rect x="142" y="159" width="10" height="10" fill="#1E3A5F" rx="1" />
            <rect x="156" y="159" width="10" height="10" fill="#1E3A5F" rx="1" />
            <rect x="170" y="159" width="10" height="10" fill="#1E3A5F" rx="1" />

            {/* Golden Kaaba Door (Bab al-Kaaba) */}
            <rect x="153" y="184" width="26" height="48" rx="2" fill="url(#zadGoldAccent)" stroke="#B87D18" strokeWidth="1" />
            {/* Door details */}
            <rect x="157" y="188" width="18" height="18" rx="1" fill="#D99B26" opacity="0.6" />
            <rect x="157" y="210" width="18" height="18" rx="1" fill="#D99B26" opacity="0.6" />
            <circle cx="166" cy="208" r="1.5" fill="#1E3A5F" />
          </g>

          {/* 5. Dynamic Golden Orbital Swoosh Arc */}
          <g id="orbital-swoosh">
            <path
              d="M160 115 
                 C210 115 248 145 240 190 
                 C233 230 185 262 115 264 
                 C140 262 178 248 198 226 
                 C222 200 220 160 178 135 
                 C162 125 145 120 160 115 Z"
              fill="url(#zadGoldSwoosh)"
            />
          </g>
        </svg>
      </div>

      {/* Typography */}
      {showText && (
        <div className="mt-1.5 flex flex-col items-center">
          <span className={`font-black tracking-normal leading-tight text-slate-900 ${currentSize.textAr} ${textColor}`} style={{ fontFamily: "'Cairo', 'Alexandria', Arial, sans-serif" }}>
            زاد للسفر و السياحة
          </span>
          <span className={`font-bold tracking-wide font-sans text-slate-900 ${currentSize.textEn} ${textColor}`}>
            Zad Travel & Tourism
          </span>
        </div>
      )}
    </div>
  );
};
