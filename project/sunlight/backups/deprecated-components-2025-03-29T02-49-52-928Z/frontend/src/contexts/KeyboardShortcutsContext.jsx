/**
 * @context KeyboardShortcutsContext
 * @description Context provider for managing keyboard shortcuts throughout the application.
 * Allows components to register and handle keyboard shortcuts with proper focus management.
 *
 * @example
 * // In a parent component
 * <KeyboardShortcutsProvider>
 *   <YourComponent />
 * </KeyboardShortcutsProvider>
 *
 * // In a child component
 * const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
 *
 * useEffect(() => {
 *   const shortcutId = registerShortcut({
 *     key: 's',
 *     ctrlKey: true,
 *     description: 'Save changes',
 *     handler: handleSave
 *   });
 *
 *   return () => unregisterShortcut(shortcutId);
 * }, []);
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

// Create context
const KeyboardShortcutsContext = createContext();

/**
 * Generate a unique ID for shortcuts
 *
 * @returns {string} Unique ID
 */
const generateId = () => Math.random().toString(36).substring(2, 9);

/**
 * Default keyboard service implementation
 */
const defaultKeyboardService = {
  /**
   * Adds a global event listener
   * 
   * @param {string} eventType - Event type to listen for
   * @param {Function} handler - Event handler function
   */
  addEventListener: (eventType, handler) => {
    document.addEventListener(eventType, handler);
  },
  
  /**
   * Removes a global event listener
   * 
   * @param {string} eventType - Event type to stop listening for
   * @param {Function} handler - Event handler function to remove
   */
  removeEventListener: (eventType, handler) => {
    document.removeEventListener(eventType, handler);
  },
  
  /**
   * Gets the currently active element in the document
   * 
   * @returns {Element} The active element
   */
  getActiveElement: () => document.activeElement,
  
  /**
   * Generates a unique ID for a shortcut
   * 
   * @returns {string} Unique ID
   */
  generateId
};

/**
 * Provider component for keyboard shortcuts context
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {boolean} [props.enabled=true] - Whether keyboard shortcuts are enabled
 * @param {Object} [props.keyboardService=defaultKeyboardService] - Service for keyboard operations
 * @returns {React.ReactElement} - Rendered component
 */
