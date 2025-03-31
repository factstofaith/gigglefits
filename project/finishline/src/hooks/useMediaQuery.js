/**
 * useMediaQuery Hook
 * 
 * Custom hook for responsive design using media queries.
 * 
 * @module hooks/useMediaQuery
 */

import { useState, useEffect, useMemo } from 'react';

/**
 * Hook to detect if a media query matches
 *
 * @param {string} query - CSS media query string
 * @returns {boolean} Whether the media query matches
 */
function useMediaQuery(query) {
  // Initialize with null since we don't know the match on the server
  const [matches, setMatches] = useState(false);
  
  // Memoize the media query to avoid unnecessary re-renders
  const mediaQueryList = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return window.matchMedia(query);
  }, [query]);
  
  useEffect(() => {
    if (!mediaQueryList) return;
    
    // Set initial value
    setMatches(mediaQueryList.matches);
    
    // Define listener function
    const listener = (event) => {
      setMatches(event.matches);
    };
    
    // Use the modern addEventListener if available, or fallback to the deprecated addListener
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener);
      return () => {
        mediaQueryList.removeEventListener('change', listener);
      };
    } else {
      // Fallback for older browsers
      mediaQueryList.addListener(listener);
      return () => {
        mediaQueryList.removeListener(listener);
      };
    }
  }, [mediaQueryList]);
  
  return matches;
}

/**
 * Predefined breakpoints for common screen sizes
 */
export const breakpoints = {
  xs: '(max-width: 575.98px)',
  sm: '(min-width: 576px) and (max-width: 767.98px)',
  md: '(min-width: 768px) and (max-width: 991.98px)',
  lg: '(min-width: 992px) and (max-width: 1199.98px)',
  xl: '(min-width: 1200px) and (max-width: 1399.98px)',
  xxl: '(min-width: 1400px)',
  
  // Inclusive breakpoints (e.g., sm and up)
  smUp: '(min-width: 576px)',
  mdUp: '(min-width: 768px)',
  lgUp: '(min-width: 992px)',
  xlUp: '(min-width: 1200px)',
  xxlUp: '(min-width: 1400px)',
  
  // Mobile-first breakpoints
  smDown: '(max-width: 767.98px)',
  mdDown: '(max-width: 991.98px)',
  lgDown: '(max-width: 1199.98px)',
  xlDown: '(max-width: 1399.98px)',
  
  // Special cases
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  dark: '(prefers-color-scheme: dark)',
  light: '(prefers-color-scheme: light)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  highContrast: '(prefers-contrast: more)',
  lowContrast: '(prefers-contrast: less)',
  touch: '(hover: none) and (pointer: coarse)',
  stylus: '(hover: none) and (pointer: fine)',
  pointer: '(hover: hover) and (pointer: fine)',
  colorGamutP3: '(color-gamut: p3)',
  colorGamutSRGB: '(color-gamut: srgb)',
};

/**
 * Hook to use a predefined breakpoint
 *
 * @param {string} breakpointKey - Key of the breakpoint to use
 * @returns {boolean} Whether the breakpoint matches
 */
export function useBreakpoint(breakpointKey) {
  const query = breakpoints[breakpointKey];
  
  if (!query) {
    console.error(`Breakpoint key "${breakpointKey}" is not defined`);
    return false;
  }
  
  return useMediaQuery(query);
}

/**
 * Hook to determine the current active breakpoint
 *
 * @returns {string} The current active breakpoint key
 */
export function useActiveBreakpoint() {
  const isXs = useMediaQuery(breakpoints.xs);
  const isSm = useMediaQuery(breakpoints.sm);
  const isMd = useMediaQuery(breakpoints.md);
  const isLg = useMediaQuery(breakpoints.lg);
  const isXl = useMediaQuery(breakpoints.xl);
  const isXxl = useMediaQuery(breakpoints.xxl);
  
  if (isXs) return 'xs';
  if (isSm) return 'sm';
  if (isMd) return 'md';
  if (isLg) return 'lg';
  if (isXl) return 'xl';
  if (isXxl) return 'xxl';
  
  // Default to 'xs' for SSR
  return 'xs';
}

export default useMediaQuery;