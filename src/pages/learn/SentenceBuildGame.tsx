import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Sparkles, RotateCcw } from "lucide-react";
import { getPracticeWords } from "../../api";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { PATHS } from "../../constant";
import {
  SentenceBuildBoard,
  type SentenceBuildBoardHandle,
} from "../../components/SentenceBuildBoard";
import { shuffle } from "../../utils/wordMatchGame";
import type { Word } from "../../model";

/* ────────────────────────────────────────────────────────────────── */
/*  Page component                                                    */
/* ────────────────────────────────────────────────────────────────── */

export const SentenceBuildGamePage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState<{
    name: string;
    topic_id: string;
    words: Word[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [allPlayable, setAllPlayable] = useState<Word[]>([]);

  /* ── game result ── */
  const [gameResult, setGameResult] = useState<{
    correctCount: number;
    totalAttempted: number;
  } | null>(null);

  /* ── ref to game board ── */
  const boardRef = useRef<SentenceBuildBoardHandle>(null);
  const [canCheck, setCanCheck] = useState(false);

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

          // Only keep words that have at least one example
          const playable = words.filter(
            (w) => w.examples && w.examples.length > 0,
          );

          if (playable.length === 0) {
            setAllPlayable([]);
            setLoading(false);
            return;
          }

          setAllPlayable(shuffle(playable));
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

  /* ── Handle game completion ── */
  const handleGameComplete = useCallback(
    (correctCount: number, totalAttempted: number) => {
      setGameResult({ correctCount, totalAttempted });
    },
    [],
  );

  /* ── Reset game ── */
  const handleRestart = useCallback(() => {
    setGameResult(null);
  }, []);

  /* ── Handle check button click ── */
  const handleCheck = useCallback(() => {
    boardRef.current?.check();
  }, []);

  /* ── Derived ── */
  const progressPercent =
    gameResult && gameResult.totalAttempted > 0
      ? Math.round((gameResult.correctCount / gameResult.totalAttempted) * 100)
      : 0;

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

  if (words.length === 0 || (!loading && allPlayable.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-gray-500">
            {words.length === 0
              ? "Chưa có từ vựng để chơi."
              : "Không có từ nào có ví dụ để chơi ghép câu."}
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

  // Game completed screen
  if (gameResult) {
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
                <strong className="text-emerald-600">
                  {gameResult.correctCount}
                </strong>{" "}
                / {gameResult.totalAttempted} câu.
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

  // Playing game
  {
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
            subtitle: "Hãy sắp xếp các từ để tạo thành câu đúng",
            icon: Sparkles,
          }}
          loading={topic === null}
        />

        <SentenceBuildBoard
          ref={boardRef}
          words={allPlayable}
          onComplete={handleGameComplete}
          onCanCheckChange={setCanCheck}
          color="rose"
        />

        {/* Check button — rendered by the page, not the component */}
        <div className="text-center pb-8">
          <Button
            kind="solid"
            color="emerald"
            size="xl"
            spacing="lg"
            onClick={handleCheck}
            disabled={!canCheck}
            className="w-full max-w-xs uppercase tracking-wide"
          >
            Kiểm tra
          </Button>
        </div>
      </div>
    );
  }

  return null;
};