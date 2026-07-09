import api from "./axios";
import * as collectionI from "./interface";

export const getCollections =
  async (): Promise<collectionI.GetCollectionsResponse> => {
    const response = await api.get("/collections");
    return response.data;
  };

export const createCollection = async (
  data: collectionI.CreateCollectionRequest,
): Promise<collectionI.CreateCollectionResponse> => {
  const response = await api.post("/collections", data);
  return response.data;
};

export const getCollectionById = async (
  collectionId: string,
): Promise<collectionI.GetCollectionByIdResponse> => {
  const response = await api.get(`/collections/${collectionId}`);
  return response.data;
};

export const getCollectionByIdLimit = async (
  collectionId: string,
  data: collectionI.GetCollectionByIdLimitRequest,
): Promise<collectionI.GetCollectionByIdResponse> => {
  const response = await api.get(`/collections/${collectionId}`, {
    params: data,
  });
  return response.data;
};

export const deleteCollection = async (
  collectionId: string,
): Promise<collectionI.DeleteCollectionResponse> => {
  const response = await api.delete(`/collections/${collectionId}`);
  return response.data;
};
