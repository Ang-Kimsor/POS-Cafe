/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useCallback } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);

  const showLoading = useCallback(() => {
    setLoadingCount(prev => prev + 1);
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingCount(prev => Math.max(0, prev - 1));
  }, []);

  const forceHideLoading = useCallback(() => {
    setLoadingCount(0);
  }, []);

  const isLoading = loadingCount > 0;

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading, forceHideLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Global non-hook access for Axios
let globalShowLoading = () => {};
let globalHideLoading = () => {};
let globalForceHideLoading = () => {};

export const setGlobalLoadingHandlers = (show, hide, forceHide) => {
  globalShowLoading = show;
  globalHideLoading = hide;
  globalForceHideLoading = forceHide;
};

export const triggerGlobalShow = () => globalShowLoading();
export const triggerGlobalHide = () => globalHideLoading();
export const triggerGlobalForceHide = () => globalForceHideLoading();
