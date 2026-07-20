import * as models from "../../model";

export interface GetCollectionsResponse {
  data: models.Collection[];
  message: string;
}

export interface CreateCollectionRequest {
  name: string;
  visibility: "public" | "private";
  topics: {
    name: string;
    words: {
      text: string;
      sv_word?: string;
      reading?: string;
      meaning: string;
      partOfSpeech?: string;
      examples: { content: string; meaning?: string }[];
    }[];
  }[];
}

export interface GetCollectionByIdLimitRequest {
  limit: number;
}
export interface CreateCollectionResponse {
  data: models.Collection;
  message: string;
}

export interface GetCollectionByIdResponse {
  data: models.Collection;
  message: string;
}

export interface DeleteCollectionResponse {
  message: string;
}
