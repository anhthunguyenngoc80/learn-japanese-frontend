import api from "./axios";
import * as wordI from "./interface/wordInterface";
import type { Example } from "../model";

export const updateWordMastery = async (
  data: wordI.UpdateWordMasteryRequest,
): Promise<wordI.UpdateWordMasteryResponse> => {
  const response = await api.put("/review/update-mastery", data);
  return response.data;
};

export const updateWords = async (
  topicId: string,
  data: wordI.UpdateWordsRequest,
): Promise<wordI.UpdateWordsResponse> => {
  const response = await api.post(`/words/${topicId}/bulk`, data);
  return response.data;
};

export const replaceWords = async (
  data: wordI.ReplaceWordsRequest,
): Promise<wordI.ReplaceWordsResponse> => {
  const response = await api.put(`/words/bulk`, data);
  return response.data;
};

export const deleteWord = async (
  wordId: string,
): Promise<void> => {
  await api.delete(`/words/${wordId}`);
};

export const addExamples = async (
  wordId: string,
  data: { content: string; meaning?: string }[],
): Promise<Example[]> => {
  const response = await api.post(`/words/${wordId}/examples/bulk`, data);
  return response.data;
};

export const updateExamples = async (
  data: { example_id: string; content?: string; meaning?: string }[],
): Promise<Example[]> => {
  const response = await api.put(`/examples/bulk`, data);
  return response.data;
};

export const deleteExample = async (
  exampleId: string,
): Promise<void> => {
  await api.delete(`/examples/${exampleId}`);
};
