import React, { createContext, useState, useContext } from 'react';

export const KeyboardShortcutsContext = createContext({});

export function KeyboardShortcutsProvider({ children }) {
  return <KeyboardShortcutsContextProvider>{children}</KeyboardShortcutsContextProvider>;
}

export function KeyboardShortcutsContextProvider({ children }) {
  const [state, setState] = useState({});

  return (
    <KeyboardShortcutsContext.Provider value={{ state, setState }}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

export function useKeyboardShortcuts() {
  return useContext(KeyboardShortcutsContext);
}

export default KeyboardShortcutsContextProvider;
