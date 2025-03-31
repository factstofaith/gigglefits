/**
 * accessibilityUtils.js
 * -----------------------------------------------------------------------------
 * Utilities for enhancing accessibility throughout the application.
 * Provides functions for screen reader announcements, managing focus,
 * and creating accessible form controls.
 * 
 * @module utils/accessibilityUtils
 */

import { useEffect } from 'react';

/**
 * Announces a message to screen readers using an ARIA live region
 * Creates a visually hidden element with appropriate ARIA attributes
 * that screen readers will read aloud when its content changes.
 * 
 * @function
 * @param {string} message - The message to announce to screen readers
 * @param {boolean} [assertive=false] - If true, uses aria-live="assertive" for immediate 
 *                                     announcement, otherwise uses "polite" to wait for user idle
 * 
 * @example
 * // Polite announcement (doesn't interrupt screen reader)
 * announceToScreenReader('Your settings have been saved');
 * 
 * // Assertive announcement (interrupts current screen reader speech)
 * announceToScreenReader('Error! Connection lost', true);
 */
export function announceToScreenReader(message, assertive = false) {
  // Added display name
  announceToScreenReader.displayName = 'announceToScreenReader';

  if (!message) return;

  // Try to find an existing announcer element or create one if it doesn't exist
  let announcer = document.getElementById('sr-announcer');
  
  if (!announcer) {
    // Create a screen reader announcer if it doesn't exist
    announcer = document.createElement('div');
    announcer.id = 'sr-announcer';
    announcer.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.setAttribute('role', 'status');
    // Hide visually but keep it accessible to screen readers
    announcer.style.position = 'absolute';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.padding = '0';
    announcer.style.margin = '-1px';
    announcer.style.overflow = 'hidden';
    announcer.style.clip = 'rect(0, 0, 0, 0)';
    announcer.style.whiteSpace = 'nowrap';
    announcer.style.border = '0';
    document.body.appendChild(announcer);
  }

  // Set the appropriate aria-live attribute
  announcer.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
  
  // Clear the announcer before adding new content (prevents multiple readings)
  announcer.textContent = '';
  
  // Use setTimeout to ensure the update is read after the announcer is cleared
  setTimeout(() => {
    announcer.textContent = message;
  }, 50);
}

/**
 * Generates accessibility props for form controls
 * Creates a set of properly associated ARIA attributes and IDs for 
 * form controls, labels, error messages, and helper text.
 * 
 * @function
 * @param {Object} options - Form control configuration options
 * @param {string} options.id - Unique ID for the form control
 * @param {string} options.label - The label text (for reference only, not used in props)
 * @param {boolean|string} [options.error] - Error message or boolean indicating error state
 * @param {string} [options.helperText] - Helper text to describe the input
 * @param {boolean} [options.required=false] - Whether the field is required
 * @param {boolean} [options.disabled=false] - Whether the field is disabled
 * @returns {Object} Object containing props for the input, label, error, and helper elements
 * @property {Object} inputProps - Props for the input element
 * @property {Object} labelProps - Props for the label element
 * @property {Object} errorProps - Props for the error message element
 * @property {Object} helperProps - Props for the helper text element
 * 
 * @example
 * const { inputProps, labelProps, errorProps, helperProps } = getFormControlProps({
 *   id: 'email-input',
 *   label: 'Email Address',
 *   error: emailError,
 *   helperText: 'Enter your work email',
 *   required: true
 * });
 * 
 * // Usage in JSX:
 * <label {...labelProps}>Email Address</label>
 * <input type="email" {...inputProps} />
 * {helperText && <span {...helperProps}>{helperText}</span>}
 * {error && <span {...errorProps}>{error}</span>}
 */
