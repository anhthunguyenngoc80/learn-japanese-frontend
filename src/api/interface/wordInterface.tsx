import * as models from "../../model";

type skillType = "recognition"

export interface UpdateWordMasteryRequest {
  word_id: string;
  is_correct: boolean;
  response_time_ms: number;
  skill: skillType
}

export interface UpdateWordMasteryResponse {
  data: models.Word;
  message: string;
}