import { useMemo, useRef, useState } from "react";
import type { Word } from "../model";
import { Button } from "./Button";
import { FeedbackBar } from "./FeedbackBar";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

type PageOneQuizProps = {
  words: Word[];
  totalWords: Word[];
  questionWord: Word;
  onNext: (wasWrong: boolean, timeMs: number) => void;
};

/**
 * Page 1: Multiple choice – choose the correct meaning of a word.
 */
export function PageOneQuiz({
  totalWords,
  questionWord,
  onNext,
}: PageOneQuizProps) {
  const options = useMemo(() => {
    const correct = questionWord.meaning;
    const others = totalWords
      .filter((w) => w.word_id !== questionWord.word_id)
      .map((w) => w.meaning)
      .filter((m) => m !== correct);
    const shuffled = shuffle(others).slice(0, 3);
    return shuffle([correct, ...shuffled]);
  }, [totalWords, questionWord]);

  const correct = options.indexOf(questionWord.meaning);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  // Thời điểm câu hỏi xuất hiện (khi component mount)
  const startTimeRef = useRef<number>(Date.now());
  const [answerTimeMs, setAnswerTimeMs] = useState(0);

  const handleCheck = () => {
    setAnswerTimeMs(Date.now() - startTimeRef.current);
    setChecked(true);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Chọn đáp án đúng
      </p>
      <h2 className="text-2xl font-bold">Đâu là nghĩa của từ "{questionWord.text}"?</h2>

      <div className="h-100 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {options.map((opt, i) => {
          const isSelected = selected === i;
          const showResult = checked;
          const isCorrectOpt = i === correct;
          return (
            <Button
              key={opt}
              kind="outline"
              borderWidth="md"
              spacing="md"
              size="2xl"
              onClick={() => !checked && setSelected(i)}
              selected={isSelected}
              isHover={!showResult}
              className={`text-left justify-start h-full ${
                showResult
                  ? isCorrectOpt
                    ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
                    : isSelected
                      ? "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
                      : ""
                  : ""
              }`}
            >
              <span
                className={`mr-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-lg text-white ${
                  showResult
                    ? isCorrectOpt
                      ? "bg-green-700"
                      : "bg-red-700"
                    : "bg-rose-700"
                } `}
              >
                {i + 1}
              </span>
              {opt}
            </Button>
          );
        })}
      </div>

      <FeedbackBar
        selected={selected}
        correct={correct}
        checked={checked}
        onCheck={handleCheck}
        onNext={() => onNext(selected !== correct, answerTimeMs)}
        questionWord={questionWord}
      />
    </div>
  );
}