import React, { createContext, useState, useContext } from 'react';

export const BreadcrumbContext = createContext({});

export function BreadcrumbProvider({ children }) {
  return <BreadcrumbContextProvider>{children}</BreadcrumbContextProvider>;
}

export function BreadcrumbContextProvider({ children }) {
  const [state, setState] = useState({});

  return (
    <BreadcrumbContext.Provider value={{ state, setState }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  return useContext(BreadcrumbContext);
}

export default BreadcrumbContextProvider;
