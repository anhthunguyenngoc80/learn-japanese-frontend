import api from "./axios";
import * as topicI from "./interface";

export const getTopics = async (
  collectionId: string,
): Promise<topicI.GetTopicsResponse> => {
  const response = await api.get(`/topics/${collectionId}`);
  return response.data;
};

export const getTopicById = async (
  topicId: string,
): Promise<topicI.GetTopicByIdResponse> => {
  const response = await api.get(`/topic/${topicId}`);
  return response.data;
};