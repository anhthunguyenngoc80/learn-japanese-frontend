export interface Collection {
  id: string;
  name: string;
  description: string;
  words: { word: string; meaning: string }[];
  createdAt: string;
}
