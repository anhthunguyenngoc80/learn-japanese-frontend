import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Sparkles, RotateCcw, Play } from "lucide-react";
import { getPracticeWords, updateWordMastery } from "../../api";
import { Card, MultichoiceQuiz } from "../../components";
import { Button } from "../../components/Button";
import { PATHS } from "../../constant";
import type { Word } from "../../model";

/* ------------------------------------------------------------------ */
/*  Types & helpers (local session — backend update later)            */
/* ------------------------------------------------------------------ */

interface PracticeAnswer {
  wordId: string;
  correct: boolean;
  timeMs: number;
}

interface PracticeSession {
  topicId: string;
  shuffledWordIds: string[];
  currentIndex: number;
  answers: PracticeAnswer[];
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

const SESSION_PREFIX = "practice-session-";

function sessionKey(topicId: string) {
  return `${SESSION_PREFIX}${topicId}`;
}

function loadSession(topicId: string): PracticeSession | null {
  try {
    const raw = localStorage.getItem(sessionKey(topicId));
    return raw ? (JSON.parse(raw) as PracticeSession) : null;
  } catch {
    return null;
  }
}

function persistSession(session: PracticeSession) {
  session.updatedAt = new Date().toISOString();
  localStorage.setItem(sessionKey(session.topicId), JSON.stringify(session));
}

function createNewSession(topicId: string, wordIds: string[]): PracticeSession {
  return {
    topicId,
    shuffledWordIds: shuffleArray(wordIds),
    currentIndex: 0,
    answers: [],
    completed: false,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/*  PracticeQuizPage                                                   */
/* ------------------------------------------------------------------ */

export const PracticeQuizPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState<{ name: string; topic_id: string; words: Word[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Session state
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [canResume, setCanResume] = useState(false);

  /* ---------- Load topic data ---------- */
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
            // Có session chưa hoàn tất → cho user chọn tiếp tục
            setSession(existing);
            setCanResume(true);
          } else {
            // Không có session hoặc đã hoàn tất → tạo mới
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
          setError("Không thể tải dữ liệu bài tập. Vui lòng thử lại sau.");
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
  }, [topicId, topic]);

  const handleAnswer = useCallback(
    async (correct: boolean, wordId: string, timeMs: number) => {
      if (!session || !topicId) return;

      const newAnswers: PracticeAnswer[] = [
        ...session.answers,
        { wordId, correct, timeMs },
      ];
      const newIndex = session.currentIndex + 1;

      const updated: PracticeSession = {
        ...session,
        currentIndex: newIndex,
        answers: newAnswers,
        completed: newIndex >= session.shuffledWordIds.length,
        updatedAt: new Date().toISOString(),
      };

      // ═══════════════════════════════════════════════
      //  TODO: sau này gửi session lên server
      // ═══════════════════════════════════════════════
      persistSession(updated);
      setSession(updated);

      // Update mastery backend (fire & forget)
      try {
        await updateWordMastery({
          word_id: wordId,
          is_correct: correct,
          response_time_ms: timeMs,
          skill: "recognition",
        });
      } catch {
        /* silent */
      }
    },
    [session, topicId],
  );

  const handleComplete = useCallback(
    async (_wrongWordIds: string[]) => {
      navigate(PATHS.topic(topic?.topic_id));
    },
    [navigate, topic?.topic_id],
  );

  /* ---------- Derived ---------- */

  // Những từ còn lại (chưa trả lời) dựa trên session
  const quizWords = useMemo((): Word[] => {
    if (!session || !topic) return [];
    const allWords = topic.words || [];
    const wordMap = new Map(allWords.map((w) => [w.word_id, w]));
    const remainingIds = session.shuffledWordIds.slice(session.currentIndex);
    return remainingIds
      .map((id) => wordMap.get(id))
      .filter(Boolean) as Word[];
  }, [session, topic]);

  // Tổng số từ (dùng làm distractor pool cho MultichoiceQuiz)
  const totalWords = topic?.words || [];

  const progressPercent = useMemo(() => {
    if (!session) return 0;
    const total = session.shuffledWordIds.length || 1;
    return Math.min(100, Math.round((session.currentIndex / total) * 100));
  }, [session]);

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
          <p className="text-gray-500">Chưa có từ vựng để luyện tập.</p>
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

  const answered = session?.answers.length || 0;
  const totalQuestions = session?.shuffledWordIds.length || 0;

  return (
    <div className="grow flex flex-col">
      <div className="w-full text-start">
        <Button
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
        </Button>
      </div>

      <Card
        kind="solid"
        color="rose"
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

      {/* Resume prompt */}
      {canResume && session ? (
        <div className="grow flex flex-col items-center justify-center py-12">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white via-rose-50/30 to-amber-50/20 p-8 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-rose-500/80 font-medium mb-2">
                Tiếp tục luyện tập
              </p>
              <p className="text-gray-600 mb-2">
                Bạn đã trả lời <strong>{answered}</strong> / {totalQuestions} câu.
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
      ) : session && quizWords.length > 0 ? (
        <MultichoiceQuiz
          key={`quiz-${session.currentIndex}`}
          words={quizWords}
          totalWords={totalWords}
          onComplete={handleComplete}
          onAnswer={handleAnswer}
        />
      ) : session && session.completed ? (
        <div className="grow flex flex-col items-center justify-center py-12">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="rounded-3xl border border-rose-100 bg-white p-8 shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Hoàn thành!</h2>
              <p className="text-gray-500 mb-6">
                Bạn đã hoàn thành bài tập trắc nghiệm.
              </p>
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
      ) : null}
    </div>
  );
};