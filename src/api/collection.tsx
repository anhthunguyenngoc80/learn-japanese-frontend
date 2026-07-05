import api from "./axios";
import * as collectionI from "./interface";

export const getCollections =
  async (): Promise<collectionI.GetCollectionsResponse> => {
    const response = await api.get("/collections");
    return response.data;
  };
