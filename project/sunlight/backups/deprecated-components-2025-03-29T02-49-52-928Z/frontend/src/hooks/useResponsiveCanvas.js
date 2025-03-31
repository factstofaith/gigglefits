/**
 * @module useResponsiveCanvas
 * @description Custom hook for managing responsive canvas dimensions
 */

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook for managing responsive canvas dimensions
 * @param {Object} [options] - Configuration options
 * @param {number} [options.debounceMs=100] - Debounce time in milliseconds
 * @returns {Object} Canvas utilities and dimensions
 */
export const useResponsiveCanvas = (options = {}) => {
  // Added display name
  useResponsiveCanvas.displayName = 'useResponsiveCanvas';

  // Added display name
  useResponsiveCanvas.displayName = 'useResponsiveCanvas';

  // Added display name
  useResponsiveCanvas.displayName = 'useResponsiveCanvas';

  // Added display name
  useResponsiveCanvas.displayName = 'useResponsiveCanvas';

  // Added display name
  useResponsiveCanvas.displayName = 'useResponsiveCanvas';


  const { debounceMs = 100 } = options;
  
  // Container element reference
  const containerRef = useRef(null);
  
  // Container dimensions state
  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0
  });
  
  // Debounce timer reference
  const debounceTimerRef = useRef(null);

  /**
   * Handle resize events
   * @param {Element} element - The container element
   */
  const handleResize = useCallback((element) => {
  // Added display name
  handleResize.displayName = 'handleResize';

    if (!element) return;
    
    containerRef.current = element;
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Debounce resize calculations
    debounceTimerRef.current = setTimeout(() => {
      const { clientWidth, clientHeight } = element;
      
      setContainerSize({
        width: clientWidth,
        height: clientHeight
      });
    }, debounceMs);
  }, [debounceMs]);

  // Add window resize listener
  useEffect(() => {
    const handleWindowResize = () => {
  // Added display name
  handleWindowResize.displayName = 'handleWindowResize';

  // Added display name
  handleWindowResize.displayName = 'handleWindowResize';

  // Added display name
  handleWindowResize.displayName = 'handleWindowResize';

  // Added display name
  handleWindowResize.displayName = 'handleWindowResize';

  // Added display name
  handleWindowResize.displayName = 'handleWindowResize';


      if (containerRef.current) {
        handleResize(containerRef.current);
      }
    };
    
    window.addEventListener('resize', handleWindowResize);
    
    // Initialize size on first render
    if (containerRef.current) {
      handleResize(containerRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [handleResize]);

  /**
   * Update container dimensions manually
   * @param {number} width - New width
   * @param {number} height - New height
   */
  const setDimensions = useCallback((width, height) => {
  // Added display name
  setDimensions.displayName = 'setDimensions';

    setContainerSize({ width, height });
  }, []);

  return {
    containerSize,
    handleResize,
    setDimensions,
    containerRef
  };
};

export default useResponsiveCanvas;