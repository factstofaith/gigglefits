import React, { createContext, useState, useContext } from 'react';

export const ConfigContext = createContext({});

export function ConfigContextProvider({ children }) {
  const [state, setState] = useState({});

  return (
    <ConfigContext.Provider value={{ state, setState }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}

export default ConfigContextProvider;
