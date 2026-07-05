import * as models from "../../model";

export interface GetTopicsResponse {
  data: models.Topic[];
  message: string;
}
