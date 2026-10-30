'use client';

// VORTEX GAMING — Original Brand Logo & Lockup Component
// 100% original SVG vector emblem and cyberpunk typography

import React from 'react';
import Link from 'next/link';

interface VortexLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  href?: string;
  className?: string;
}

export function VortexLogo({
  size = 'md',
  showSubtitle = true,
  href = '/',
  className = '',
}: VortexLogoProps) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };

  const content = (
    <div className={`flex items-center gap-2.5 group shrink-0 ${className}`}>
      {/* Original Geometric Vortex Emblem */}
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-tr from-[#00d4ff] via-[#38bdf8] to-[#7c3aed] flex items-center justify-center p-0.5 shadow-lg shadow-[#00d4ff]/20 group-hover:shadow-[#00d4ff]/40 transition-all duration-300`}
      >
        <div className="w-full h-full bg-[#0a0a0f] rounded-[10px] flex items-center justify-center relative overflow-hidden">
          {/* Internal Cyber Hex Lines & Glowing V */}
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 text-[#00d4ff] group-hover:scale-110 transition-transform duration-300"
            fill="none"
          >
            <path
              d="M12 2L21 7V17L12 22L3 17V7L12 2Z"
              stroke="#7c3aed"
              strokeWidth="1.2"
              strokeOpacity="0.4"
            />
            <path
              d="M7 7L12 17L17 7H14.5L12 12.5L9.5 7H7Z"
              fill="currentColor"
            />
            <circle cx="12" cy="10" r="1.2" fill="#38bdf8" />
          </svg>
        </div>
      </div>

      {/* Typography */}
      <div>
        <div
          className={`${textSizes[size]} font-black tracking-wider text-white flex items-center gap-1.5 font-mono leading-none`}
        >
          <span>VORTEX</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold uppercase tracking-widest leading-none">
            GAMING
          </span>
        </div>
        {showSubtitle && (
          <div className="text-[9px] sm:text-[10px] tracking-widest text-[#a0a0b8] uppercase font-semibold mt-1">
            Digital Marketplace
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
