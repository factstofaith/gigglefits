import React, { createContext, useState, useContext } from 'react';

export const IntegrationContext = createContext({});

export function IntegrationProvider({ children }) {
  return <IntegrationContextProvider>{children}</IntegrationContextProvider>;
}

export function IntegrationContextProvider({ children }) {
  const [state, setState] = useState({});

  return (
    <IntegrationContext.Provider value={{ state, setState }}>
      {children}
    </IntegrationContext.Provider>
  );
}

export function useIntegration() {
  return useContext(IntegrationContext);
}

export default IntegrationContextProvider;
