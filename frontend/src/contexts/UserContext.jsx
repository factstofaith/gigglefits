import React, { createContext, useState, useContext } from 'react';

export const UserContext = createContext({});

export function UserProvider({ children }) {
  return <UserContextProvider>{children}</UserContextProvider>;
}

export function UserContextProvider({ children }) {
  const [state, setState] = useState({});

  return (
    <UserContext.Provider value={{ state, setState }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

export default UserContextProvider;
