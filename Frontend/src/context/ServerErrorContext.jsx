/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useCallback } from 'react';

const ServerErrorContext = createContext();

export const ServerErrorProvider = ({ children }) => {
  const [isServerError, setIsServerError] = useState(false);

  const triggerServerError = useCallback(() => {
    setIsServerError(true);
  }, []);

  const resetServerError = useCallback(() => {
    setIsServerError(false);
  }, []);

  return (
    <ServerErrorContext.Provider value={{ isServerError, triggerServerError, resetServerError }}>
      {children}
    </ServerErrorContext.Provider>
  );
};

export const useServerError = () => {
  const context = useContext(ServerErrorContext);
  if (!context) {
    throw new Error('useServerError must be used within a ServerErrorProvider');
  }
  return context;
};

// Global non-hook access for Axios
let globalTriggerServerError = () => {};
let isGlobalServerErrorActive = false;

export const setGlobalServerErrorHandler = (handler) => {
  globalTriggerServerError = () => {
    isGlobalServerErrorActive = true;
    handler();
  };
};

export const triggerGlobalServerError = () => globalTriggerServerError();
export const getIsGlobalServerErrorActive = () => isGlobalServerErrorActive;
