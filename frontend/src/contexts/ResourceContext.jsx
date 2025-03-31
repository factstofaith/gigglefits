import React, { createContext, useState, useContext } from 'react';

export const ResourceContext = createContext({});

export function ResourceProvider({ children }) {
  return <ResourceContextProvider>{children}</ResourceContextProvider>;
}

export function ResourceContextProvider({ children }) {
  const [state, setState] = useState({});

  return (
    <ResourceContext.Provider value={{ state, setState }}>
      {children}
    </ResourceContext.Provider>
  );
}

export function useResource() {
  return useContext(ResourceContext);
}

export default ResourceContextProvider;
