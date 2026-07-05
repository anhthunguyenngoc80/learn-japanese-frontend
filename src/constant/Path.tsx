export const PATHS = {
  dashboard: "/",
  register: "/register",
  login: "/login",
  collection: "/collection",
  createCollection: "/collection/create",
  topic: (collectionId?: string) =>
    `/collection/${collectionId ?? ":collectionId"}`,
  editCollection: (collectionId?: string) =>
    `/collection/edit/${collectionId ?? ":collectionId"}`,
  flashcardLearn: (topicId?: string) =>
    `/flashcard/learn/${topicId ?? ":topicId"}`,
  practicePaper: (topicId?: string) =>
    `/practice/paper/${topicId ?? ":topicId"}`,
  practiceWrite: (topicId?: string) =>
    `/practice/write/${topicId ?? ":topicId"}`,
};
