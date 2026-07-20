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

export interface UpdateWordsRequest {
  words: {
    text: string;
    sv_word?: string;
    reading?: string;
    meaning: string;
    partOfSpeech?: string;
    examples: { content: string; meaning?: string }[];
  }[];
}

export interface UpdateWordsResponse {
  data: models.Word[];
  message: string;
}
