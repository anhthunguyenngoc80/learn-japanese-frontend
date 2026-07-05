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
    key: "dashboard",
    name: "Dashboard",
    path: PATHS.dashboard,
    element: <pages.DashboardPage />,
  },
];

const AUTH_ROUTER: RouteType[] = [
  {
    key: "register",
    name: "Register",
    path: PATHS.register,
    element: <pages.RegisterPage />,
  },
  {
    key: "login",
    name: "Login",
    path: PATHS.login,
    element: <pages.LoginPage />,
  },
];

const PRIVATE_HEADER_ROUTER: RouteType[] = [];

const PRIVATE_ROUTER: RouteType[] = [
  {
    key: "collection",
    name: "Collection",
    path: PATHS.collection,
    element: <pages.Collection />,
  },
  {
    key: "createCollection",
    name: "Create Collection",
    path: PATHS.createCollection,
    element: <pages.CreateCollection />,
  },
  {
    key: "topic",
    name: "Topic",
    path: PATHS.topic(),
    element: <pages.Topic />,
  },
];

export { PUBLIC_ROUTER, PRIVATE_HEADER_ROUTER, PRIVATE_ROUTER, AUTH_ROUTER };
