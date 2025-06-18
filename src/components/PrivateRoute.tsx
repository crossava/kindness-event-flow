// src/components/PrivateRoute.tsx
import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserContext } from "@/context/UserContext";

interface PrivateRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const { isAuthenticated, isLoading, currentUser } = useUserContext();
  const location = useLocation();

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!isAuthenticated) {
    localStorage.setItem("redirectAfterLogin", location.pathname);
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
