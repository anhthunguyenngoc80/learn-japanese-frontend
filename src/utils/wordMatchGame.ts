import { ALL_HIRAGANA } from "../constant";
import type { Word } from "../model";

/* ────────────────────────────────────────────────────────────────── */
/*  Helper — extract hiragana characters from a string                */
/* ────────────────────────────────────────────────────────────────── */

export function extractHiragana(s: string): string {
  // Keep only hiragana characters (Unicode range 3040–309F)
  return Array.from(s)
    .filter((ch) => /[\u3040-\u309F]/.test(ch))
    .join("");
}

/* ────────────────────────────────────────────────────────────────── */
/*  Fisher-Yates shuffle                                              */
/* ────────────────────────────────────────────────────────────────── */

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ────────────────────────────────────────────────────────────────── */
/*  Generate the character bank for a word puzzle                      */
/* ────────────────────────────────────────────────────────────────── */

export interface BankChar {
  char: string;
  sourceId: string; // word_id this char belongs to
  originalIndex: number;
  used: boolean;
}

export interface PickedChar {
  char: string;
  bankIdx: number;
}

export function buildBank(word: Word): { bank: BankChar[]; target: string } {
  const target = extractHiragana(word.reading || word.text || "");

  // Create bank: correct chars + some distractor chars from common hiragana
  const targetChars = Array.from(target);
  const distractorPool = ALL_HIRAGANA.filter((ch) => !targetChars.includes(ch));

  // Pick up to 5 distractors
  const distractors = shuffle(distractorPool).slice(0, 5);

  // Build bank: for each target char, keep multiple copies if repeated in target
  const bank: BankChar[] = [];
  targetChars.forEach((ch, idx) => {
    bank.push({
      char: ch,
      sourceId: word.word_id,
      originalIndex: idx,
      used: false,
    });
  });
  distractors.forEach((ch, idx) => {
    bank.push({
      char: ch,
      sourceId: "distractor",
      originalIndex: idx,
      used: false,
    });
  });

  return { bank: shuffle(bank), target };
}

/* ────────────────────────────────────────────────────────────────── */
/*  Check if the picked characters form the correct answer             */
/* ────────────────────────────────────────────────────────────────── */

export function checkAnswer(
  picked: PickedChar[],
  target: string,
): boolean {
  const targetChars = Array.from(target);
  const pickedChars = picked.map((p) => p.char);

  return (
    pickedChars.length === targetChars.length &&
    pickedChars.every((ch, i) => ch === targetChars[i])
  );
}