import React, { createContext, useState, useContext } from 'react';

export const EarningsContext = createContext({});

export function EarningsProvider({ children }) {
  return <EarningsContextProvider>{children}</EarningsContextProvider>;
}

export function EarningsContextProvider({ children }) {
  const [state, setState] = useState({});

  return (
    <EarningsContext.Provider value={{ state, setState }}>
      {children}
    </EarningsContext.Provider>
  );
}

export function useEarnings() {
  return useContext(EarningsContext);
}

export default EarningsContextProvider;
