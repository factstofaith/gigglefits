import React, { createContext, useState, useContext } from 'react';

export const WebhookContext = createContext({});

export function WebhookProvider({ children }) {
  return <WebhookContextProvider>{children}</WebhookContextProvider>;
}

export function WebhookContextProvider({ children }) {
  const [state, setState] = useState({});

  return (
    <WebhookContext.Provider value={{ state, setState }}>
      {children}
    </WebhookContext.Provider>
  );
}

export function useWebhook() {
  return useContext(WebhookContext);
}

export default WebhookContextProvider;
