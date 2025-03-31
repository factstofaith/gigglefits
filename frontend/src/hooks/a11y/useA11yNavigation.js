/**
 * Accessibility Navigation Hook
 * 
 * A custom hook for managing navigation and tab indices in an accessible way.
 * Part of the zero technical debt accessibility implementation.
 * 
 * @module hooks/a11y/useA11yNavigation
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for managing tab navigation in complex components
 * 
 * @param {Object} options - Configuration options
 * @param {number} [options.itemCount=0] - Number of items to manage
 * @param {number} [options.defaultActiveIndex=-1] - Default active index
 * @param {boolean} [options.wrap=true] - Whether to wrap around at edges
 * @param {boolean} [options.vertical=true] - Whether navigation is vertical
 * @param {boolean} [options.horizontal=true] - Whether navigation is horizontal
 * @param {Function} [options.onNavigate] - Callback when navigation occurs
 * @param {Function} [options.onActivate] - Callback when an item is activated
 * @returns {Object} Navigation state and handlers
 */
const useA11yNavigation = ({
  itemCount = 0,
  defaultActiveIndex = -1,
  wrap = true,
  vertical = true,
  horizontal = true,
  onNavigate = null,
  onActivate = null
} = {}) => {
  // Current active index
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  
  // Last user interaction type for determining focus visibility
  const [interactionType, setInteractionType] = useState('keyboard');
  
  // Store references for item elements
  const itemRefs = useRef([]);
  
  /**
   * Update active index within bounds
   */
  const updateActiveIndex = useCallback((newIndex) => {
    if (newIndex < 0) {
      newIndex = wrap ? itemCount - 1 : 0;
    } else if (newIndex >= itemCount) {
      newIndex = wrap ? 0 : itemCount - 1;
    }
    
    setActiveIndex(newIndex);
    
    if (onNavigate) {
      onNavigate(newIndex);
    }
    
    return newIndex;
  }, [itemCount, wrap, onNavigate]);
  
  /**
   * Navigate to the next item
   */
  const navigateNext = useCallback(() => {
    setInteractionType('keyboard');
    return updateActiveIndex(activeIndex + 1);
  }, [activeIndex, updateActiveIndex]);
  
  /**
   * Navigate to the previous item
   */
  const navigatePrevious = useCallback(() => {
    setInteractionType('keyboard');
    return updateActiveIndex(activeIndex - 1);
  }, [activeIndex, updateActiveIndex]);
  
  /**
   * Navigate to the first item
   */
  const navigateFirst = useCallback(() => {
    setInteractionType('keyboard');
    return updateActiveIndex(0);
  }, [updateActiveIndex]);
  
  /**
   * Navigate to the last item
   */
  const navigateLast = useCallback(() => {
    setInteractionType('keyboard');
    return updateActiveIndex(itemCount - 1);
  }, [updateActiveIndex, itemCount]);
  
  /**
   * Navigate to a specific index
   */
  const navigateTo = useCallback((index, { focus = true, source = 'keyboard' } = {}) => {
    setInteractionType(source);
    const newIndex = updateActiveIndex(index);
    
    if (focus && itemRefs.current[newIndex]) {
      itemRefs.current[newIndex].focus();
    }
    
    return newIndex;
  }, [updateActiveIndex]);
  
  /**
   * Handle item activation (e.g., on Enter or click)
   */
  const activateItem = useCallback((index, event) => {
    if (index >= 0 && index < itemCount) {
      if (onActivate) {
        onActivate(index, event);
      }
    }
  }, [itemCount, onActivate]);
  
  /**
   * Get props for the container element
   */
  const getContainerProps = useCallback(({ role = 'menu', ...props } = {}) => ({
    role,
    'aria-orientation': vertical && !horizontal 
      ? 'vertical' 
      : !vertical && horizontal 
        ? 'horizontal' 
        : undefined,
    ...props
  }), [vertical, horizontal]);
  
  /**
   * Get props for each item element
   */
  const getItemProps = useCallback((index, { role = 'menuitem', disabled = false, ...props } = {}) => ({
    role,
    tabIndex: index === activeIndex ? 0 : -1,
    'aria-disabled': disabled ? 'true' : undefined,
    'data-index': index,
    'data-focus-visible': index === activeIndex && interactionType === 'keyboard' ? 'true' : undefined,
    ref: (el) => {
      itemRefs.current[index] = el;
    },
    onKeyDown: (event) => {
      if (disabled) return;
      
      const { key } = event;
      let handled = false;
      
      if (vertical && key === 'ArrowDown') {
        navigateNext();
        handled = true;
      } else if (vertical && key === 'ArrowUp') {
        navigatePrevious();
        handled = true;
      } else if (horizontal && key === 'ArrowRight') {
        navigateNext();
        handled = true;
      } else if (horizontal && key === 'ArrowLeft') {
        navigatePrevious();
        handled = true;
      } else if (key === 'Home') {
        navigateFirst();
        handled = true;
      } else if (key === 'End') {
        navigateLast();
        handled = true;
      } else if (key === 'Enter' || key === ' ') {
        activateItem(index, event);
        handled = true;
      }
      
      if (handled) {
        event.preventDefault();
      }
      
      if (props.onKeyDown) {
        props.onKeyDown(event);
      }
    },
    onClick: (event) => {
      if (!disabled) {
        setInteractionType('mouse');
        activateItem(index, event);
        
        // Also navigate to the item
        navigateTo(index, { focus: false, source: 'mouse' });
      }
      
      if (props.onClick) {
        props.onClick(event);
      }
    },
    onFocus: (event) => {
      // Don't change active index on focus if it's not coming from keyboard navigation
      if (interactionType === 'keyboard') {
        navigateTo(index, { focus: false });
      }
      
      if (props.onFocus) {
        props.onFocus(event);
      }
    },
    ...props
  }), [
    activeIndex, 
    interactionType, 
    navigateNext, 
    navigatePrevious, 
    navigateFirst, 
    navigateLast, 
    navigateTo, 
    activateItem, 
    vertical, 
    horizontal
  ]);
  
  /**
   * Handle when item count changes
   */
  useEffect(() => {
    // If active index is out of bounds, update it
    if (activeIndex >= itemCount) {
      updateActiveIndex(itemCount > 0 ? itemCount - 1 : -1);
    }
    
    // Resize refs array
    itemRefs.current = itemRefs.current.slice(0, itemCount);
  }, [itemCount, activeIndex, updateActiveIndex]);
  
  /**
   * Update container key event handlers when active element changes
   */
  useEffect(() => {
    // Set up global keyboard event detection to track interaction type
    const handleKeyDown = () => {
      setInteractionType('keyboard');
    };
    
    const handleMouseDown = () => {
      setInteractionType('mouse');
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('mousedown', handleMouseDown, true);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, []);
  
  return {
    activeIndex,
    interactionType,
    navigateNext,
    navigatePrevious,
    navigateFirst,
    navigateLast,
    navigateTo,
    activateItem,
    getContainerProps,
    getItemProps,
    itemRefs: itemRefs.current
  };
};

export default useA11yNavigation;