import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Word, Example } from "../model";
import { shuffle } from "../utils/wordMatchGame";
import {
  buildSentenceBank,
  checkSentenceAnswer,
  type SentenceWord,
  type PickedWord,
} from "../utils/sentenceBuildGame";
import { Button } from "./Button";
import type { AccentColor } from "../constant";

/* ────────────────────────────────────────────────────────────────── */
/*  Types                                                             */
/* ────────────────────────────────────────────────────────────────── */

/** Active puzzle */
interface PuzzleState {
  currentWord: Word;
  currentExample: Example;
  target: string;
  targetWords: string[];
  bank: SentenceWord[];
  picked: PickedWord[];
}

export interface SentenceBuildBoardProps {
  words: Word[];
  onComplete: (correctCount: number, totalAttempted: number) => void;
  /** Called whenever the "checkable" state changes */
  onCanCheckChange?: (canCheck: boolean) => void;
  color: AccentColor;
}

export interface SentenceBuildBoardHandle {
  /** Check the current puzzle answer */
  check: () => void;
}

/* ────────────────────────────────────────────────────────────────── */
/*  SentenceBuildBoard component                                      */
/* ────────────────────────────────────────────────────────────────── */

export const SentenceBuildBoard = forwardRef<
  SentenceBuildBoardHandle,
  SentenceBuildBoardProps
