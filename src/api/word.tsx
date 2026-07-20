import api from "./axios";
import * as wordI from "./interface/wordInterface";

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
