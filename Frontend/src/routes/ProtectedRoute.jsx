import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getCookie, removeCookie } from "../utils/cookieHelper";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const ProtectedRoute = ({ role, allowedRoles }) => {
  const token = getCookie("token");
  const { user, isLoading, fetchUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Re-verify the user's role with the backend on every route change
    const verifyUser = async () => {
      if (token) {
        await fetchUser(true);
      }
    };
    verifyUser();
  }, [location.pathname, fetchUser, token]);

  if (!token) {
    removeCookie("token");
    removeCookie("user");
    removeCookie("role");
    localStorage.clear();
    return <Navigate to={"/login"} replace />;
  }

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to={"/login"} replace />;
  }

  const userRole = user.role;

  if (allowedRoles) {
    if (!allowedRoles.includes(userRole)) return <Navigate to={"/login"} replace />;
  } else if (role) {
    if (role === "admin" && (userRole === "admin" || userRole === "superadmin")) {
      // Allowed
    } else if (role !== userRole) {
      return <Navigate to={"/login"} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