>(({ words, onComplete, onCanCheckChange, color }, ref) => {
  /* ── Filter words that have examples ── */
  const wordsWithExamples = useMemo(
    () => words.filter((w) => w.examples && w.examples.length > 0),
    [words],
  );

  /* ── Words we haven't answered yet ── */
  const [remainingWords, setRemainingWords] = useState<Word[]>(() =>
    shuffle(wordsWithExamples),
  );

  /* ── current puzzle ── */
  const [puzzle, setPuzzle] = useState<PuzzleState | null>(null);

  /* ── scoring ── */
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);

  /* ── Build a new puzzle from a word ── */
  const nextWord = useCallback(() => {
    if (remainingWords.length === 0) {
      setPuzzle(null);
      return;
    }

    const [next, ...rest] = remainingWords;
    setRemainingWords(rest);

    // Pick a random example from the word
    const examples = next.examples || [];
    const example =
      examples.length > 0
        ? examples[Math.floor(Math.random() * examples.length)]
        : null;

    if (!example) {
      // No example available, skip this word
      nextWord();
      return;
    }

    const { target, words: bankWords, originalWords } = buildSentenceBank(
      example.content,
    );
    const targetWords = originalWords.map((w) => w.text);

    setPuzzle({
      currentWord: next,
      currentExample: example,
      target,
      targetWords,
      bank: bankWords,
      picked: [],
    });
  }, [remainingWords]);

  /* ── Kick off first puzzle when words are ready ── */
  useEffect(() => {
    if (remainingWords.length > 0 && !puzzle) {
      nextWord();
    }
  }, [remainingWords, puzzle, nextWord]);

  /* ── Handle picking a word from the bank ── */
  const handlePick = useCallback(
    (bankIdx: number) => {
      if (!puzzle) return;
      const { bank } = puzzle;
      if (bank[bankIdx].used) return;

      const newBank = bank.map((b, i) =>
        i === bankIdx ? { ...b, used: true } : b,
      );
      const pickedWord = bank[bankIdx];
      setPuzzle({
        ...puzzle,
        bank: newBank,
        picked: [
          ...puzzle.picked,
          { text: pickedWord.text, sentenceWordIdx: bankIdx },
        ],
      });
    },
    [puzzle],
  );

  /* ── Handle removing a picked word ── */
  const handleUnpick = useCallback(
    (pickIdx: number) => {
      if (!puzzle) return;
      const item = puzzle.picked[pickIdx];
      const newBank = puzzle.bank.map((b, i) =>
        i === item.sentenceWordIdx ? { ...b, used: false } : b,
      );
      setPuzzle({
        ...puzzle,
        bank: newBank,
        picked: puzzle.picked.filter((_, i) => i !== pickIdx),
      });
    },
    [puzzle],
  );

  /* ── Check answer ── */
  const check = useCallback(() => {
    if (!puzzle) return;

    const isCorrect = checkSentenceAnswer(puzzle.picked, puzzle.targetWords);

    if (isCorrect) {
      setCorrectCount((n) => n + 1);
      setTimeout(() => {
        nextWord();
      }, 800);
    } else {
      // Show wrong state briefly then reset
      setPuzzle({
        ...puzzle,
        picked: [],
        bank: puzzle.bank.map((b) => ({ ...b, used: false })),
      });
    }

    setTotalAttempted((n) => n + 1);
  }, [puzzle, nextWord]);

  /* ── Derived ── */
  const canCheck = useMemo(() => {
    if (!puzzle) return false;
    return puzzle.picked.length === puzzle.targetWords.length;
  }, [puzzle]);

  /* ── Expose handle to parent ── */
  useImperativeHandle(
    ref,
    () => ({
      check,
    }),
    [check],
  );

  /* ── Notify parent of canCheck changes ── */
  useEffect(() => {
    onCanCheckChange?.(canCheck);
  }, [canCheck, onCanCheckChange]);

  /* ── Notify parent when all words are done ── */
  const hasReported = useRef(false);

  useEffect(() => {
    if (
      !puzzle &&
      remainingWords.length === 0 &&
      totalAttempted > 0 &&
      !hasReported.current
    ) {
      hasReported.current = true;
      onComplete(correctCount, totalAttempted);
    }
  }, [puzzle, remainingWords, totalAttempted, correctCount, onComplete]);

  /* ── Reset hasReported when remainingWords change ── */
  const prevRemainingLength = useRef(remainingWords.length);
  useEffect(() => {
    if (remainingWords.length !== prevRemainingLength.current) {
      hasReported.current = false;
      prevRemainingLength.current = remainingWords.length;
    }
  }, [remainingWords]);

  if (!puzzle) {
    return null;
  }

  return (
    <div className="grow flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Meaning & word display */}
        <div className="text-center">
          <p
            className={`text-sm uppercase tracking-[0.2em] text-${color}-600/80 font-medium mb-2`}
          >
            Sắp xếp từ để tạo thành câu
          </p>
          <h2 className="text-3xl font-bold text-gray-800">
            {puzzle.currentWord.meaning}
          </h2>
          {puzzle.currentWord.text && (
            <p className="text-lg text-gray-400 mt-1">
              ({puzzle.currentWord.text})
            </p>
          )}
        </div>

        {/* Hint: example meaning */}
        {puzzle.currentExample.meaning && (
          <div className="text-center">
            <p className="text-sm text-gray-500 italic">
              Gợi ý: {puzzle.currentExample.meaning}
            </p>
          </div>
        )}

        {/* Picked slots - show words in order */}
        <div
          className={`flex flex-wrap items-center justify-center gap-2 min-h-24 rounded-2xl border-2 border-dashed border-${color}-300 bg-${color}-50/30 p-6`}
        >
          {Array.from({ length: puzzle.targetWords.length }).map((_, i) =>
            puzzle.picked[i] ? (
              <Button
                key={i}
                kind="soft"
                color="rose"
                size="4xl"
                spacing="sm"
                onClick={() => handleUnpick(i)}
                className={`border-b-4 border-${color}-300 font-medium`}
              >
                {puzzle.picked[i].text}
              </Button>
            ) : (
              <span
                key={i}
                className={`inline-flex items-center justify-center min-w-16 h-14 rounded-xl border-2 border-${color}-200 bg-white text-${color}-300 text-xl px-4`}
              >
                ＿＿＿
              </span>
            ),
          )}
        </div>

        {/* Word bank */}
        <div
          className={`flex flex-wrap items-center justify-center gap-2 p-4 rounded-xl bg-white shadow-sm border border-${color}-100`}
        >
          {puzzle.bank.map((item, i) => {
            const isFull = puzzle.picked.length >= puzzle.targetWords.length;
            return (
              <Button
                key={`${item.text}-${i}`}
                kind="soft"
                color={item.used || isFull ? "slate" : color}
                size="4xl"
                spacing="sm"
                onClick={() => handlePick(i)}
                disabled={item.used || isFull}
                className={`border-b-4 font-medium ${
                  item.used || isFull
                    ? "cursor-not-allowed"
                    : `border-${color}-300`
                }`}
              >
                {item.text}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

SentenceBuildBoard.displayName = "SentenceBuildBoard";