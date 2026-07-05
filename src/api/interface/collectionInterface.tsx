import * as models from "../../model";

export interface GetCollectionsResponse {
  data: models.Collection[];
  message: string;
}

export interface CreateCollectionRequest {
  name: string;
  description: string;
}

export interface CreateCollectionResponse {
  data: models.Collection;
  message: string;
}
