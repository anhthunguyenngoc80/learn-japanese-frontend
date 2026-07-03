import { BrowserRouter, Route, Routes } from "react-router-dom";
import * as router from "./router/router";

import "./App.css";
import { MainLayout } from "./layout";

function App() {
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
    </BrowserRouter>
  );
}

export default App;
