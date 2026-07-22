import { shuffle } from "./wordMatchGame";

/* ────────────────────────────────────────────────────────────────── */
/*  Types                                                              */
/* ────────────────────────────────────────────────────────────────── */

export interface SentenceWord {
  text: string;
  originalIndex: number;
  used: boolean;
}

export interface PickedWord {
  text: string;
  sentenceWordIdx: number;
}

/* ────────────────────────────────────────────────────────────────── */
/*  Split a sentence into words and shuffle them                       */
/* ────────────────────────────────────────────────────────────────── */

export interface SentencePuzzle {
  /** The original full sentence (for checking) */
  target: string;
  /** Words in correct order */
  words: SentenceWord[];
  /** Words in original order for display */
  originalWords: SentenceWord[];
}

/**
 * Build a puzzle from a sentence (example content).
 * Splits the sentence by whitespace/punctuation boundaries,
 * then shuffles the words for the player to reorder.
 */
export function buildSentenceBank(sentence: string): SentencePuzzle {
  // Split into words: preserve Japanese characters, split on spaces/punctuation
  const words = sentence.match(/[^\s,。、！？!?，、　]+/g) || [sentence];

  const wordItems: SentenceWord[] = words.map((w, i) => ({
    text: w,
    originalIndex: i,
    used: false,
  }));

  return {
    target: sentence,
    words: shuffle(wordItems),
    originalWords: wordItems,
  };
}

/* ────────────────────────────────────────────────────────────────── */
/*  Check if picked words are in the correct order                     */
/* ────────────────────────────────────────────────────────────────── */

export function checkSentenceAnswer(
  picked: PickedWord[],
  targetWords: string[],
): boolean {
  return (
    picked.length === targetWords.length &&
    picked.every((pw, i) => pw.text === targetWords[i])
  );
}