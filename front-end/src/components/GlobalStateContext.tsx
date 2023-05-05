// GlobalStateContext.tsx
import React, { createContext, useContext, useState } from 'react';

// Define the shape of the context value using a generic type parameter T
interface GlobalStateContextValue<T> {
  provider: T;
  setProvider: React.Dispatch<React.SetStateAction<T>>;
  setType: (newType: any) => void;
}

// Create the context with an initial value
const GlobalStateContext = createContext<GlobalStateContextValue<any> | null>(null);

// Define the context provider component using a generic type parameter T
export const GlobalStateProvider = ({ children, initialState }: { children: React.ReactNode; initialState: any }) => {
  // Use the useState hook to manage the global state
  const [provider, setProvider] = useState<any>(initialState);

  // Function to update the type of the global state
  const setType = (newType: any) => {
    setProvider(newType);
  };

  return (
    <GlobalStateContext.Provider value={{ provider, setProvider, setType }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Define a custom hook to access the global state
export const useGlobalState = <T,>(): GlobalStateContextValue<T> => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};
