// src/components/PrivateRoute.tsx
import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserContext } from "@/context/UserContext";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, isLoading } = useUserContext();
  const location = useLocation();

  if (isLoading) {
    return <div>Загрузка...</div>; // можно заменить на ваш Loader компонент
  }

  if (!isAuthenticated) {
    // ❗ Сохраняем путь, чтобы вернуть пользователя обратно после логина
    localStorage.setItem("redirectAfterLogin", location.pathname);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
