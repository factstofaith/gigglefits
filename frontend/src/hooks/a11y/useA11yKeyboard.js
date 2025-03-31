/**
 * Accessibility Keyboard Hook
 * 
 * A custom hook for managing keyboard interactions and focus management
 * in an accessible way. Part of the zero technical debt accessibility implementation.
 * 
 * @module hooks/a11y/useA11yKeyboard
 */

import { useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for managing keyboard navigation in an accessible way
 * 
 * @param {Object} options - Configuration options
 * @param {Array<HTMLElement|React.RefObject>} [options.elements] - Array of elements or refs to include in keyboard navigation
 * @param {boolean} [options.trapFocus=false] - Whether to trap focus within the elements
 * @param {boolean} [options.autoFocus=true] - Whether to auto-focus the first element when elements change
 * @param {boolean} [options.loop=true] - Whether to loop from last to first element and vice versa
 * @param {Function} [options.onEscape] - Callback to call when Escape key is pressed
 * @param {string} [options.focusClass='a11y-keyboard-focus'] - CSS class to apply to elements focused via keyboard
 * @returns {Object} Object containing focus management functions and keyboard handlers
 */
const useA11yKeyboard = ({
  elements = [],
  trapFocus = false,
  autoFocus = true,
  loop = true,
  onEscape = null,
  focusClass = 'a11y-keyboard-focus'
} = {}) => {
  // Reference to track the current focus index
  const currentIndexRef = useRef(-1);
  
  // Reference to track if the focus was triggered by keyboard
  const keyboardFocusRef = useRef(false);
  
  // Store the element references for access in event handlers
  const elementsRef = useRef([]);
  
  // Store the initial active element to restore focus when unmounting
  const initialActiveElement = useRef(null);
  
  /**
   * Get the actual DOM elements from the elements array
   * which could contain React refs or direct DOM elements
   */
  const getDOMElements = useCallback(() => {
    return elements.map(element => {
      // If it's a React ref, get the current value
      if (element && typeof element === 'object' && 'current' in element) {
        return element.current;
      }
      return element;
    }).filter(Boolean); // Filter out null/undefined
  }, [elements]);
  
  /**
   * Updates the stored elements array
   */
  useEffect(() => {
    elementsRef.current = getDOMElements();
  }, [getDOMElements]);
  
  /**
   * Focus an element at a specific index
   */
  const focusElementAt = useCallback((index) => {
    const domElements = elementsRef.current;
    
    if (domElements.length === 0) return;
    
    // Handle index out of bounds based on loop setting
    if (index < 0) {
      index = loop ? domElements.length - 1 : 0;
    } else if (index >= domElements.length) {
      index = loop ? 0 : domElements.length - 1;
    }
    
    // Update current index and focus the element
    currentIndexRef.current = index;
    keyboardFocusRef.current = true;
    
    const elementToFocus = domElements[index];
    if (elementToFocus && typeof elementToFocus.focus === 'function') {
      elementToFocus.focus();
      
      // Apply focus styling for keyboard navigation
      elementToFocus.classList.add(focusClass);
      
      // Remove the class when focus is lost
      const handleBlur = () => {
        elementToFocus.classList.remove(focusClass);
        elementToFocus.removeEventListener('blur', handleBlur);
      };
      
      elementToFocus.addEventListener('blur', handleBlur);
    }
  }, [loop, focusClass]);
  
  /**
   * Handle focusing the next element in the sequence
   */
  const focusNext = useCallback(() => {
    focusElementAt(currentIndexRef.current + 1);
  }, [focusElementAt]);
  
  /**
   * Handle focusing the previous element in the sequence
   */
  const focusPrevious = useCallback(() => {
    focusElementAt(currentIndexRef.current - 1);
  }, [focusElementAt]);
  
  /**
   * Focus the first element in the sequence
   */
  const focusFirst = useCallback(() => {
    focusElementAt(0);
  }, [focusElementAt]);
  
  /**
   * Focus the last element in the sequence
   */
  const focusLast = useCallback(() => {
    const domElements = elementsRef.current;
    focusElementAt(domElements.length - 1);
  }, [focusElementAt]);
  
  /**
   * Handle keydown events for keyboard navigation
   */
  const handleKeyDown = useCallback((event) => {
    const { key, shiftKey } = event;
    
    // Handle tab key for focus management
    if (key === 'Tab') {
      // If focus should be trapped within the component
      if (trapFocus) {
        event.preventDefault();
        
        if (shiftKey) {
          focusPrevious();
        } else {
          focusNext();
        }
      }
      // Otherwise, let Tab work normally, but keep track of the currently focused element
      else {
        const domElements = elementsRef.current;
        const currentFocusedElement = document.activeElement;
        
        const newIndex = domElements.findIndex(el => el === currentFocusedElement);
        if (newIndex !== -1) {
          currentIndexRef.current = newIndex;
        }
      }
    }
    // Arrow key navigation
    else if (key === 'ArrowDown' || key === 'ArrowRight') {
      event.preventDefault();
      focusNext();
    }
    else if (key === 'ArrowUp' || key === 'ArrowLeft') {
      event.preventDefault();
      focusPrevious();
    }
    else if (key === 'Home') {
      event.preventDefault();
      focusFirst();
    }
    else if (key === 'End') {
      event.preventDefault();
      focusLast();
    }
    else if (key === 'Escape' && onEscape) {
      event.preventDefault();
      onEscape(event);
    }
  }, [trapFocus, focusNext, focusPrevious, focusFirst, focusLast, onEscape]);
  
  /**
   * Set up auto-focus on initial render and when elements change
   */
  useEffect(() => {
    const domElements = getDOMElements();
    elementsRef.current = domElements;
    
    if (autoFocus && domElements.length > 0 && currentIndexRef.current === -1) {
      // Store the initially focused element to restore later
      initialActiveElement.current = document.activeElement;
      
      // Focus the first element in the sequence
      focusFirst();
    }
    
    return () => {
      // If nothing is focused now or if the currently focused element is in our list,
      // return focus to the initially active element when unmounting
      const currentFocused = document.activeElement;
      const isElementInList = elementsRef.current.includes(currentFocused);
      
      if (initialActiveElement.current && 
          (currentFocused === document.body || isElementInList)) {
        try {
          initialActiveElement.current.focus();
        } catch (e) {
          // Ignore focus errors (element might be gone)
        }
      }
    };
  }, [elements, autoFocus, getDOMElements, focusFirst]);
  
  /**
   * Create an event handler that can be directly attached to an element
   */
  const createKeyDownHandler = useCallback(() => {
    return (event) => handleKeyDown(event);
  }, [handleKeyDown]);
  
  /**
   * Get a handler for arrow key navigation with a custom navigation map
   */
  const getArrowKeyHandler = useCallback((currentId, connectionMap, onNavigate) => {
    return (event) => {
      const { key } = event;
      
      if (!connectionMap || !currentId) return;
      
      let nextId = null;
      
      if (key === 'ArrowRight') {
        // Navigate to right connection if exists
        const rightConnections = connectionMap[currentId] || [];
        if (rightConnections.length > 0) {
          nextId = rightConnections[0];
        }
      } else if (key === 'ArrowLeft') {
        // Find element that connects to current
        for (const [sourceId, targets] of Object.entries(connectionMap)) {
          if (targets.includes(currentId)) {
            nextId = sourceId;
            break;
          }
        }
      } else if (key === 'ArrowDown' || key === 'ArrowUp') {
        // This depends on the structure of your visualization
        // For many visualizations, you might want to go to siblings
        const allIds = Object.keys(connectionMap);
        const currentIndex = allIds.indexOf(currentId);
        
        if (currentIndex !== -1) {
          const nextIndex = key === 'ArrowDown' 
            ? (currentIndex + 1) % allIds.length 
            : (currentIndex - 1 + allIds.length) % allIds.length;
          nextId = allIds[nextIndex];
        }
      }
      
      if (nextId && onNavigate) {
        onNavigate(nextId);
      }
    };
  }, []);

  return {
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    focusElementAt,
    handleKeyDown,
    createKeyDownHandler,
    getArrowKeyHandler,
    currentIndex: currentIndexRef.current,
    isKeyboardFocus: keyboardFocusRef.current
  };
};

export default useA11yKeyboard;