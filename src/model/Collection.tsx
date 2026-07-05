export interface Collection {
  collection_id: string;
  name: string;
  topics: Topic[];
}

export interface Topic {
  collection_id: string;
  topic_id: string;
  name: string;
  words: Word[];
}

export interface Word {
  word_id: string;
  topic_id: string;
  text: string;
  sv_word: string;
  reading?: string;
  meaning: string;
  partOfSpeech?: string;
  examples?: Example[];
  learned?: boolean;
}

export interface Example {
  example_id: string;
  word_id: string;
  content: string;
  meaning?: string;
}
