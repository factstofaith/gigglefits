import React, { createContext, useState, useContext } from 'react';

export const NotificationContext = createContext({});

export function NotificationProvider({ children }) {
  return <NotificationContextProvider {...arguments} />;
}

export function NotificationContextProvider({ children }) {
  const [state, setState] = useState({});

  return (
    <NotificationContext.Provider value={{ state, setState }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}

export default NotificationContextProvider;
