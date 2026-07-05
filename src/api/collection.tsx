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
