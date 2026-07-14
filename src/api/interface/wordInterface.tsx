import * as models from "../../model";

export interface UpdateWordMasteryRequest {
  word_id: string;
  is_correct: boolean;
  response_time_ms: number
}

export interface UpdateWordMasteryResponse {
  data: models.Word;
  message: string;
}