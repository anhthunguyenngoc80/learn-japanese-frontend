import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store";

type PrivateRouteProps = {
  children: JSX.Element;
};

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth,
  );

  // Chưa initialize xong thì không render gì (tránh chớp hình redirect)
  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};