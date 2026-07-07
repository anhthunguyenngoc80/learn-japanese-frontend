import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import * as router from "./router/router";

import "./App.css";
import { MainLayout, AuthLayout } from "./layout";
import { Modal } from "./components/Modal";
import { useAppDispatch, initializeAuth } from "./store";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes with shared AuthLayout */}
        {router.PUBLIC_ROUTER.map((route) => (
          <Route
            key={route.key}
            path={route.path}
            element={MainLayout({ children: route.element })}
          />
        ))}
        {router.AUTH_ROUTER.map((route) => (
          <Route
            key={route.key}
            path={route.path}
            element={AuthLayout({ children: route.element })}
          />
        ))}

        {/* Routes wrapped in MainLayout */}
        {[...router.PRIVATE_HEADER_ROUTER, ...router.PRIVATE_ROUTER].map(
          (route) => {
            return (
              <Route
                key={route.key}
                path={route.path}
                element={MainLayout({ children: route.element })}
              />
            );
          },
        )}
      </Routes>
      
      {/* Global Modal controlled by Redux */}
      <Modal />
    </BrowserRouter>
  );
}

export default App;
