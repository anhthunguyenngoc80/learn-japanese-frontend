import { useState } from "react";
import { shuffle } from "../utils/wordMatchGame";
import type { Word } from "../model";
import { PageOneQuiz } from "./PageOneQuiz";
import { PageTwoQuiz } from "./PageTwoQuiz";
import { PageThreeQuiz } from "./PageThreeQuiz";

type QuizType = 1 | 2 | 3;

type MultichoiceQuizProps = {
  words: Word[];
  totalWords: Word[];
  /** Called when the quiz is done. Receives the word_ids answered incorrectly. */
  onComplete: (wrongWordIds: string[]) => void;
  /** Called each time user answers a question (before moving to next). Receives time (ms) from question shown to answer submitted. */
  onAnswer?: (correct: boolean, wordId: string, timeMs: number) => void;
};

function randomQuizType(): QuizType {
  return (Math.floor(Math.random() * 3) + 1) as QuizType;
}

export function MultichoiceQuiz({
  words,
  totalWords,
  onComplete,
  onAnswer,
}: MultichoiceQuizProps) {
  // Thứ tự hỏi các từ trong batch (cố định 1 lần khi mount)
  const [order] = useState(() => shuffle(words));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [quizType, setQuizType] = useState<QuizType>(() => randomQuizType());

  const currentWord = order[currentIndex];

  const handleAnswer = (wasWrong: boolean, timeMs: number) => {
    const nextWrongIds = wasWrong
      ? [...wrongIds, currentWord.word_id]
      : wrongIds;

    // Thông báo kết quả realtime cho parent, kèm thời gian trả lời
    onAnswer?.(!wasWrong, currentWord.word_id, timeMs);

    if (currentIndex + 1 >= order.length) {
      // Đã hỏi hết các từ trong batch -> báo kết quả cho parent
      onComplete(nextWrongIds);
      return;
    }

    setWrongIds(nextWrongIds);
    setCurrentIndex((i) => i + 1);
    setQuizType(randomQuizType());
  };

  // key thay đổi theo từng câu để các Page component tự reset state nội bộ (selected, checked, ...)
  const pageKey = `${currentWord.word_id}-${currentIndex}`;

  return (
    <div className="bg-background text-foreground">
      <div className="">
        {quizType === 1 && (
          <PageOneQuiz
            key={pageKey}
            words={words}
            totalWords={totalWords}
            questionWord={currentWord}
            onNext={handleAnswer}
          />
        )}
        {quizType === 2 && (
          <PageTwoQuiz
            key={pageKey}
            words={words}
            totalWords={totalWords}
            questionWord={currentWord}
            onNext={handleAnswer}
          />
        )}
        {quizType === 3 && (
          <PageThreeQuiz
            key={pageKey}
            words={words}
            questionWord={currentWord}
            onNext={handleAnswer}
          />
        )}
      </div>
    </div>
  );
}