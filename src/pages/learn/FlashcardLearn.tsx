import { useParams, useLocation } from "react-router-dom";
import { Flashcard, renderWordWithKanji, type FlashcardSettings } from "../../components/Flashcard";
import type { Word } from "../../model";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Main Flashcard Page                                                */
/* ------------------------------------------------------------------ */
export const FlashcardLearnPage = () => {
  const { topicId } = useParams();
  const location = useLocation();
  const state = location.state as { words?: Word[]; topicName?: string } | null;

  const words = state?.words ?? [];

  return (
    <Flashcard<Word>
      items={words}
      settingsKey={`flashcard-settings-${topicId}`}
      title={state?.topicName ?? "Flashcard"}
      subtitle="Học Flashcard"
      accent="rose"
      emptyTitle="Không có từ vựng để học"
      emptyDescription="Vui lòng chọn một bộ từ vựng từ danh sách."
      getCharForStroke={(item) => item.text}
      renderFrontBack={(item: Word, settings: FlashcardSettings, strokeDuration: number, charStartIndices: number[], wordIndex: number, isFlipped: boolean, animVersion: number): { front: ReactNode; back: ReactNode } => {
        const front = settings.displayOrder === "word-first" ? (
          <>
            {renderWordWithKanji(item.text, "text-6xl font-jp font-bold text-gray-800", strokeDuration, charStartIndices, wordIndex, isFlipped, animVersion)}
            {item.reading && (
              <div className="text-2xl text-gray-600">{item.reading}</div>
            )}
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-gray-800">{item.meaning}</div>
            {item.examples && item.examples.length > 0 && (
              <div className="text-lg text-gray-600 italic">"{item.examples[0].content}"</div>
            )}
          </div>
        );

        const back = settings.displayOrder === "word-first" ? (
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-gray-800">{item.meaning}</div>
            {item.examples && item.examples.length > 0 && (
              <div className="text-lg text-gray-600 italic">"{item.examples[0].content}"</div>
            )}
          </div>
        ) : (
          <>
            {renderWordWithKanji(item.text, "text-6xl font-jp font-bold text-gray-800", strokeDuration, charStartIndices, wordIndex, isFlipped, animVersion)}
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