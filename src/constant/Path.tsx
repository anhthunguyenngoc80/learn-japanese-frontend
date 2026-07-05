export const PATHS = {
  dashboard: "/",
  register: "/register",
  login: "/login",
  collection: "/collection",
  topic: (topicId?: string) => `/collection/${topicId ?? ':topicId'}`,
}