export function getFormControlProps({ 
  id, 
  label, 
  error, 
  helperText, 
  required = false, 
  disabled = false 
}) {
  // Added display name
  getFormControlProps.displayName = 'getFormControlProps';

  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return {
    // Input props
    inputProps: {
      id,
      'aria-invalid': !!error,
      'aria-describedby': describedBy,
      'aria-required': required,
      'aria-disabled': disabled,
      required,
      disabled,
    },
    // Label props
    labelProps: {
      htmlFor: id,
      id: `${id}-label`,
    },
    // Error message props
    errorProps: error
      ? {
          id: errorId,
          role: 'alert',
        }
      : {},
    // Helper text props
    helperProps: helperText
      ? {
          id: helperId,
        }
      : {},
  };
}

/**
 * Traps focus within a specified element
 * Useful for modals, dialogs, and other elements that should
 * capture and contain keyboard focus.
 * 
 * @function
 * @param {HTMLElement} element - The element to trap focus within
 * @returns {Function} Function to remove the focus trap
 * 
 * @example
 * // Set up focus trap on a modal dialog
 * const modal = document.getElementById('modal-dialog');
 * const removeTrap = trapFocus(modal);
 * 
 * // Later, when closing the modal:
 * removeTrap();
 */
export function trapFocus(element) {
  // Added display name
  trapFocus.displayName = 'trapFocus';

  if (!element) return () => {};

  // Find all focusable elements
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  // Function to handle keydown events
  const handleKeyDown = (e) => {
  // Added display name
  handleKeyDown.displayName = 'handleKeyDown';

  // Added display name
  handleKeyDown.displayName = 'handleKeyDown';

  // Added display name
  handleKeyDown.displayName = 'handleKeyDown';

  // Added display name
  handleKeyDown.displayName = 'handleKeyDown';

  // Added display name
  handleKeyDown.displayName = 'handleKeyDown';


    if (e.key === 'Tab') {
      // If shift+tab on first element, move to last element
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } 
      // If tab on last element, move to first element
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  // Focus the first focusable element
  if (firstElement) {
    firstElement.focus();
  }

  // Add event listener
  element.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Creates an accessible dialog with proper ARIA roles and focus management
 * 
 * @function
 * @param {HTMLElement} dialogElement - The dialog element
 * @param {HTMLElement} [triggerElement] - Element that triggered the dialog
 * @returns {Object} Dialog controller with open, close, and destroy methods
 * 
 * @example
 * const dialog = document.getElementById('my-dialog');
 * const trigger = document.getElementById('open-dialog-btn');
 * 
 * const dialogController = createAccessibleDialog(dialog, trigger);
 * 
 * // Open dialog
 * dialogController.open();
 * 
 * // Close dialog
 * dialogController.close();
 * 
 * // Cleanup when no longer needed
 * dialogController.destroy();
 */
export function createAccessibleDialog(dialogElement, triggerElement) {
  // Added display name
  createAccessibleDialog.displayName = 'createAccessibleDialog';

  if (!dialogElement) return null;

  // Store the previously focused element to restore focus when dialog closes
  let previouslyFocused = null;
  let focusTrap = null;

  // Set proper ARIA attributes if not already set
  if (!dialogElement.getAttribute('role')) {
    dialogElement.setAttribute('role', 'dialog');
  }
  
  if (!dialogElement.getAttribute('aria-modal')) {
    dialogElement.setAttribute('aria-modal', 'true');
  }

  // Dialog controller object
  const controller = {
    /**
     * Open the dialog and trap focus inside
     */
    open() {
      // Save the currently focused element
      previouslyFocused = document.activeElement;
      
      // Make dialog visible - assuming the CSS is already set up
      dialogElement.style.display = 'block';
      
      // Trap focus inside the dialog
      focusTrap = trapFocus(dialogElement);
      
      // Announce dialog to screen readers
      const dialogTitle = dialogElement.getAttribute('aria-labelledby');
      if (dialogTitle) {
        const titleElement = document.getElementById(dialogTitle);
        if (titleElement) {
          announceToScreenReader(`Dialog opened: ${titleElement.textContent}`, true);
        }
      }
    },
    
    /**
     * Close the dialog and restore focus
     */
    close() {
      // Hide dialog
      dialogElement.style.display = 'none';
      
      // Remove focus trap
      if (focusTrap) {
        focusTrap();
        focusTrap = null;
      }
      
      // Restore focus to the element that opened the dialog
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      } else if (triggerElement && triggerElement.focus) {
        triggerElement.focus();
      }
      
      // Announce dialog closed to screen readers
      announceToScreenReader('Dialog closed');
    },
    
    /**
     * Clean up all event listeners and references
     */
    destroy() {
      // Remove focus trap if it exists
      if (focusTrap) {
        focusTrap();
        focusTrap = null;
      }
      
      // Clean up references
      previouslyFocused = null;
    }
  };
  
  return controller;
}

/**
 * Creates a visually hidden element that is still accessible to screen readers
 * Useful for providing additional context to screen reader users
 * 
 * @function
 * @param {string} text - The text content for screen readers
 * @returns {HTMLElement} A span element that is visually hidden but screen reader accessible
 * 
 * @example
 * // Create a visually hidden label
 * const srLabel = createScreenReaderOnly('Sort by date');
 * sortButton.appendChild(srLabel);
 */
export function createScreenReaderOnly(text) {
  // Added display name
  createScreenReaderOnly.displayName = 'createScreenReaderOnly';

  const element = document.createElement('span');
  element.className = 'sr-only';
  element.style.position = 'absolute';
  element.style.width = '1px';
  element.style.height = '1px';
  element.style.padding = '0';
  element.style.margin = '-1px';
  element.style.overflow = 'hidden';
  element.style.clip = 'rect(0, 0, 0, 0)';
  element.style.whiteSpace = 'nowrap';
  element.style.border = '0';
  element.textContent = text;
  
  return element;
}

/**
 * Checks if an element or any of its parent elements has a particular role
 * 
 * @function
 * @param {HTMLElement} element - Element to check
 * @param {string} role - ARIA role to look for
 * @returns {boolean} True if the element or any parent has the specified role
 * 
 * @example
 * // Check if an element is inside a dialog
 * if (hasRole(element, 'dialog')) {
 *   // Element is inside a dialog
 * }
 */
export function hasRole(element, role) {
  // Added display name
  hasRole.displayName = 'hasRole';

  if (!element || !role) return false;
  
  let current = element;
  
  while (current) {
    if (current.getAttribute && current.getAttribute('role') === role) {
      return true;
    }
    current = current.parentElement;
  }
  
  return false;
}

/**
 * Returns ARIA attributes based on the provided options
 * 
 * @param {Object} options - ARIA attribute options
 * @param {boolean} [options.isRequired] - Whether the element is required
 * @param {boolean} [options.isInvalid] - Whether the element is invalid
 * @param {boolean} [options.isDisabled] - Whether the element is disabled
 * @param {boolean} [options.isPressed] - Whether the element is pressed
 * @param {boolean} [options.isExpanded] - Whether the element is expanded
 * @param {boolean} [options.hasPopup] - Whether the element has a popup
 * @param {string} [options.controls] - ID of the element this element controls
 * @param {string} [options.describedBy] - ID of the element that describes this element
 * @param {string} [options.label] - Accessible label for the element
 * @param {string} [options.role] - ARIA role for the element
 * @returns {Object} ARIA attributes object
 */
export function getAriaAttributes({
  isRequired,
  isInvalid,
  isDisabled,
  isPressed,
  isExpanded,
  hasPopup,
  controls,
  describedBy,
  label,
  role,
}) {
  // Added display name
  getAriaAttributes.displayName = 'getAriaAttributes';

  const attrs = {};

  // Add attributes only if they are defined
  if (isRequired !== undefined) attrs['aria-required'] = isRequired;
  if (isInvalid !== undefined) attrs['aria-invalid'] = isInvalid;
  if (isDisabled !== undefined) attrs['aria-disabled'] = isDisabled;
  if (isPressed !== undefined) attrs['aria-pressed'] = isPressed;
  if (isExpanded !== undefined) attrs['aria-expanded'] = isExpanded;
  if (hasPopup !== undefined) attrs['aria-haspopup'] = hasPopup;
  if (controls) attrs['aria-controls'] = controls;
  if (describedBy) attrs['aria-describedby'] = describedBy;
  if (label) attrs['aria-label'] = label;
  if (role) attrs.role = role;

  return attrs;
}

/**
 * Returns keyboard event handlers for accessible interactions
 * 
 * @param {Object} options - Keyboard handler options
 * @param {Function} [options.onEnter] - Handler for Enter key
 * @param {Function} [options.onSpace] - Handler for Space key
 * @param {Function} [options.onEscape] - Handler for Escape key
 * @param {Function} [options.onArrowUp] - Handler for Arrow Up key
 * @param {Function} [options.onArrowDown] - Handler for Arrow Down key
 * @param {Function} [options.onArrowLeft] - Handler for Arrow Left key
 * @param {Function} [options.onArrowRight] - Handler for Arrow Right key
 * @param {Function} [options.onTab] - Handler for Tab key
 * @param {string[]} [options.preventDefaultKeys] - Keys to prevent default behavior on
 * @returns {Object} Keyboard event handlers
 */
export function getKeyboardHandlers({
  onEnter,
  onSpace,
  onEscape,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onTab,
  preventDefaultKeys = [],
}) {
  // Added display name
  getKeyboardHandlers.displayName = 'getKeyboardHandlers';

  return {
    onKeyDown: (event) => {
      // Check if we should prevent default for this key
      if (preventDefaultKeys.includes(event.key)) {
        event.preventDefault();
      }

      // Call the appropriate handler based on the key
      switch (event.key) {
        case 'Enter':
          if (onEnter) onEnter(event);
          break;
        case ' ':
          if (onSpace) onSpace(event);
          break;
        case 'Escape':
          if (onEscape) onEscape(event);
          break;
        case 'ArrowUp':
          if (onArrowUp) onArrowUp(event);
          break;
        case 'ArrowDown':
          if (onArrowDown) onArrowDown(event);
          break;
        case 'ArrowLeft':
          if (onArrowLeft) onArrowLeft(event);
          break;
        case 'ArrowRight':
          if (onArrowRight) onArrowRight(event);
          break;
        case 'Tab':
          if (onTab) onTab(event);
          break;
        default:
          break;
      }
    },
  };
}

/**
 * Calculate contrast ratio and accessibility information for a color
 * 
 * @param {string} backgroundColor - Background color in hex format (#RRGGBB)
 * @returns {Object} Contrast information object
 */
export function getContrastInfo(backgroundColor) {
  // Added display name
  getContrastInfo.displayName = 'getContrastInfo';

  // Convert hex to RGB
  const hexToRgb = (hex) => {
  // Added display name
  hexToRgb.displayName = 'hexToRgb';

  // Added display name
  hexToRgb.displayName = 'hexToRgb';

  // Added display name
  hexToRgb.displayName = 'hexToRgb';

  // Added display name
  hexToRgb.displayName = 'hexToRgb';

  // Added display name
  hexToRgb.displayName = 'hexToRgb';


    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // Calculate relative luminance
  const getLuminance = (rgb) => {
  // Added display name
  getLuminance.displayName = 'getLuminance';

  // Added display name
  getLuminance.displayName = 'getLuminance';

  // Added display name
  getLuminance.displayName = 'getLuminance';

  // Added display name
  getLuminance.displayName = 'getLuminance';

  // Added display name
  getLuminance.displayName = 'getLuminance';


    const { r, g, b } = rgb;
    const [rSRGB, gSRGB, bSRGB] = [r / 255, g / 255, b / 255];
    
    const [rLin, gLin, bLin] = [
      rSRGB <= 0.03928 ? rSRGB / 12.92 : Math.pow((rSRGB + 0.055) / 1.055, 2.4),
      gSRGB <= 0.03928 ? gSRGB / 12.92 : Math.pow((gSRGB + 0.055) / 1.055, 2.4),
      bSRGB <= 0.03928 ? bSRGB / 12.92 : Math.pow((bSRGB + 0.055) / 1.055, 2.4),
    ];
    
    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  };

  // Calculate contrast ratio
  const getContrastRatio = (lum1, lum2) => {
  // Added display name
  getContrastRatio.displayName = 'getContrastRatio';

  // Added display name
  getContrastRatio.displayName = 'getContrastRatio';

  // Added display name
  getContrastRatio.displayName = 'getContrastRatio';

  // Added display name
  getContrastRatio.displayName = 'getContrastRatio';

  // Added display name
  getContrastRatio.displayName = 'getContrastRatio';


    const lighterLum = Math.max(lum1, lum2);
    const darkerLum = Math.min(lum1, lum2);
    return (lighterLum + 0.05) / (darkerLum + 0.05);
  };

  // Get RGB values
  const bgRgb = hexToRgb(backgroundColor) || { r: 0, g: 0, b: 0 };
  const whiteRgb = { r: 255, g: 255, b: 255 };
  const blackRgb = { r: 0, g: 0, b: 0 };
  
  // Calculate luminance
  const bgLuminance = getLuminance(bgRgb);
  const whiteLuminance = getLuminance(whiteRgb);
  const blackLuminance = getLuminance(blackRgb);
  
  // Calculate contrast ratios
  const whiteContrast = getContrastRatio(bgLuminance, whiteLuminance);
  const blackContrast = getContrastRatio(bgLuminance, blackLuminance);
  
  // Determine if it passes accessibility standards
  // WCAG 2.0 AA requires a contrast ratio of at least 4.5:1 for normal text
  const whitePassesAA = whiteContrast >= 4.5;
  const blackPassesAA = blackContrast >= 4.5;
  
  // Determine the best text color for this background
  const suggestedTextColor = whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
  
  return {
    whiteContrast,
    blackContrast,
    whitePassesAA,
    blackPassesAA,
    suggestedTextColor,
  };
}

/**
 * React hook that sets up keyboard shortcut to focus the main content area
 * Implements the "Skip to content" pattern for keyboard users to bypass navigation
 * 
 * @function
 * @param {string} [mainContentId='main-content'] - ID of the main content area
 * @returns {void}
 * 
 * @example
 * // In your main App component:
 * function App() {
  // Added display name
  App.displayName = 'App';

 *   useSkipNav('main-content');
 *   return (
 *     <>
 *       <a href="#main-content" className="skip-nav">Skip to main content</a>
 *       <header>...</header>
 *       <main id="main-content" tabIndex="-1">...</main>
 *     </>
 *   );
 * }
 */
export function useSkipNav(mainContentId = 'main-content') {
  // Added display name
  useSkipNav.displayName = 'useSkipNav';

  const { useEffect } = require('react');
  
  useEffect(() => {
    // Function to focus the main content when activated
    const handleSkipNavigation = () => {
  // Added display name
  handleSkipNavigation.displayName = 'handleSkipNavigation';

  // Added display name
  handleSkipNavigation.displayName = 'handleSkipNavigation';

  // Added display name
  handleSkipNavigation.displayName = 'handleSkipNavigation';

  // Added display name
  handleSkipNavigation.displayName = 'handleSkipNavigation';

  // Added display name
  handleSkipNavigation.displayName = 'handleSkipNavigation';


      // Check for the hash in the URL
      if (window.location.hash === `#${mainContentId}`) {
        // Find the main content element
        const mainContent = document.getElementById(mainContentId);
        if (mainContent) {
          // Set focus to the main content
          mainContent.focus();
          
          // Announce to screen readers (optional)
          announceToScreenReader('Skipped to main content');
        }
      }
    };

    // Listen for hashchange events
    window.addEventListener('hashchange', handleSkipNavigation);
    
    // Check if the page loaded with the hash already
    if (window.location.hash === `#${mainContentId}`) {
      // Use a small timeout to ensure DOM is ready
      setTimeout(handleSkipNavigation, 100);
    }

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('hashchange', handleSkipNavigation);
    };
  }, [mainContentId]);
}