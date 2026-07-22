export const PATHS = {
  dashboard: "/",
  register: "/register",
  login: "/login",
  collections: "/collections",
  createCollection: "/collections/create",
  createListeningCollection: "/collections/create-listening",
  collection: (collectionId?: string) =>
    `/collections/${collectionId ?? ":collectionId"}`,
  editCollection: (collectionId?: string) =>
    `/collections/edit/${collectionId ?? ":collectionId"}`,
  flashcardLearn: (topicId?: string) =>
    `/flashcard/learn/${topicId ?? ":topicId"}`,
  practicePaper: (topicId?: string) =>
    `/practice/paper/${topicId ?? ":topicId"}`,
  practiceWrite: (topicId?: string) =>
    `/practice/write/${topicId ?? ":topicId"}`,
  topic: (topicId?: string) => `/topics/${topicId ?? ":topicId"}`,
  editTopic: (topicId?: string) => `/topics/edit/${topicId ?? ":topicId"}`,
  practiceQuiz: (topicId?: string) => `/practice/quiz/${topicId ?? ":topicId"}`,
  wordMatchGame: (topicId?: string) =>
    `/game/word-match/${topicId ?? ":topicId"}`,
  wordSearchGrid: (topicId?: string) =>
    `/game/word-search/${topicId ?? ":topicId"}`,
  sentenceBuild: (topicId?: string) =>
    `/game/sentence-build/${topicId ?? ":topicId"}`,
  roadmap: (roadmapId?: string) => `/roadmap/${roadmapId ?? ":roadmapId"}`,
  createRoadmap: "/roadmap/create",
};
