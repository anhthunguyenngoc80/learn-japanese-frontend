import type { ComponentType } from "react";

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
  sv_word?: string;
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

export type CreateExample = Omit<Example, "example_id" | "word_id">;
export type CreateWord = Omit<Word, "word_id" | "topic_id" | "examples"> & {
  examples: CreateExample[];
};
export type CreateTopic = Omit<Topic, "topic_id" | "collection_id" | "words"> & {
  words: CreateWord[];
};

export interface ModeContentProps {
    words: CreateWord[];
    topics: CreateTopic[];
    onFileUpload?: (file: File, words?: CreateWord[]) => void;
    isUploading?: boolean;
    onAddTopic?: (name: string) => void;
    onDeleteTopic?: (index: number) => void;
    onUpdateTopic?: (topicIndex: number, wordIndices: number[]) => void;
}

export type ModeCardMode = "vocab-first" | "topic-first" | "parallel";

export interface ModeCard {
  mode: ModeCardMode;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>;
  title: string;
  description: string;
  content: ComponentType<ModeContentProps>;
}
