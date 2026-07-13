import { useParams } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import {
  Flashcard,
  renderWordWithKanji,
  type FlashcardSettings,
} from "../../components";
import { getFlashcardReview } from "../../api";
import type { Topic, Word } from "../../model";

/* ------------------------------------------------------------------ */
/*  Main Flashcard Page                                                */
/* ------------------------------------------------------------------ */
export const FlashcardLearnPage = () => {
  const { topicId } = useParams();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        }
      } catch (err) {
        if (!cancelled) {
          setError("Không thể tải dữ liệu flashcard. Vui lòng thử lại sau.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [topicId]);

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

  return (
    <Flashcard<Word>
      items={topic?.words || []}
      settingsKey={`flashcard-settings-${topicId}`}
      title={topic?.name ?? "Flashcard"}
      subtitle="Học Flashcard"
      accent="rose"
      emptyTitle="Không có từ vựng để học"
      emptyDescription="Vui lòng chọn một bộ từ vựng từ danh sách."
      getCharForStroke={(item) => item.text}
      renderFrontBack={(
        item: Word,
        settings: FlashcardSettings,
        strokeDuration: number,
        charStartIndices: number[],
        wordIndex: number,
        isFlipped: boolean,
        animVersion: number,
      ): { front: ReactNode; back: ReactNode } => {
        const front =
          settings.displayOrder === "word-first" ? (
            <>
              {renderWordWithKanji(
                item.text,
                "text-6xl font-jp font-bold text-gray-800",
                strokeDuration,
                charStartIndices,
                wordIndex,
                isFlipped,
                animVersion,
              )}
              {item.reading && (
                <div className="text-2xl text-gray-600">{item.reading}</div>
              )}
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-gray-800">
                {item.meaning}
              </div>
              {item.examples && item.examples.length > 0 && (
                <div className="text-lg text-gray-600 italic">
                  "{item.examples[0].content}"
                </div>
              )}
            </div>
          );

        const back =
          settings.displayOrder === "word-first" ? (
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-gray-800">
                {item.meaning}
              </div>
              {item.examples && item.examples.length > 0 && (
                <div className="text-lg text-gray-600 italic">
                  "{item.examples[0].content}"
                </div>
              )}
            </div>
          ) : (
            <>
              {renderWordWithKanji(
                item.text,
                "text-6xl font-jp font-bold text-gray-800",
                strokeDuration,
                charStartIndices,
                wordIndex,
                isFlipped,
                animVersion,
              )}
              {item.reading && (
                <div className="text-2xl text-gray-600">{item.reading}</div>
              )}
            </>
          );

        return { front, back };
      }}
    />
  );
};
