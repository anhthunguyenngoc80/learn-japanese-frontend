import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Sparkles, RotateCcw } from "lucide-react";
import { getPracticeWords } from "../../api";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { PATHS } from "../../constant";
import type { Word } from "../../model";

/* ────────────────────────────────────────────────────────────────── */
/*  Types                                                             */
/* ────────────────────────────────────────────────────────────────── */

/** A single hiragana character from a button bank */
interface BankChar {
  char: string;
  sourceId: string; // word_id this char belongs to
  originalIndex: number;
  used: boolean;
}

/** Active puzzle */
interface PuzzleState {
  currentWord: Word;
  bank: BankChar[];
  picked: { char: string; bankIdx: number }[];
}

/* ────────────────────────────────────────────────────────────────── */
/*  Helper — generate the "puzzle reading" from a word                */
/*  We use reading as the target, falling back to text (kanji) then   */
/*  strip all non-hiragana characters.                                */
/* ────────────────────────────────────────────────────────────────── */

function extractHiragana(s: string): string {
  // Keep only hiragana characters (Unicode range 3040–309F)
  return Array.from(s)
    .filter((ch) => /[\u3040-\u309F]/.test(ch))
    .join("");
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ────────────────────────────────────────────────────────────────── */
/*  Page component                                                    */
/* ────────────────────────────────────────────────────────────────── */

export const WordMatchGamePage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState<{
    name: string;
    topic_id: string;
    words: Word[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── words we haven't answered yet ── */
  const [remainingWords, setRemainingWords] = useState<Word[]>([]);

  /* ── current puzzle ── */
  const [puzzle, setPuzzle] = useState<PuzzleState | null>(null);

  /* ── scoring ── */
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);

  /* ── Load topic data ── */
  useEffect(() => {
    if (!topicId) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getPracticeWords(topicId);
        if (!cancelled) {
          const data = response.data;
          const words = (data.words || []) as Word[];
          setTopic(data);

          // Filter words that have at least 1 hiragana character in reading
          const playable = words.filter(
            (w) => extractHiragana(w.reading || w.text || "").length > 0,
          );

          if (playable.length === 0) {
            setRemainingWords([]);
            setLoading(false);
            return;
          }

          setRemainingWords(shuffle(playable));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  /* ── Build a new puzzle from a word ── */
  const buildPuzzle = useCallback((word: Word): PuzzleState => {
    const target = extractHiragana(word.reading || word.text || "");

    // Create bank: correct chars + some distractor chars from common hiragana
    const targetChars = Array.from(target);
    const distractorPool = [
      "あ",
      "い",
      "う",
      "え",
      "お",
      "か",
      "き",
      "く",
      "け",
      "こ",
      "さ",
      "し",
      "す",
      "せ",
      "そ",
      "た",
      "ち",
      "つ",
      "て",
      "と",
      "な",
      "に",
      "ぬ",
      "ね",
      "の",
      "は",
      "ひ",
      "ふ",
      "へ",
      "ほ",
      "ま",
      "み",
      "む",
      "め",
      "も",
      "や",
      "ゆ",
      "よ",
      "ら",
      "り",
      "る",
      "れ",
      "ろ",
      "わ",
      "を",
      "ん",
      "が",
      "ぎ",
      "ぐ",
      "げ",
      "ご",
      "ざ",
      "じ",
      "ず",
      "ぜ",
      "ぞ",
      "だ",
      "ぢ",
      "づ",
      "で",
      "ど",
      "ば",
      "び",
      "ぶ",
      "べ",
      "ぼ",
      "ぱ",
      "ぴ",
      "ぷ",
      "ぺ",
      "ぽ",
      "きゃ",
      "きゅ",
      "きょ",
      "しゃ",
      "しゅ",
      "しょ",
      "ちゃ",
      "ちゅ",
      "ちょ",
      "にゃ",
      "にゅ",
      "にょ",
      "ひゃ",
      "ひゅ",
      "ひょ",
      "みゃ",
      "みゅ",
      "みょ",
      "りゃ",
      "りゅ",
      "りょ",
      "ぎゃ",
      "ぎゅ",
      "ぎょ",
      "じゃ",
      "じゅ",
      "じょ",
      "びゃ",
      "びゅ",
      "びょ",
      "ぴゃ",
      "ぴゅ",
      "ぴょ",
    ].filter((ch) => !targetChars.includes(ch));

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

    return {
      currentWord: word,
      bank: shuffle(bank),
      picked: [],
    };
  }, []);

  /* ── Start / advance to next word ── */
  const nextWord = useCallback(() => {
    if (remainingWords.length === 0) return;

    const [next, ...rest] = remainingWords;
    setRemainingWords(rest);
    setPuzzle(buildPuzzle(next));
  }, [remainingWords, buildPuzzle]);

  /* ── Kick off first puzzle when words are ready ── */
  useEffect(() => {
    if (!loading && remainingWords.length > 0 && !puzzle) {
      nextWord();
    }
  }, [loading, remainingWords, puzzle, nextWord]);

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
  const handleCheck = useCallback(() => {
    if (!puzzle) return;

    setTotalAttempted((n) => n + 1);

    const target = extractHiragana(
      puzzle.currentWord.reading || puzzle.currentWord.text || "",
    );
    const targetChars = Array.from(target);

    const pickedChars = puzzle.picked.map((p) => p.char);
    const isCorrect =
      pickedChars.length === targetChars.length &&
      pickedChars.every((ch, i) => ch === targetChars[i]);

    if (isCorrect) {
      setCorrectCount((n) => n + 1);
      // Show feedback briefly, then move to next word
      setTimeout(() => {
        nextWord();
      }, 600);
    } else {
      // Shake and reset picked for this puzzle
      setPuzzle({
        ...puzzle,
        picked: [],
        bank: puzzle.bank.map((b) => ({ ...b, used: false })),
      });
    }
  }, [puzzle, nextWord]);

  /* ── Reset game ── */
  const handleRestart = useCallback(() => {
    if (!topic) return;
    const playable = topic.words.filter(
      (w) => extractHiragana(w.reading || w.text || "").length > 0,
    );
    setRemainingWords(shuffle(playable));
    setPuzzle(null);
    setCorrectCount(0);
    setTotalAttempted(0);
  }, [topic]);

  /* ── Derived ── */
  const targetChars = useMemo(() => {
    if (!puzzle) return [];
    return Array.from(
      extractHiragana(
        puzzle.currentWord.reading || puzzle.currentWord.text || "",
      ),
    );
  }, [puzzle]);

  const progressPercent =
    totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;

  /* ── Render ── */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto" />
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <Button
            kind="text"
            color="emerald"
            size="lg"
            icon={ChevronLeft}
            iconPosition="left"
            onClick={() => navigate(PATHS.topic(topicId))}
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const words = topic?.words || [];

  if (
    words.length === 0 ||
    (!loading && remainingWords.length === 0 && !puzzle)
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-gray-500">
            {words.length === 0
              ? "Chưa có từ vựng để chơi."
              : "Không có từ nào có thể chơi ghép chữ (cần có hiragana trong cách đọc)."}
          </p>
          <Button
            kind="text"
            color="emerald"
            size="lg"
            icon={ChevronLeft}
            iconPosition="left"
            onClick={() => navigate(PATHS.topic(topicId))}
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  // Game completed all words
  if (!puzzle && remainingWords.length === 0 && totalAttempted > 0) {
    return (
      <div className="grow flex flex-col">
        {/* Header */}
        <div className="w-full text-start">
          <Button
            kind="text"
            color="emerald"
            size="lg"
            icon={ChevronLeft}
            iconPosition="left"
            onClick={() => navigate(PATHS.topic(topic?.topic_id))}
            className="mb-6"
            spacing="none"
          >
            Quay lại
          </Button>
        </div>

        <Card
          kind="solid"
          color="emerald"
          className="mb-8"
          hoverEffect={false}
          item={{
            id: "" + topic?.topic_id,
            title: "" + topic?.name,
            progress: progressPercent,
            icon: Sparkles,
          }}
          loading={topic === null}
        />

        <div className="grow flex flex-col items-center justify-center py-12">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Hoàn thành!
              </h2>
              <p className="text-gray-500 mb-2">
                Bạn đã ghép đúng{" "}
                <strong className="text-emerald-600">{correctCount}</strong> /{" "}
                {totalAttempted} từ.
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Tỉ lệ đúng: {progressPercent}%
              </p>
              <Button
                kind="outline"
                color="emerald"
                size="xl"
                spacing="lg"
                icon={RotateCcw}
                iconPosition="left"
                onClick={handleRestart}
              >
                Chơi lại
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grow flex flex-col">
      {/* Header */}
      <div className="w-full text-start">
        <Button
          kind="text"
          color="emerald"
          size="lg"
          icon={ChevronLeft}
          iconPosition="left"
          onClick={() => navigate(PATHS.topic(topic?.topic_id))}
          className="mb-6"
          spacing="none"
        >
          Quay lại
        </Button>
      </div>

      <Card
        kind="solid"
        color="emerald"
        className="mb-8"
        hoverEffect={false}
        item={{
          id: "" + topic?.topic_id,
          title: "" + topic?.name,
          progress: progressPercent,
          subtitle:
            totalAttempted > 0
              ? `Đúng ${correctCount}/${totalAttempted}`
              : "Hãy ghép các chữ để tạo thành từ đúng",
          icon: Sparkles,
        }}
        loading={topic === null}
      />

      {puzzle && (
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
                  <button
                    key={i}
                    onClick={() => handleUnpick(i)}
                    className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-500 text-white text-2xl font-bold shadow-md hover:bg-emerald-600 transition-colors cursor-pointer"
                  >
                    {puzzle.picked[i].char}
                  </button>
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
                  <button
                    key={`${item.char}-${i}`}
                    onClick={() => handlePick(i)}
                    className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 text-lg font-semibold hover:bg-emerald-200 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    {item.char}
                  </button>
                ),
              )}
            </div>

            {/* Check button */}
            <div className="text-center">
              <Button
                kind="solid"
                color="emerald"
                size="xl"
                spacing="lg"
                onClick={handleCheck}
                disabled={puzzle.picked.length !== targetChars.length}
                className="w-full max-w-xs uppercase tracking-wide"
              >
                Kiểm tra
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
