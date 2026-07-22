import { useParams, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Button,
  ActionButton,
  Card,
  Flashcard,
  MultichoiceQuiz,
  renderWordWithKanji,
  type FlashcardSettings,
} from "../../components";
import { getFlashcardReview, updateWordMastery } from "../../api";
import type { Topic, Word, Example } from "../../model";
import { ChevronLeft, ChevronRight, Pencil, Share2, Sparkles, Play, RotateCcw } from "lucide-react";
import { PATHS } from "../../constant";

/* ------------------------------------------------------------------ */
/*  Session types & helpers (local — backend update later)            */
/* ------------------------------------------------------------------ */

type Mode = "flashcard" | "quiz" | "done";

type ReviewEntry = {
  wordId: string;
  wrongCount: number;
  readyAt: number;
};

interface FlashcardSession {
  topicId: string;
  shuffledWordIds: string[];
  currentBatchIds: string[];
  reviewQueue: ReviewEntry[];
  nextWordIndex: number;
  learnedCount: number;
  mode: Mode;
  round: number;
  historyWordIds: string[];
  learnedWordIds: string[];
  correctWordIds: string[];
  wrongLimitWordIds: string[];
  completed: boolean;
  startedAt: string;
  updatedAt: string;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const SESSION_PREFIX = "flashcard-session-";

function sessionKey(topicId: string) {
  return `${SESSION_PREFIX}${topicId}`;
}

function loadSession(topicId: string): FlashcardSession | null {
  try {
    const raw = localStorage.getItem(sessionKey(topicId));
    return raw ? (JSON.parse(raw) as FlashcardSession) : null;
  } catch {
    return null;
  }
}

function persistSession(session: FlashcardSession) {
  session.updatedAt = new Date().toISOString();
  localStorage.setItem(sessionKey(session.topicId), JSON.stringify(session));
}

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const BATCH_SIZE = 4;
const MAX_WRONG = 3;

/* ------------------------------------------------------------------ */
/*  Batch building (pure function, same logic)                        */
/* ------------------------------------------------------------------ */

function buildNextBatch(
  allWordIds: string[],
  nextWordIndex: number,
  reviewQueue: ReviewEntry[],
  buildRound: number,
) {
  const batchIds: string[] = [];
  const usedReviewIds = new Set<string>();

  const readyEntries = reviewQueue
    .filter((r) => r.readyAt <= buildRound)
    .sort((a, b) => b.wrongCount - a.wrongCount);

  for (const entry of readyEntries) {
    if (batchIds.length >= BATCH_SIZE) break;
    batchIds.push(entry.wordId);
    usedReviewIds.add(entry.wordId);
  }

  let idx = nextWordIndex;
  while (batchIds.length < BATCH_SIZE && idx < allWordIds.length) {
    batchIds.push(allWordIds[idx]);
    idx++;
  }

  const noFreshLeft = idx >= allWordIds.length;

  if (batchIds.length < BATCH_SIZE && noFreshLeft) {
    const notReadyEntries = reviewQueue
      .filter((r) => !usedReviewIds.has(r.wordId))
      .sort((a, b) => b.wrongCount - a.wrongCount);

    for (const entry of notReadyEntries) {
      if (batchIds.length >= BATCH_SIZE) break;
      batchIds.push(entry.wordId);
    }
  }

  const remainingQueue = reviewQueue.filter((r) => !usedReviewIds.has(r.wordId));

  return { batchIds, newNextIndex: idx, remainingQueue };
}

/* ------------------------------------------------------------------ */
/*  Create a new session from word IDs                                */
/* ------------------------------------------------------------------ */

function createNewSession(topicId: string, wordIds: string[]): FlashcardSession {
  const shuffled = shuffleArray(wordIds);
  const { batchIds, newNextIndex, remainingQueue } = buildNextBatch(shuffled, 0, [], 1);

  return {
    topicId,
    shuffledWordIds: shuffled,
    currentBatchIds: batchIds,
    reviewQueue: remainingQueue,
    nextWordIndex: newNextIndex,
    learnedCount: 0,
    mode: batchIds.length > 0 ? "flashcard" : "done",
    round: 0,
    historyWordIds: [],
    learnedWordIds: [],
    correctWordIds: [],
    wrongLimitWordIds: [],
    completed: batchIds.length === 0,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/*  Apply actions to a session (returns new session object)           */
/* ------------------------------------------------------------------ */

function applyLearnWord(session: FlashcardSession): FlashcardSession {
  const newLearnedWordIds = [...session.learnedWordIds];
  const currentWordId = session.currentBatchIds[session.learnedCount];
  if (currentWordId && !newLearnedWordIds.includes(currentWordId)) {
    newLearnedWordIds.push(currentWordId);
  }

  const newLearnedCount = session.learnedCount + 1;
  if (newLearnedCount >= session.currentBatchIds.length && session.currentBatchIds.length > 0) {
    return {
      ...session,
      learnedCount: 0,
      mode: "quiz",
      learnedWordIds: newLearnedWordIds,
    };
  }
  return {
    ...session,
    learnedCount: newLearnedCount,
    learnedWordIds: newLearnedWordIds,
  };
}

function applyQuizAnswer(session: FlashcardSession, wordId: string, correct: boolean): FlashcardSession {
  if (!correct) return session;
  const newCorrectWordIds = session.correctWordIds.includes(wordId)
    ? session.correctWordIds
    : [...session.correctWordIds, wordId];
  return { ...session, correctWordIds: newCorrectWordIds };
}

function applyQuizComplete(session: FlashcardSession, wrongWordIds: string[]): FlashcardSession {
  const completedRound = session.round + 1;

  const currentBatchIds = session.currentBatchIds;
  const correctIds = currentBatchIds.filter((id) => !wrongWordIds.includes(id));

  const newCorrectWordIds = [...session.correctWordIds];
  correctIds.forEach((id) => {
    if (!newCorrectWordIds.includes(id)) newCorrectWordIds.push(id);
  });

  let updatedQueue = session.reviewQueue.filter((r) => !correctIds.includes(r.wordId));
  const newWrongLimitWordIds = [...session.wrongLimitWordIds];

  for (const id of wrongWordIds) {
    const existing = updatedQueue.find((r) => r.wordId === id);
    if (existing) {
      existing.wrongCount += 1;
      existing.readyAt = completedRound + 2;
      if (existing.wrongCount >= MAX_WRONG) {
        newWrongLimitWordIds.push(id);
        updatedQueue = updatedQueue.filter((r) => r.wordId !== id);
      }
    } else {
      updatedQueue.push({ wordId: id, wrongCount: 1, readyAt: completedRound + 2 });
    }
  }

  const buildRound = completedRound + 1;
  const { batchIds, newNextIndex, remainingQueue } = buildNextBatch(
    session.shuffledWordIds,
    session.nextWordIndex,
    updatedQueue,
    buildRound,
  );

  const newHistoryWordIds = [...session.historyWordIds, ...session.currentBatchIds];

  if (batchIds.length === 0 && remainingQueue.length === 0) {
    return {
      ...session,
      currentBatchIds: [],
      reviewQueue: [],
      mode: "done",
      historyWordIds: newHistoryWordIds,
      round: completedRound,
      correctWordIds: newCorrectWordIds,
      wrongLimitWordIds: newWrongLimitWordIds,
      completed: true,
    };
  }

  return {
    ...session,
    currentBatchIds: batchIds,
    reviewQueue: remainingQueue,
    nextWordIndex: newNextIndex,
    learnedCount: 0,
    mode: "flashcard",
    historyWordIds: newHistoryWordIds,
    round: completedRound,
    correctWordIds: newCorrectWordIds,
    wrongLimitWordIds: newWrongLimitWordIds,
  };
}

/* ------------------------------------------------------------------ */
/*  FlashcardLearnPage                                                 */
/* ------------------------------------------------------------------ */

export const FlashcardLearnPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Session state
  const [session, setSession] = useState<FlashcardSession | null>(null);
  const [canResume, setCanResume] = useState(false);

  const [viewIndex, setViewIndex] = useState(0);

  const settingsKey = `flashcard-settings-${topicId}`;
  const [settings, setSettings] = useState<FlashcardSettings>(() => {
    const saved = localStorage.getItem(settingsKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fall through
      }
    }
    return {
      displayOrder: "word-first",
      strokeSpeed: "fast",
      enableWritingPractice: false,
    };
  });

  useEffect(() => {
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  }, [settings, settingsKey]);

  /* ---------- Load topic data ---------- */
  useEffect(() => {
    if (!topicId) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getFlashcardReview(topicId, { limit: 20 });
        if (!cancelled) {
          const data = response.data;
          setTopic(data);

          const words = data.words || [];
          if (words.length === 0) {
            setInitializing(false);
            return;
          }

          const existing = loadSession(topicId);

          // ═══════════════════════════════════════════════
          //  TODO: sau này lưu session lên server thay vì localStorage
          // ═══════════════════════════════════════════════
          if (existing && !existing.completed && existing.topicId === topicId) {
            setSession(existing);
            setCanResume(true);
          } else {
            const newSession = createNewSession(
              topicId,
              words.map((w: Word) => w.word_id),
            );
            persistSession(newSession);
            setSession(newSession);
          }

          setInitializing(false);
        }
      } catch {
        if (!cancelled) {
          setError("Không thể tải dữ liệu flashcard. Vui lòng thử lại sau.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  /* ---------- Derived data from session ---------- */

  const wordMap = useMemo(() => {
    const map = new Map<string, Word>();
    (topic?.words || []).forEach((w) => map.set(w.word_id, w));
    return map;
  }, [topic?.words]);

  const currentBatch = useMemo(
    () => (session?.currentBatchIds || []).map((id) => wordMap.get(id)).filter(Boolean) as Word[],
    [session?.currentBatchIds, wordMap],
  );

  const historyWords = useMemo(
    () => (session?.historyWordIds || []).map((id) => wordMap.get(id)).filter(Boolean) as Word[],
    [session?.historyWordIds, wordMap],
  );

  const combinedList = useMemo(
    () => [...historyWords, ...currentBatch],
    [historyWords, currentBatch],
  );

  const frontierIndex = historyWords.length + (session?.learnedCount || 0);

  const learnedWordIds = new Set(session?.learnedWordIds || []);
  const correctWordIds = new Set(session?.correctWordIds || []);
  const wrongLimitWordIds = new Set(session?.wrongLimitWordIds || []);

  const mode = session?.mode || "flashcard";

  /* ---------- Handlers ---------- */

  const handleResume = useCallback(() => {
    setCanResume(false);
  }, []);

  const handleRestart = useCallback(() => {
    if (!topicId || !topic) return;
    const newSession = createNewSession(
      topicId,
      topic.words.map((w) => w.word_id),
    );
    persistSession(newSession);
    setSession(newSession);
    setCanResume(false);
    setViewIndex(0);
  }, [topicId, topic]);

  const handleNext = useCallback(() => {
    if (mode !== "flashcard" || !session) return;
    if (viewIndex >= combinedList.length) return;

    const isAtFrontier = viewIndex === frontierIndex;
    if (isAtFrontier) {
      const updated = applyLearnWord(session);
      // ═══════════════════════════════════════════════
      //  TODO: sau này gửi session lên server
      // ═══════════════════════════════════════════════
      persistSession(updated);
      setSession(updated);
    }
    if (viewIndex < combinedList.length - 1) {
      setViewIndex((i) => i + 1);
    }
  }, [mode, viewIndex, frontierIndex, combinedList.length, session]);

  const handlePrev = useCallback(() => {
    setViewIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleQuizAnswer = useCallback(
    async (correct: boolean, wordId: string, timeMs: number) => {
      if (!session) return;
      if (correct) {
        const updated = applyQuizAnswer(session, wordId, true);
        // ═══════════════════════════════════════════════
        //  TODO: sau này gửi session lên server
        // ═══════════════════════════════════════════════
        persistSession(updated);
        setSession(updated);
      }
      try {
        await updateWordMastery({
          word_id: wordId,
          is_correct: correct,
          response_time_ms: timeMs,
          skill: "recognition",
        });
      } catch {
        // Silent fail
      }
    },
    [session],
  );

  const handleQuizComplete = useCallback(
    async (wrongWordIds: string[]) => {
      if (!session) return;
      const updated = applyQuizComplete(session, wrongWordIds);
      // ═══════════════════════════════════════════════
      //  TODO: sau này gửi session lên server
      // ═══════════════════════════════════════════════
      persistSession(updated);
      setSession(updated);
      setViewIndex(updated.historyWordIds.length);
    },
    [session],
  );

  const Divider = () => <hr className="border-t-2 border-amber-200 w-3/4 mx-auto my-3" />;

  const ExamplesList = ({ examples }: { examples?: Example[] }) => {
    if (!examples || examples.length === 0) return null;
    return (
      <div className="space-y-2 mt-2 px-4 w-full">
        <div className="text-xs uppercase tracking-widest text-amber-600/70 font-medium mb-2">Ví dụ</div>
        {examples.map((ex, i) => (
          <div key={i} className="text-sm text-gray-600 border-l-2 border-amber-300 pl-3 text-left">
            <div className="italic">"{ex.content}"</div>
            {ex.meaning && <div className="text-xs text-gray-400 mt-0.5">{ex.meaning}</div>}
          </div>
        ))}
      </div>
    );
  };

  const renderFrontBack = (
    item: Word,
    settingsArg: FlashcardSettings,
    strokeDuration: number,
    charStartIndices: number[],
    isFlipped: boolean,
    animVersion: number,
  ): { front: ReactNode; back: ReactNode } => {
    const wordContent = (
      <>
        {renderWordWithKanji(
          item.text,
          "text-6xl font-jp font-bold text-gray-800",
          strokeDuration,
          charStartIndices,
          isFlipped,
          animVersion,
        )}
      </>
    );

    const meaningContent = (
      <div className="text-4xl font-bold text-gray-800">{item.meaning}</div>
    );

    const detailContent = (
      <div className="text-center space-y-1 w-full px-4">
        <div className="text-3xl">{item.reading || "―"}</div>
        <Divider />
        <div className="text-3xl font-bold">{item.meaning}</div>
        <Divider />
        <ExamplesList examples={item.examples} />
      </div>
    );

    const detailContentMeaningFirst = (
      <div className="text-center space-y-1 w-full px-4">
        <div>
          {renderWordWithKanji(
            item.text,
            "text-4xl font-jp font-bold text-gray-800",
            strokeDuration,
            charStartIndices,
            isFlipped,
            animVersion,
          )}
        </div>
        {item.reading && <div className="text-lg text-gray-500">{item.reading}</div>}
        <Divider />
        <ExamplesList examples={item.examples} />
      </div>
    );

    const front = settingsArg.displayOrder === "word-first" ? wordContent : meaningContent;
    const back = settingsArg.displayOrder === "word-first" ? detailContent : detailContentMeaningFirst;

    return { front, back };
  };

  const currentWord = combinedList[viewIndex] ?? null;

  const a = {
    border: "border-rose-100",
    bgGradient: "from-white via-rose-50/40 to-amber-50/30",
    text: "text-rose-500/80",
    border2: "border-rose-200",
  };

  // Tính phần trăm tiến độ
  const totalWords = topic?.words?.length ?? 1;
  const learnedRatio = learnedWordIds.size / totalWords;
  const completedRatio = (correctWordIds.size + wrongLimitWordIds.size) / totalWords;
  const progressPercent = Math.min(100, Math.round(((learnedRatio + completedRatio) / 2) * 100));

  const answered = session?.learnedWordIds.length || 0;
  const totalQuestions = session?.shuffledWordIds.length || 0;

  /* ---------- Render ---------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto" />
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
        </div>
      </div>
    );
  }

  const words = topic?.words || [];

  if (!initializing && words.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-gray-500">Chưa có từ vựng để học.</p>
          <Button
            kind="text"
            color="rose"
            size="lg"
            icon={ChevronLeft}
            iconPosition="left"
            onClick={() => navigate(PATHS.topic(topic?.topic_id))}
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const nextDisabled =
    combinedList.length === 0 ||
    (viewIndex === combinedList.length - 1 && viewIndex !== frontierIndex);

  return (
    <div className="grow flex flex-col">
      <div className="w-full text-start"><Button
        kind="text"
        color="rose"
        size="lg"
        icon={ChevronLeft}
        iconPosition="left"
        onClick={() => navigate(PATHS.topic(topic?.topic_id))}
        className="mb-6"
        spacing="none"
      >
        Quay lại
      </Button></div>

      {/* Header */}
      <Card
        kind="solid"
        color="rose"
        className="mb-8"
        hoverEffect={false}
        item={{
          id: '' + topic?.topic_id,
          title: '' + topic?.name,
          progress: progressPercent,
          icon: Sparkles
        }}
        menuItems={[
          {
            icon: Pencil, label: settings.displayOrder === "word-first" ? "Từ → Nghĩa" : "Nghĩa → Từ", onClick: () =>
              setSettings({
                ...settings,
                displayOrder: settings.displayOrder === "word-first" ? "meaning-first" : "word-first",
              })
          },
          {
            icon: Share2, label: settings.strokeSpeed === "slow" ? "1x" : settings.strokeSpeed === "fast" ? "2x" : "✕", onClick: () => {
              const next =
                settings.strokeSpeed === "slow" ? "fast" : settings.strokeSpeed === "fast" ? "skip" : "slow";
              setSettings({ ...settings, strokeSpeed: next });
            }
          },
          {
            icon: Pencil,
            label: settings.enableWritingPractice ? "Luyện viết" : "Ẩn luyện viết",
            onClick: () => setSettings({ ...settings, enableWritingPractice: !settings.enableWritingPractice }),
          },
        ]}
        loading={topic === null}
      />

      {/* Resume prompt */}
      {canResume && session ? (
        <div className="grow flex flex-col items-center justify-center py-12">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white via-rose-50/30 to-amber-50/20 p-8 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-rose-500/80 font-medium mb-2">
                Tiếp tục học flashcard
              </p>
              <p className="text-gray-600 mb-2">
                Bạn đã học <strong>{answered}</strong> / {totalQuestions} từ.
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Bạn có muốn tiếp tục từ vị trí đã dừng không?
              </p>

              <div className="flex gap-3 justify-center">
                <Button
                  kind="solid"
                  color="rose"
                  size="xl"
                  spacing="lg"
                  icon={Play}
                  iconPosition="left"
                  onClick={handleResume}
                >
                  Tiếp tục
                </Button>
                <Button
                  kind="outline"
                  color="rose"
                  size="xl"
                  spacing="lg"
                  icon={RotateCcw}
                  iconPosition="left"
                  onClick={handleRestart}
                >
                  Làm lại
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : mode === "done" ? (
        <div className="grow flex flex-col items-center justify-center py-12">
          <div className="max-w-lg w-full space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Hoàn thành!</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Bạn đã học xong tất cả các từ trong chủ đề này.
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 grid-rows-2 gap-4">
              <div className="row-span-2">
                <ActionButton
                  kind="soft"
                  subtitle="Đã học flashcard"
                  title={'' + learnedWordIds.size}
                  size="4xl"
                  color="rose"
                  className="w-full h-full"
                  isHover={false}
                />
              </div>
              <ActionButton
                kind="soft"
                subtitle="Đã ghi nhớ tạm thời"
                title={'' + correctWordIds.size}
                size="4xl"
                color="green"
                className="w-full h-full"
                isHover={false}
              />
              <ActionButton
                kind="soft"
                subtitle="Chưa ghi nhớ"
                title={'' + wrongLimitWordIds.size}
                size="4xl"
                color="amber"
                className="w-full h-full"
                isHover={false}
              />
            </div>

            {/* Back button */}
            <div className="flex justify-center">
              <Button
                kind="solid"
                color="rose"
                size="xl"
                spacing="lg"
                icon={ChevronLeft}
                iconPosition="left"
                onClick={() => navigate(PATHS.topic(topic?.topic_id))}
              >
                Quay lại chủ đề
              </Button>
            </div>
          </div>
        </div>
      ) : mode === "quiz" ? (
        <MultichoiceQuiz
          words={currentBatch}
          totalWords={combinedList}
          onComplete={handleQuizComplete}
          onAnswer={handleQuizAnswer}
        />
      ) : (
        <>
          <Flashcard<Word>
            item={currentWord}
            settings={settings}
            accent="rose"
            getCharForStroke={(item) => item.text}
            renderFrontBack={renderFrontBack}
          />

          <div className="flex items-center justify-center gap-4 pb-6">
            <button
              onClick={handlePrev}
              disabled={viewIndex === 0}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${a.border2} text-rose-700 bg-white hover:bg-rose-50`}
            >
              <ChevronLeft size={18} /> Trước
            </button>
            <button
              onClick={handleNext}
              disabled={nextDisabled}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${a.border2} text-rose-700 bg-white hover:bg-rose-50`}
            >
              Sau
              <ChevronRight size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};