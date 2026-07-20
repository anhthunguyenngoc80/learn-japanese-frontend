import api from "./axios";
import * as topicI from "./interface";

export const getTopics = async (
  collectionId: string,
): Promise<topicI.GetTopicsResponse> => {
  const response = await api.get(`/collections/${collectionId}/topics`);
  return response.data;
};

export const getTopicById = async (
  topicId: string,
  data: topicI.GetCollectionByIdRequest,
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

export const getFlashcardReview = async (
  topicId: string,
  data: topicI.GetCollectionByIdRequest,
): Promise<topicI.GetFlashcardReviewResponse> => {
  const response = await api.get(`/review/flashcard/${topicId}`, {
    params: data,
  });
  return response.data;
};

export const getPracticeWords = async (
  topicId: string,
): Promise<topicI.GetPracticeWordsResponse> => {
  const response = await api.get(`/review/practice/${topicId}`);
  return response.data;
};

export const createTopic = async (
  collectionId: string,
  data: topicI.CreateTopicRequest,
): Promise<topicI.CreateTopicResponse> => {
  const response = await api.post(`/collections/${collectionId}/topics`, data);
  return response.data;
};
