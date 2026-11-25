import React, { useState } from 'react';

interface ResilientImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#f7f3ed] border border-[#f2e7eb] text-[#685879] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-3 opacity-70"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M5.6 8.5c4.2 1.8 8.6 1.8 12.8 0" />
          <path d="M5.6 15.5c4.2-1.8 8.6-1.8 12.8 0" />
          <path d="M12 3c-2.2 4-2.2 14 0 18" />
        </svg>
        <span className="font-display text-sm font-semibold text-[#2d1f3d]">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
