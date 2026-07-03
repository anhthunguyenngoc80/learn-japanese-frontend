import type { JSX } from "react";
import * as pages from "../pages";
import { PATHS } from "../constant";

type RouteType = {
  key: string;
  name: string;
  path: string;
  element: JSX.Element;
};

const PUBLIC_ROUTER: RouteType[] = [
  {
    key: 'dashboard',
    name: "Dashboard",
    path: PATHS.dashboard,
    element: <pages.DashboardPage />
  },
]

const AUTH_ROUTER: RouteType[] = [
  {
    key: 'register',
    name: "Register",
    path: PATHS.register,
    element: <pages.RegisterPage />
  },
]

const PRIVATE_HEADER_ROUTER: RouteType[] = [

]

const PRIVATE_ROUTER: RouteType[] = [

]


export {
  PUBLIC_ROUTER,
  PRIVATE_HEADER_ROUTER,
  PRIVATE_ROUTER,
  AUTH_ROUTER
};
