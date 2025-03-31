/**
 * Accessibility Utilities
 * 
 * Utility functions for enhancing accessibility in components.
 */

/**
 * Manages focus trap within a container
 * @param {HTMLElement} container - The container to trap focus within
 * @returns {Object} Focus trap controller
 */
export function createFocusTrap(container) {
  if (!container) return null;
  
  // Get all focusable elements
  const getFocusableElements = () => {
    return Array.from(
      container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute('disabled') && el.getAttribute('tabindex') !== '-1');
  };
  
  let focusableElements = getFocusableElements();
  let firstFocusableElement = focusableElements[0];
  let lastFocusableElement = focusableElements[focusableElements.length - 1];
  
  // Store the element that had focus before the trap was activated
  const previouslyFocused = document.activeElement;
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key !== 'Tab') return;
    
    // Update the focusable elements list in case it changed
    focusableElements = getFocusableElements();
    firstFocusableElement = focusableElements[0];
    lastFocusableElement = focusableElements[focusableElements.length - 1];
    
    // Handle forward tabbing
    if (!e.shiftKey && document.activeElement === lastFocusableElement) {
      e.preventDefault();
      firstFocusableElement.focus();
    } 
    // Handle backward tabbing
    else if (e.shiftKey && document.activeElement === firstFocusableElement) {
      e.preventDefault();
      lastFocusableElement.focus();
    }
  };
  
  // Activate focus trap
  const activate = () => {
    container.addEventListener('keydown', handleKeyDown);
    if (firstFocusableElement) {
      firstFocusableElement.focus();
    } else {
      container.setAttribute('tabindex', '-1');
      container.focus();
    }
    return true;
  };
  
  // Deactivate focus trap
  const deactivate = () => {
    container.removeEventListener('keydown', handleKeyDown);
    if (previouslyFocused && previouslyFocused.focus) {
      previouslyFocused.focus();
    }
    return true;
  };
  
  // Return controller
  return {
    activate,
    deactivate,
    updateFocusableElements: () => {
      focusableElements = getFocusableElements();
      firstFocusableElement = focusableElements[0];
      lastFocusableElement = focusableElements[focusableElements.length - 1];
    }
  };
}

/**
 * Announces message to screen readers via live region
 * @param {string} message - Message to announce
 * @param {string} priority - Priority ('polite' or 'assertive')
 */
export function announceToScreenReader(message, priority = 'polite') {
  // Use existing live region or create one
  let liveRegion = document.getElementById('a11y-live-region');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'a11y-live-region';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-relevant', 'additions');
    document.body.appendChild(liveRegion);
  }
  
  // Set the priority
  liveRegion.setAttribute('aria-live', priority);
  
  // Clear existing content
  liveRegion.textContent = '';
  
  // Add message after a brief delay to ensure announcement
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 50);
}

/**
 * Check if element is visible to screen readers
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Whether element is accessible to screen readers
 */
export function isAccessibleToScreenReaders(element) {
  if (!element) return false;
  
  // Check for common issues that make elements invisible to screen readers
  const style = window.getComputedStyle(element);
  
  // Check display and visibility
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }
  
  // Check aria-hidden
  if (element.getAttribute('aria-hidden') === 'true') {
    return false;
  }
  
  // Check zero dimensions
  if (element.offsetWidth === 0 && element.offsetHeight === 0) {
    return false;
  }
  
  // Check parent elements
  let parent = element.parentElement;
  while (parent) {
    if (parent.getAttribute('aria-hidden') === 'true' || 
        window.getComputedStyle(parent).display === 'none' ||
        window.getComputedStyle(parent).visibility === 'hidden') {
      return false;
    }
    parent = parent.parentElement;
  }
  
  return true;
}

/**
 * Checks if color combination meets WCAG contrast requirements
 * @param {string} foreground - Foreground color in hex
 * @param {string} background - Background color in hex
 * @param {string} level - WCAG level ('AA' or 'AAA')
 * @returns {boolean} Whether colors meet contrast requirements
 */
export function meetsContrastRequirements(foreground, background, level = 'AA') {
  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  // Calculate relative luminance
  const getLuminance = (rgb) => {
    const { r, g, b } = rgb;
    
    // Convert RGB to linear values
    const [rl, gl, bl] = [r, g, b].map(c => {
      const value = c / 255;
      return value <= 0.03928
        ? value / 12.92
        : Math.pow((value + 0.055) / 1.055, 2.4);
    });
    
    // Calculate luminance
    return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
  };
  
  // Parse colors
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);
  
  if (!fgRgb || !bgRgb) return false;
  
  // Calculate luminance
  const fgLuminance = getLuminance(fgRgb);
  const bgLuminance = getLuminance(bgRgb);
  
  // Calculate contrast ratio
  const contrastRatio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                        (Math.min(fgLuminance, bgLuminance) + 0.05);
  
  // Check against WCAG requirements
  if (level === 'AAA') {
    // AAA requires 7:1 for normal text, 4.5:1 for large text
    return contrastRatio >= 7;
  } else {
    // AA requires 4.5:1 for normal text, 3:1 for large text
    return contrastRatio >= 4.5;
  }
}

export default {
  createFocusTrap,
  announceToScreenReader,
  isAccessibleToScreenReaders,
  meetsContrastRequirements
};