export const KeyboardShortcutsProvider = ({ 
  children, 
  enabled = true,
  keyboardService = defaultKeyboardService 
}) => {
  // Added display name
  KeyboardShortcutsProvider.displayName = 'KeyboardShortcutsProvider';

  // Added display name
  KeyboardShortcutsProvider.displayName = 'KeyboardShortcutsProvider';

  // Added display name
  KeyboardShortcutsProvider.displayName = 'KeyboardShortcutsProvider';

  // Added display name
  KeyboardShortcutsProvider.displayName = 'KeyboardShortcutsProvider';

  // Added display name
  KeyboardShortcutsProvider.displayName = 'KeyboardShortcutsProvider';


  // State to store registered shortcuts
  const [shortcuts, setShortcuts] = useState({});

  // State to track whether shortcuts are enabled
  const [shortcutsEnabled, setShortcutsEnabled] = useState(enabled);

  /**
   * Register a new keyboard shortcut
   *
   * @param {Object} shortcut - Shortcut configuration
   * @param {string} shortcut.key - Key to trigger the shortcut (a-z, 0-9)
   * @param {boolean} [shortcut.ctrlKey=false] - Whether Ctrl key is required
   * @param {boolean} [shortcut.altKey=false] - Whether Alt key is required
   * @param {boolean} [shortcut.shiftKey=false] - Whether Shift key is required
   * @param {boolean} [shortcut.metaKey=false] - Whether Meta key is required
   * @param {string} shortcut.description - Description of what the shortcut does
   * @param {Function} shortcut.handler - Function to call when shortcut is triggered
   * @param {boolean} [shortcut.global=false] - Whether shortcut works globally (even in input fields)
   * @returns {string} - ID of the registered shortcut (used for unregistering)
   */
  const registerShortcut = useCallback(shortcut => {
  // Added display name
  registerShortcut.displayName = 'registerShortcut';

    if (!shortcut || !shortcut.key) {
      console.error('Invalid shortcut configuration');
      return null;
    }
    
    const id = keyboardService.generateId();

    setShortcuts(prev => ({
      ...(prev || {}),
      [id]: {
        ...shortcut,
        id,
      },
    }));

    return id;
  }, [keyboardService]);

  /**
   * Unregister a keyboard shortcut
   *
   * @param {string} id - ID of the shortcut to unregister
   */
  const unregisterShortcut = useCallback(id => {
  // Added display name
  unregisterShortcut.displayName = 'unregisterShortcut';

    if (!id) {
      console.error('No shortcut ID provided for unregistration');
      return;
    }
    
    setShortcuts(prev => {
      if (!prev || !prev[id]) return prev;
      
      const newShortcuts = { ...prev };
      delete newShortcuts[id];
      return newShortcuts;
    });
  }, []);

  /**
   * Toggle whether keyboard shortcuts are enabled
   *
   * @param {boolean} [value] - If provided, set to this value; otherwise toggle
   */
  const toggleShortcuts = useCallback(value => {
  // Added display name
  toggleShortcuts.displayName = 'toggleShortcuts';

    setShortcutsEnabled(prev => (value !== undefined ? value : !prev));
  }, []);

  /**
   * Get array of all registered shortcuts for display
   *
   * @returns {Array} - Array of all shortcuts
   */
  const getRegisteredShortcuts = useCallback(() => {
  // Added display name
  getRegisteredShortcuts.displayName = 'getRegisteredShortcuts';

    return shortcuts ? Object.values(shortcuts) : [];
  }, [shortcuts]);

  /**
   * Handle keydown events
   */
  const handleKeyDown = useCallback(
    e => {
  // Added display name
  handleKeyDown.displayName = 'handleKeyDown';

      // Skip if shortcuts are disabled
      if (!shortcutsEnabled) return;

      try {
        // Skip if focus is in an input field and the shortcut is not global
        const activeElement = keyboardService.getActiveElement();
        const isInputField = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable
        );

        // Convert key to lowercase for case-insensitive matching
        const key = e?.key?.toLowerCase();
        if (!key) return;

        // Check each shortcut
        Object.values(shortcuts || {}).forEach(shortcut => {
          if (!shortcut || !shortcut.key || !shortcut.handler) return;
          
          // Skip non-global shortcuts when in input fields
          if (isInputField && !shortcut.global) return;

          // Check if the shortcut matches
          if (
            key === shortcut.key.toLowerCase() &&
            e.ctrlKey === !!shortcut.ctrlKey &&
            e.altKey === !!shortcut.altKey &&
            e.shiftKey === !!shortcut.shiftKey &&
            e.metaKey === !!shortcut.metaKey
          ) {
            // Prevent default browser behavior
            e.preventDefault();

            // Call the shortcut handler
            try {
              shortcut.handler(e);
            } catch (error) {
              console.error('Error in keyboard shortcut handler:', error);
            }
          }
        });
      } catch (error) {
        console.error('Error handling keyboard shortcut:', error);
      }
    },
    [shortcuts, shortcutsEnabled, keyboardService]
  );

  // Add global event listener
  useEffect(() => {
    try {
      keyboardService.addEventListener('keydown', handleKeyDown);

      return () => {
        keyboardService.removeEventListener('keydown', handleKeyDown);
      };
    } catch (error) {
      console.error('Error setting up keyboard event listeners:', error);
      return () => {}; // Empty cleanup function
    }
  }, [handleKeyDown, keyboardService]);

  // Create a formatted help text of all shortcuts (for help dialog)
  const shortcutsHelpText = useMemo(() => {
  // Added display name
  shortcutsHelpText.displayName = 'shortcutsHelpText';

    if (!shortcuts) return [];
    
    return Object.values(shortcuts).map(shortcut => {
      if (!shortcut || !shortcut.key) return null;
      
      const modifiers = [];
      if (shortcut.ctrlKey) modifiers.push('Ctrl');
      if (shortcut.altKey) modifiers.push('Alt');
      if (shortcut.shiftKey) modifiers.push('Shift');
      if (shortcut.metaKey) modifiers.push('Meta');

      const keyCombo = [...modifiers, shortcut.key.toUpperCase()].join(' + ');

      return {
        combo: keyCombo,
        description: shortcut.description || 'Unknown action',
        global: !!shortcut.global,
      };
    }).filter(Boolean); // Remove any null entries
  }, [shortcuts]);

  // Value object for context
  const value = {
    registerShortcut,
    unregisterShortcut,
    toggleShortcuts,
    shortcutsEnabled,
    getRegisteredShortcuts,
    shortcutsHelpText,
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>{children}</KeyboardShortcutsContext.Provider>
  );
};

KeyboardShortcutsProvider.propTypes = {
  children: PropTypes.node.isRequired,
  enabled: PropTypes.bool,
  keyboardService: PropTypes.shape({
    addEventListener: PropTypes.func,
    removeEventListener: PropTypes.func,
    getActiveElement: PropTypes.func,
    generateId: PropTypes.func
  })
};

/**
 * Custom hook to use keyboard shortcuts context
 *
 * @returns {Object} - Keyboard shortcuts context
 */
export const useKeyboardShortcuts = () => {
  // Added display name
  useKeyboardShortcuts.displayName = 'useKeyboardShortcuts';

  // Added display name
  useKeyboardShortcuts.displayName = 'useKeyboardShortcuts';

  // Added display name
  useKeyboardShortcuts.displayName = 'useKeyboardShortcuts';

  // Added display name
  useKeyboardShortcuts.displayName = 'useKeyboardShortcuts';

  // Added display name
  useKeyboardShortcuts.displayName = 'useKeyboardShortcuts';


  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  return context;
};

export default KeyboardShortcutsContext;
