
import React, { createContext, useState, useContext, useMemo } from 'react';

/**
 * @typedef {Object} keyboardshortcutsContextType
 * @property {Object} state - The context state
 * @property {Function} setState - Function to update context state
 */

/**
 * Context for keyboardshortcuts functionality
 * @type {React.Context<keyboardshortcutsContextType>}
 */
export const KeyboardShortcutsContext = createContext(null);

/**
 * Provider component for keyboardshortcuts context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function KeyboardShortcutsProvider({ children }) {
  return <KeyboardShortcutsContextProvider>{children}</KeyboardShortcutsContextProvider>;
}

/**
 * Implementation of the keyboardshortcuts context provider
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider implementation
 */
export function KeyboardShortcutsContextProvider({ children }) {
  const [state, setState] = useState({});
  
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ 
    state, 
    setState 
  }), [state]);
  
  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

/**
 * Custom hook for accessing keyboardshortcuts context
 * @returns {keyboardshortcutsContextType} The context value
 * @throws {Error} If used outside of a KeyboardShortcutsProvider
 */
export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);
  if (context === null) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  return context;
}

export default React.memo(KeyboardShortcutsContextProvider);
