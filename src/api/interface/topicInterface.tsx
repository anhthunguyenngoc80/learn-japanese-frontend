import * as models from "../../model";

export interface GetTopicsResponse {
  data: models.Topic[];
  message: string;
}

export interface GetTopicByIdResponse {
  data: models.Topic;
  message: string;
}
export interface GetCollectionByIdRequest {
  limit: number;
}

export interface GetFlashcardReviewRequest {
  limit: number;
}

export interface DeleteTopicResponse {
  message: string;
}

export interface GetFlashcardReviewResponse {
  data: models.Topic;
  message: string;
}

export interface GetPracticeWordsResponse {
  data: models.Topic;
  message: string;
}

export interface CreateTopicRequest {
  name: string;
}

export interface CreateTopicResponse {
  data: models.Topic;
  message: string;
}
