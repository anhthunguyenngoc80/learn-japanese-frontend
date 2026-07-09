import api from "./axios";
import * as topicI from "./interface";

export const getTopics = async (
  collectionId: string,
): Promise<topicI.GetTopicsResponse> => {
  const response = await api.get(`/collections/${collectionId}/topics`);
  return response.data;
};

export const getTopicById = async (
  topicId: string, data: topicI.GetCollectionByIdRequest
): Promise<topicI.GetTopicByIdResponse> => {
  const response = await api.get(`/topics/${topicId}`, {
    params: data,
  });
  return response.data;
};

export const deleteTopic = async (
  topicId: string,
): Promise<topicI.DeleteTopicResponse> => {
  const response = await api.delete(`/topics/${topicId}`);
  return response.data;
};
