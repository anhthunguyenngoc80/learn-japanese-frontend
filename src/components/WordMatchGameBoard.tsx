import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Word } from "../model";
import {
  buildBank,
  checkAnswer,
  shuffle,
  type BankChar,
  type PickedChar,
} from "../utils/wordMatchGame";
import { Button } from "./Button";

/* ────────────────────────────────────────────────────────────────── */
/*  Types                                                             */
/* ────────────────────────────────────────────────────────────────── */

/** Active puzzle */
interface PuzzleState {
  currentWord: Word;
  target: string;
  bank: BankChar[];
  picked: PickedChar[];
}

export interface WordMatchGameBoardProps {
  words: Word[];
  onComplete: (correctCount: number, totalAttempted: number) => void;
  /** Called whenever the "checkable" state changes */
  onCanCheckChange?: (canCheck: boolean) => void;
}

export interface WordMatchGameBoardHandle {
  /** Check the current puzzle answer */
  check: () => void;
}

/* ────────────────────────────────────────────────────────────────── */
/*  WordMatchGameBoard component                                      */
/* ────────────────────────────────────────────────────────────────── */

export const WordMatchGameBoard = forwardRef<
  WordMatchGameBoardHandle,
  WordMatchGameBoardProps
>(({ words, onComplete, onCanCheckChange }, ref) => {
  /* ── words we haven't answered yet ── */
  const [remainingWords, setRemainingWords] = useState<Word[]>(() =>
    shuffle(words),
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

    const { bank, target } = buildBank(next);
    setPuzzle({
      currentWord: next,
      target,
      bank,
      picked: [],
    });
  }, [remainingWords]);

  /* ── Kick off first puzzle when words are ready ── */
  useEffect(() => {
    if (remainingWords.length > 0 && !puzzle) {
      nextWord();
    }
  }, [remainingWords, puzzle, nextWord]);

  /* ── Handle picking a character from the bank ── */
  const handlePick = useCallback(
    (bankIdx: number) => {
      if (!puzzle) return;
      const { bank } = puzzle;
      if (bank[bankIdx].used) return;

      const newBank = bank.map((b, i) =>
        i === bankIdx ? { ...b, used: true } : b,
      );
      const pickedChar = bank[bankIdx];
      setPuzzle({
        ...puzzle,
        bank: newBank,
        picked: [...puzzle.picked, { char: pickedChar.char, bankIdx }],
      });
    },
    [puzzle],
  );

  /* ── Handle removing a picked character ── */
  const handleUnpick = useCallback(
    (pickIdx: number) => {
      if (!puzzle) return;
      const item = puzzle.picked[pickIdx];
      const newBank = puzzle.bank.map((b, i) =>
        i === item.bankIdx ? { ...b, used: false } : b,
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

    const isCorrect = checkAnswer(puzzle.picked, puzzle.target);

    if (isCorrect) {
      setCorrectCount((n) => n + 1);
      setTimeout(() => {
        nextWord();
      }, 600);
    } else {
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
    return puzzle.picked.length === Array.from(puzzle.target).length;
  }, [puzzle]);

  const targetChars = useMemo(() => {
    if (!puzzle) return [];
    return Array.from(puzzle.target);
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
  const prevRemainingLength = useRef(remainingWords.length);

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

  /* ── Reset hasReported when words change ── */
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
        {/* Meaning display */}
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-600/80 font-medium mb-2">
            Ghép chữ theo nghĩa
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

        {/* Picked slots */}
        <div className="flex flex-wrap items-center justify-center gap-3 min-h-24 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/30 p-6">
          {Array.from({ length: targetChars.length }).map((_, i) =>
            puzzle.picked[i] ? (
              // <button
              //   key={i}
              //   onClick={() => handleUnpick(i)}
              //   className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-500 text-white text-2xl font-bold shadow-md hover:bg-emerald-600 transition-colors cursor-pointer"
              // >
              //   {puzzle.picked[i].char}
              // </button>
              <Button
              key={i}
              kind="soft"
              color={isUsed || isFull ? "slate" : "rose"}
              size="2xl"
              spacing="xs"
              onClick={() => handleUnpick(i)}
              disabled={isUsed || isFull}
              className={`border-b-4 ${isUsed || isFull
                ? "cursor-not-allowed"
                : "border-rose-300"
                }`}
            >
              {puzzle.picked[i].char}
            </Button>
            ) : (
              <span
                key={i}
                className="inline-flex items-center justify-center w-14 h-14 rounded-xl border-2 border-emerald-200 bg-white text-emerald-300 text-2xl"
              >
                ＿
              </span>
            ),
          )}
        </div>

        {/* Character bank */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-4 rounded-xl bg-white shadow-sm border border-emerald-100">
          {puzzle.bank.map((item, i) =>
            item.used ? (
              <span
                key={`${item.char}-${i}`}
                className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 text-gray-300 text-lg"
              >
                {item.char}
              </span>
            ) : (
              // <button
              //   key={`${item.char}-${i}`}
              //   onClick={() => handlePick(i)}
              //   className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 text-lg font-semibold hover:bg-emerald-200 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-sm"
              // >
              //   {item.char}
              // </button>

              <Button
              key={`${item.char}-${i}`}
              kind="soft"
              color={isUsed || isFull ? "slate" : "rose"}
              size="2xl"
              spacing="xs"
              onClick={() => handlePick(i)}
              disabled={isUsed || isFull}
              className={`border-b-4 ${isUsed || isFull
                ? "cursor-not-allowed"
                : "border-rose-300"
                }`}
            >
              {item.char}
            </Button>
            ),
          )}
        </div>
      </div>
    </div>
  );
});

WordMatchGameBoard.displayName = "WordMatchGameBoard";