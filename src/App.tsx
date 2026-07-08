import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import * as router from "./router/router";

import "./App.css";
import { MainLayout, AuthLayout } from "./layout";
import { Modal } from "./components/Modal";
import { useAppDispatch, initializeAuth } from "./store";
import { setNavigate } from "./utils/navigate";
import { PrivateRoute } from "./router/PrivateRoute";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <AppRoutes />
      {/* Global Modal controlled by Redux */}
      <Modal />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return (
    <Routes>
      {/* Public routes */}
      {router.PUBLIC_ROUTER.map((route) => (
        <Route
          key={route.key}
          path={route.path}
          element={MainLayout({ children: route.element })}
        />
      ))}

      {/* Auth routes (login, register) */}
      {router.AUTH_ROUTER.map((route) => (
        <Route
          key={route.key}
          path={route.path}
          element={AuthLayout({ children: route.element })}
        />
      ))}

      {/* Private routes - yêu cầu đăng nhập */}
      {[...router.PRIVATE_HEADER_ROUTER, ...router.PRIVATE_ROUTER].map(
        (route) => {
          return (
            <Route
              key={route.key}
              path={route.path}
              element={
                <PrivateRoute>
                  <MainLayout>
                    {route.element}
                  </MainLayout>
                </PrivateRoute>
              }
            />
          );
        },
      )}
    </Routes>
  );
}

export default App;
