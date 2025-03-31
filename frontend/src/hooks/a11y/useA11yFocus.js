/**
 * Accessibility Focus Hook
 * 
 * A custom hook for managing focus in an accessible way.
 * Part of the zero technical debt accessibility implementation.
 * 
 * @module hooks/a11y/useA11yFocus
 */

import { useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for managing focus in an accessible way
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} [options.trapFocus=false] - Whether to trap focus within a container
 * @param {boolean} [options.autoFocus=false] - Whether to auto-focus the first focusable element
 * @param {boolean} [options.restoreFocus=true] - Whether to restore focus when unmounting
 * @returns {Object} Object containing focus management functions
 */
const useA11yFocus = ({
  trapFocus = false,
  autoFocus = false,
  restoreFocus = true
} = {}) => {
  // Reference to the container element
  const containerRef = useRef(null);
  
  // Reference to the element to restore focus to
  const previousFocusRef = useRef(null);
  
  // Reference to the first and last focusable elements
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);
  
  /**
   * Get all focusable elements within the container
   */
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    // Selector for all potentially focusable elements
    const focusableSelector = [
      'a[href]:not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      'area[href]:not([tabindex="-1"])',
      '[contentEditable=true]:not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');
    
    return Array.from(containerRef.current.querySelectorAll(focusableSelector));
  }, []);
  
  /**
   * Update the first and last focusable elements refs
   */
  const updateFocusableRefs = useCallback(() => {
    const focusableElements = getFocusableElements();
    
    if (focusableElements.length > 0) {
      firstFocusableRef.current = focusableElements[0];
      lastFocusableRef.current = focusableElements[focusableElements.length - 1];
    } else {
      firstFocusableRef.current = null;
      lastFocusableRef.current = null;
    }
  }, [getFocusableElements]);
  
  /**
   * Set the container element reference
   */
  const setContainerRef = useCallback((element) => {
    if (!element) return;
    
    containerRef.current = element;
    updateFocusableRefs();
  }, [updateFocusableRefs]);
  
  /**
   * Focus a specific element
   */
  const focusElement = useCallback((element) => {
    if (!element || typeof element.focus !== 'function') return;
    
    try {
      element.focus();
    } catch (e) {
      console.error('Error focusing element:', e);
    }
  }, []);
  
  /**
   * Focus the first focusable element in the container
   */
  const focusFirstElement = useCallback(() => {
    if (firstFocusableRef.current) {
      focusElement(firstFocusableRef.current);
      return true;
    }
    return false;
  }, [focusElement]);
  
  /**
   * Focus the last focusable element in the container
   */
  const focusLastElement = useCallback(() => {
    if (lastFocusableRef.current) {
      focusElement(lastFocusableRef.current);
      return true;
    }
    return false;
  }, [focusElement]);
  
  /**
   * Save the currently focused element
   */
  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement;
  }, []);
  
  /**
   * Restore focus to the previously focused element
   */
  const restorePreviousFocus = useCallback(() => {
    if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
      try {
        previousFocusRef.current.focus();
      } catch (e) {
        console.error('Error restoring focus:', e);
      }
    }
  }, []);
  
  /**
   * Handle tab key to trap focus within the container
   */
  const handleTabKey = useCallback((event) => {
    if (!trapFocus || !containerRef.current) return;
    
    // Update focusable elements in case the DOM has changed
    updateFocusableRefs();
    
    // Handle shift+tab
    if (event.shiftKey && document.activeElement === firstFocusableRef.current) {
      event.preventDefault();
      focusLastElement();
    }
    // Handle tab
    else if (!event.shiftKey && document.activeElement === lastFocusableRef.current) {
      event.preventDefault();
      focusFirstElement();
    }
  }, [trapFocus, updateFocusableRefs, focusFirstElement, focusLastElement]);
  
  /**
   * Set up key event listeners for focus trapping
   */
  useEffect(() => {
    if (!trapFocus || !containerRef.current) return;
    
    // Update focusable elements
    updateFocusableRefs();
    
    // Set up event listener for keydown
    const handleKeyDown = (event) => {
      if (event.key === 'Tab') {
        handleTabKey(event);
      }
    };
    
    // Add the event listener
    containerRef.current.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listener
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [trapFocus, handleTabKey, updateFocusableRefs]);
  
  /**
   * Set up auto-focus and restore focus on unmount
   */
  useEffect(() => {
    // Save the currently focused element
    if (restoreFocus) {
      saveFocus();
    }
    
    // Auto-focus the first element if requested
    if (autoFocus) {
      updateFocusableRefs();
      focusFirstElement();
    }
    
    // Restore focus when unmounting
    return () => {
      if (restoreFocus) {
        restorePreviousFocus();
      }
    };
  }, [autoFocus, restoreFocus, saveFocus, updateFocusableRefs, focusFirstElement, restorePreviousFocus]);
  
  return {
    containerRef,
    setContainerRef,
    focusFirstElement,
    focusLastElement,
    focusElement,
    saveFocus,
    restorePreviousFocus,
    updateFocusableRefs
  };
};

export default useA11yFocus;