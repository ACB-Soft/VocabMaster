import React from 'react';

/**
 * Custom English to Turkish (EN ➔ TR) Translation Direction Icon
 */
export const EnToTrIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* English 'A' glyph */}
    <path d="M3.5 16.5L7 7.5l3.5 9" />
    <path d="M5 13.5h4" />
    
    {/* Translation directional arrow */}
    <path d="M12.5 12h3" />
    <path d="M14 9.5l2.5 2.5-2.5 2.5" />
    
    {/* Turkish 'T' glyph */}
    <path d="M18 7.5h4.5" />
    <path d="M20.2 7.5v9" />
  </svg>
);

/**
 * Custom Turkish to English (TR ➔ EN) Translation Direction Icon
 */
export const TrToEnIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Turkish 'T' glyph */}
    <path d="M3.5 7.5h4.5" />
    <path d="M5.7 7.5v9" />
    
    {/* Translation directional arrow */}
    <path d="M10.5 12h3" />
    <path d="M12 9.5l2.5 2.5-2.5 2.5" />
    
    {/* English 'A' glyph */}
    <path d="M15.5 16.5L19 7.5l3.5 9" />
    <path d="M17 13.5h4" />
  </svg>
);

/**
 * Dual Swap Translation Icon (EN ⇄ TR)
 */
export const TranslationSwapIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M7 8h13l-3-3" />
    <path d="M17 16H4l3 3" />
  </svg>
);
