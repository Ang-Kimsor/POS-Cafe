/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { getMe } from "../api/authApi";
import { getCookie } from "../utils/cookieHelper";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchUser = useCallback(async (backgroundVerify = false) => {
    if (backgroundVerify) setIsVerifying(true);
    try {
      const res = await getMe();
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
  }, []);

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
    
    // Listen for refetch events (e.g. from axios interceptor on 403 Forbidden)
    const handleRefetch = () => {
      fetchUser();
    };
    const handleLogoutEvent = () => {
      setUser(null);
    };
    
    window.addEventListener("auth:refetch", handleRefetch);
    window.addEventListener("auth:logout", handleLogoutEvent);

    return () => {
      window.removeEventListener("auth:refetch", handleRefetch);
      window.removeEventListener("auth:logout", handleLogoutEvent);
    };
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, isVerifying, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
