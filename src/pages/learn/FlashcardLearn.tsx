import { useParams, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import {
  Button,
  Card,
  Flashcard,
  MultichoiceQuiz,
  renderWordWithKanji,
  type FlashcardSettings,
} from "../../components";
import { getFlashcardReview, updateWordMastery } from "../../api";
import type { Topic, Word } from "../../model";
import { ChevronLeft, ChevronRight, Pencil, Share2, Sparkles } from "lucide-react";
import { PATHS } from "../../constant";
import { ActionButton } from "../../components/Button";

const BATCH_SIZE = 4;
const MAX_WRONG = 3; // số lần sai tối đa trước khi từ được coi là "hoàn thành"

type Mode = "flashcard" | "quiz" | "done";

type ReviewEntry = {
  wordId: string;
  wrongCount: number;
  readyAt: number;
};

type LearnState = {
  currentBatch: Word[];
  reviewQueue: ReviewEntry[];
  nextWordIndex: number;
  learnedCount: number;
  mode: Mode;
  round: number;
  historyWords: Word[];
  learnedWordIds: Set<string>;     // từ đã xem qua flashcard (duy nhất)
  correctWordIds: Set<string>;     // từ đã trả lời đúng trong quiz (duy nhất)
  wrongLimitWordIds: Set<string>;  // từ đã sai đủ MAX_WRONG lần, coi như hoàn thành
};

type LearnAction =
  | { type: "INIT"; words: Word[] }
  | { type: "LEARN_WORD" }
  | { type: "QUIZ_ANSWER"; wordId: string; correct: boolean }
  | { type: "QUIZ_COMPLETE"; wrongWordIds: string[]; allWords: Word[] };

const initialLearnState: LearnState = {
  currentBatch: [],
  reviewQueue: [],
  nextWordIndex: 0,
  learnedCount: 0,
  mode: "flashcard",
  round: 0,
  historyWords: [],
  learnedWordIds: new Set(),
  correctWordIds: new Set(),
  wrongLimitWordIds: new Set(),
};

function buildNextBatch(
  allWords: Word[],
  nextWordIndex: number,
  reviewQueue: ReviewEntry[],
  buildRound: number,
) {
  const batch: Word[] = [];
  const usedReviewIds = new Set<string>();
  const usedNotReadyIds = new Set<string>();

  const readyEntries = reviewQueue
    .filter((r) => r.readyAt <= buildRound)
    .sort((a, b) => b.wrongCount - a.wrongCount);

  for (const entry of readyEntries) {
    if (batch.length >= BATCH_SIZE) break;
    const word = allWords.find((w) => w.word_id === entry.wordId);
    if (word) {
      batch.push(word);
      usedReviewIds.add(entry.wordId);
    }
  }

  let idx = nextWordIndex;
  while (batch.length < BATCH_SIZE && idx < allWords.length) {
    batch.push(allWords[idx]);
    idx++;
  }

  const noFreshLeft = idx >= allWords.length;

  if (batch.length < BATCH_SIZE && noFreshLeft) {
    const notReadyEntries = reviewQueue
      .filter((r) => !usedReviewIds.has(r.wordId))
      .sort((a, b) => b.wrongCount - a.wrongCount);

    for (const entry of notReadyEntries) {
      if (batch.length >= BATCH_SIZE) break;
      const word = allWords.find((w) => w.word_id === entry.wordId);
      if (word) {
        batch.push(word);
        usedNotReadyIds.add(entry.wordId);
      }
    }
  }

  // Chỉ xóa các entry đã sẵn sàng khỏi queue (đã được review đúng hạn),
  // giữ lại các entry not-ready để bảo toàn wrongCount qua các vòng lặp
  const remainingQueue = reviewQueue.filter((r) => !usedReviewIds.has(r.wordId));

  return { batch, newNextIndex: idx, remainingQueue };
}

function learnReducer(state: LearnState, action: LearnAction): LearnState {
  switch (action.type) {
    case "INIT": {
      const { batch, newNextIndex, remainingQueue } = buildNextBatch(action.words, 0, [], 1);
      return {
        ...initialLearnState,
        currentBatch: batch,
        nextWordIndex: newNextIndex,
        reviewQueue: remainingQueue,
        round: 0,
        mode: batch.length > 0 ? "flashcard" : "done",
      };
    }

    case "LEARN_WORD": {
      const word = state.currentBatch[state.learnedCount];
      const newLearnedWordIds = word
        ? new Set(state.learnedWordIds).add(word.word_id)
        : state.learnedWordIds;

      const newLearnedCount = state.learnedCount + 1;
      if (newLearnedCount >= state.currentBatch.length && state.currentBatch.length > 0) {
        return { ...state, learnedCount: 0, mode: "quiz", learnedWordIds: newLearnedWordIds };
      }
      return { ...state, learnedCount: newLearnedCount, learnedWordIds: newLearnedWordIds };
    }

    case "QUIZ_ANSWER": {
      if (!action.correct) return state; // trả lời sai: không cộng tiến độ ở đây,
      // việc xử lý review/giới hạn sai đã có ở QUIZ_COMPLETE
      const newCorrectWordIds = new Set(state.correctWordIds);
      newCorrectWordIds.add(action.wordId);
      return { ...state, correctWordIds: newCorrectWordIds };
    }

    case "QUIZ_COMPLETE": {
      const { wrongWordIds, allWords } = action;
      const completedRound = state.round + 1;

      const currentBatchIds = state.currentBatch.map((w) => w.word_id);
      const correctIds = currentBatchIds.filter((id) => !wrongWordIds.includes(id));

      const newCorrectWordIds = new Set(state.correctWordIds);
      correctIds.forEach((id) => newCorrectWordIds.add(id));

      let updatedQueue = state.reviewQueue.filter((r) => !correctIds.includes(r.wordId));

      const newWrongLimitWordIds = new Set(state.wrongLimitWordIds);

      for (const id of wrongWordIds) {
        const existing = updatedQueue.find((r) => r.wordId === id);
        if (existing) {
          existing.wrongCount += 1;
          existing.readyAt = completedRound + 2;
          if (existing.wrongCount >= MAX_WRONG) {
            newWrongLimitWordIds.add(id);
            updatedQueue = updatedQueue.filter((r) => r.wordId !== id);
          }
        } else {
          updatedQueue.push({ wordId: id, wrongCount: 1, readyAt: completedRound + 2 });
        }
      }

      const buildRound = completedRound + 1;
      const { batch, newNextIndex, remainingQueue } = buildNextBatch(
        allWords,
        state.nextWordIndex,
        updatedQueue,
        buildRound,
      );

      const newHistory = [...state.historyWords, ...state.currentBatch];

      if (batch.length === 0 && remainingQueue.length === 0) {
        return {
          ...state,
          currentBatch: [],
          reviewQueue: [],
          mode: "done",
          historyWords: newHistory,
          round: completedRound,
          correctWordIds: newCorrectWordIds,
          wrongLimitWordIds: newWrongLimitWordIds,
        };
      }

      return {
        ...state,
        currentBatch: batch,
        reviewQueue: remainingQueue,
        nextWordIndex: newNextIndex,
        learnedCount: 0,
        mode: "flashcard",
        historyWords: newHistory,
        round: completedRound,
        correctWordIds: newCorrectWordIds,
        wrongLimitWordIds: newWrongLimitWordIds,
      };
    }

    default:
      return state;
  }
}

export const FlashcardLearnPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [learnState, dispatch] = useReducer(learnReducer, initialLearnState);
  const {
    currentBatch: currentLearningBatch,
    mode,
    historyWords,
    learnedCount,
    learnedWordIds,
    correctWordIds,
    wrongLimitWordIds,
  } = learnState;

  const combinedList = useMemo(
    () => [...historyWords, ...currentLearningBatch],
    [historyWords, currentLearningBatch],
  );

  const frontierIndex = historyWords.length + learnedCount;

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

  useEffect(() => {
    if (!topicId) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getFlashcardReview(topicId, { limit: 20 });
        if (!cancelled) {
          setTopic(response.data);
          const words = response.data.words || [];
          dispatch({ type: "INIT", words });
        }
      } catch (err) {
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

  useEffect(() => {
    setViewIndex(historyWords.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLearningBatch]);

  const handleNext = useCallback(() => {
    if (mode !== "flashcard") return;
    if (viewIndex >= combinedList.length) return;

    const isAtFrontier = viewIndex === frontierIndex;
    if (isAtFrontier) {
      dispatch({ type: "LEARN_WORD" });
    }
    if (viewIndex < combinedList.length - 1) {
      setViewIndex((i) => i + 1);
    }
  }, [mode, viewIndex, frontierIndex, combinedList.length]);

  const handlePrev = useCallback(() => {
    setViewIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleQuizComplete = useCallback(
    async (wrongWordIds: string[]) => {
      const allWords = topic?.words || [];
      dispatch({ type: "QUIZ_COMPLETE", wrongWordIds, allWords });
    },
    [topic?.words],
  );

  const renderFrontBack = (
    item: Word,
    settingsArg: FlashcardSettings,
    strokeDuration: number,
    charStartIndices: number[],
    isFlipped: boolean,
    animVersion: number,
  ): { front: ReactNode; back: ReactNode } => {
    const front =
      settingsArg.displayOrder === "word-first" ? (
        <>
          {renderWordWithKanji(
            item.text,
            "text-6xl font-jp font-bold text-gray-800",
            strokeDuration,
            charStartIndices,
            isFlipped,
            animVersion,
          )}
          {item.reading && <div className="text-2xl text-gray-600">{item.reading}</div>}
        </>
      ) : (
        <div className="text-center space-y-4">
          <div className="text-4xl font-bold text-gray-800">{item.meaning}</div>
          {item.examples && item.examples.length > 0 && (
            <div className="text-lg text-gray-600 italic">"{item.examples[0].content}"</div>
          )}
        </div>
      );

    const back =
      settingsArg.displayOrder === "word-first" ? (
        <div className="text-center space-y-4">
          <div className="text-4xl font-bold text-gray-800">{item.meaning}</div>
          {item.examples && item.examples.length > 0 && (
            <div className="text-lg text-gray-600 italic">"{item.examples[0].content}"</div>
          )}
        </div>
      ) : (
        <>
          {renderWordWithKanji(
            item.text,
            "text-6xl font-jp font-bold text-gray-800",
            strokeDuration,
            charStartIndices,
            isFlipped,
            animVersion,
          )}
          {item.reading && <div className="text-2xl text-gray-600">{item.reading}</div>}
        </>
      );

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

      {mode === "done" ? (
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
          words={currentLearningBatch}
          totalWords={combinedList}
          onComplete={handleQuizComplete}
          onAnswer={async (correct, wordId, timeMs) => {
            if (correct)
              dispatch({ type: "QUIZ_ANSWER", wordId, correct: true });
            try {
              await updateWordMastery({ word_id: wordId, is_correct: correct, response_time_ms: timeMs, skill: "recognition" });
            } catch {
              // Silent fail — không ảnh hưởng trải nghiệm học
            }
          }}
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