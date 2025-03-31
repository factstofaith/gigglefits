import React, { createContext, useState, useContext } from 'react';

export const SettingsContext = createContext({});

export function SettingsProvider({ children }) {
  return <SettingsContextProvider>{children}</SettingsContextProvider>;
}

export function SettingsContextProvider({ children }) {
  const [state, setState] = useState({});

  return (
    <SettingsContext.Provider value={{ state, setState }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

export default SettingsContextProvider;
