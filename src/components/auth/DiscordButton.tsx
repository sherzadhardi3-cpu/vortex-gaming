'use client';

// VORTEX GAMING — Official Discord OAuth2 Button Component
// Uses official Discord blurple branding (#5865F2) and vector SVG icon

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DiscordButtonProps {
  mode?: 'login' | 'register' | 'link';
  className?: string;
}

export function DiscordButton({ mode = 'login', className = '' }: DiscordButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    // Redirects to server endpoint which generates state + PKCE and routes to Discord authorization
    window.location.href = `/api/auth/discord/login?mode=${mode}`;
  };

  const buttonText =
    mode === 'register'
      ? 'Register with Discord'
      : mode === 'link'
      ? 'Connect Discord Account'
      : 'Continue with Discord';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`w-full h-11 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-200 shadow-md shadow-[#5865F2]/25 hover:shadow-lg hover:shadow-[#5865F2]/40 active:scale-[0.98] disabled:opacity-50 cursor-pointer ${className}`}
      title={buttonText}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        /* Official Discord Vector SVG Logo */
        <svg
          className="w-5 h-5 fill-current shrink-0"
          viewBox="0 0 127.14 96.36"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.86,53,48.81,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
        </svg>
      )}
      <span>{buttonText}</span>
    </button>
  );
}
