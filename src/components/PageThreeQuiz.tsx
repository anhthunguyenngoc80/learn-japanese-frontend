import { useCallback, useEffect, useRef, useState } from "react";
import type { Word } from "../model";
import {
  WordMatchGameBoard,
  type WordMatchGameBoardHandle,
} from "./WordMatchGameBoard";
import { FeedbackBar } from "./FeedbackBar";

type PageThreeQuizProps = {
  words: Word[];
  questionWord: Word;
  onNext: (wasWrong: boolean, timeMs: number) => void;
};

/**
 * Page 3: Word match game – uses WordMatchGameBoard internally.
 * Only shows the current questionWord, then reports the result via onNext.
 */
export function PageThreeQuiz({
  words: _words,
  questionWord,
  onNext,
}: PageThreeQuizProps) {
  const gameRef = useRef<WordMatchGameBoardHandle>(null);
  const startTimeRef = useRef<number>(Date.now());
  const [answerTimeMs, setAnswerTimeMs] = useState(0);

  // Track whether the current puzzle has been answered (checked)
  const [checked, setChecked] = useState(false);
  const [canCheck, setCanCheck] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Track the result when WordMatchGameBoard completes the single word
  const [completed, setCompleted] = useState(false);

  const handleCanCheckChange = useCallback((can: boolean) => {
    setCanCheck(can);
  }, []);

  const handleComplete = useCallback(
    (correctCount: number, _totalAttempted: number) => {
      // For a single word puzzle:
      // - If correctCount > 0 => the user answered correctly on the final attempt
      // - We record the answer as correct only if they got it right
      const wasCorrect = correctCount > 0;
      setIsCorrect(wasCorrect);
      setChecked(true);
      setCompleted(true);
    },
    [],
  );

  const handleCheck = () => {
    if (!gameRef.current) return;
    setAnswerTimeMs(Date.now() - startTimeRef.current);
    gameRef.current.check();
  };

  const handleNext = () => {
    onNext(!isCorrect, answerTimeMs);
  };

  // Reset timer when questionWord changes
  useEffect(() => {
    startTimeRef.current = Date.now();
    setChecked(false);
    setCompleted(false);
    setCanCheck(false);
    setIsCorrect(false);
    setAnswerTimeMs(0);
  }, [questionWord.word_id]);

  return (
    <div className="space-y-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Chọn và sắp xếp các chữ để tạo thành cách đọc đúng
      </p>

      <WordMatchGameBoard
        key={questionWord.word_id}
        ref={gameRef}
        words={[questionWord]}
        onComplete={handleComplete}
        onCanCheckChange={handleCanCheckChange}
      />

      {!checked && (
        <FeedbackBar
          selected={canCheck ? 0 : null}
          correct={0}
          checked={false}
          onCheck={handleCheck}
          onNext={() => {}}
          questionWord={questionWord}
        />
      )}

      {checked && completed && (
        <FeedbackBar
          selected={isCorrect ? 0 : 1}
          correct={0}
          checked={true}
          onCheck={() => {}}
          onNext={handleNext}
          questionWord={questionWord}
        />
      )}
    </div>
  );
}