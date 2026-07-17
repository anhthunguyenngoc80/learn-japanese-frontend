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
    key: "collection list",
    name: "Collection list",
    path: PATHS.collections,
    element: <pages.CollectionList />,
  },
  {
    key: "createCollection",
    name: "Create Collection",
    path: PATHS.createCollection,
    element: <pages.CreateCollection />,
  },
  {
    key: "collection",
    name: "Collection",
    path: PATHS.collection(),
    element: <pages.Collection />,
  },
  {
    key: "flashcardLearn",
    name: "Flashcard Learn",
    path: PATHS.flashcardLearn(),
    element: <pages.FlashcardLearnPage />,
  },
  {
    key: "practiceWrite",
    name: "Practice Write",
    path: PATHS.practiceWrite(),
    element: <pages.PracticeWritePage />,
  },
  {
    key: "practicePaper",
    name: "Practice Paper",
    path: PATHS.practicePaper(),
    element: <pages.PracticePaperPage />,
  },
  {
    key: "practiceQuiz",
    name: "Practice Quiz",
    path: PATHS.practiceQuiz(),
    element: <pages.PracticeQuizPage />,
  },
    {
    key: "topic",
    name: "topic",
    path: PATHS.topic(),
    element: <pages.Topic />,
  },
  {
    key: "roadmap",
    name: "Roadmap",
    path: PATHS.roadmap(),
    element: <pages.LearningRoadmap />
  }
];

export { PUBLIC_ROUTER, PRIVATE_HEADER_ROUTER, PRIVATE_ROUTER, AUTH_ROUTER };
