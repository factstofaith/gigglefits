/**
 * Accessibility Motion Preference Hook
 * 
 * A custom hook for detecting and respecting the user's motion preferences.
 * Part of the zero technical debt accessibility implementation.
 * 
 * @module hooks/a11y/useA11yPrefersReducedMotion
 */

import { useState, useEffect } from 'react';

/**
 * Hook to detect and respond to the user's motion preference
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} [options.defaultValue=false] - Default value if media query isn't supported
 * @param {boolean} [options.respectOverride=true] - Whether to respect app-specific overrides
 * @returns {boolean} Whether reduced motion is preferred
 */
const useA11yPrefersReducedMotion = ({
  defaultValue = false,
  respectOverride = true
} = {}) => {
  // Check for app-specific override in localStorage
  const getInitialValue = () => {
    if (respectOverride) {
      try {
        const storedPreference = localStorage.getItem('a11y-reduced-motion');
        if (storedPreference !== null) {
          return storedPreference === 'true';
        }
      } catch (error) {
        // localStorage might be unavailable (e.g., in private browsing)
        console.warn('Failed to access localStorage for motion preference:', error);
      }
    }
    
    // Use system preference if available
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    // Fall back to default value
    return defaultValue;
  };
  
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getInitialValue);
  
  // Update preference when system settings change
  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) {
      return;
    }
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = () => {
      // Only update if we don't have an override
      if (respectOverride) {
        try {
          const storedPreference = localStorage.getItem('a11y-reduced-motion');
          if (storedPreference !== null) {
            // Override exists, don't update based on system preference
            return;
          }
        } catch (error) {
          // Ignore localStorage errors
        }
      }
      
      setPrefersReducedMotion(mediaQuery.matches);
    };
    
    // Set initial value
    handleChange();
    
    // Add listener for changes in media query
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Older browsers support
      mediaQuery.addListener(handleChange);
    }
    
    // Clean up
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Older browsers support
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [respectOverride]);
  
  /**
   * Override the motion preference
   * @param {boolean|null} value - New preference value (null to clear override)
   */
  const setMotionPreference = (value) => {
    if (!respectOverride) return;
    
    try {
      if (value === null) {
        // Clear override
        localStorage.removeItem('a11y-reduced-motion');
        // Reset to system preference
        if (typeof window !== 'undefined' && 'matchMedia' in window) {
          setPrefersReducedMotion(
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
          );
        } else {
          setPrefersReducedMotion(defaultValue);
        }
      } else {
        // Set override
        localStorage.setItem('a11y-reduced-motion', String(Boolean(value)));
        setPrefersReducedMotion(Boolean(value));
      }
    } catch (error) {
      console.warn('Failed to save motion preference to localStorage:', error);
    }
  };
  
  /**
   * Clear any override and use system preference
   */
  const resetToSystemPreference = () => {
    setMotionPreference(null);
  };
  
  return {
    prefersReducedMotion,
    setMotionPreference,
    resetToSystemPreference,
    
    // Helper animation properties
    animations: {
      transition: prefersReducedMotion ? 'none' : undefined,
      animation: prefersReducedMotion ? 'none' : undefined,
    },
    
    // Duration helper - returns 0 if reduced motion is preferred, otherwise the provided duration
    duration: (ms) => prefersReducedMotion ? 0 : ms,
  };
};

export default useA11yPrefersReducedMotion;