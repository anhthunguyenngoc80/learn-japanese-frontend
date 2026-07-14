import api from "./axios";
import * as wordI from "./interface/wordInterface";

export const updateWordMastery = async (
  data: wordI.UpdateWordMasteryRequest,
): Promise<wordI.UpdateWordMasteryResponse> => {
  const response = await api.put("/review/update-mastery", data);
  return response.data;
};