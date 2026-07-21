import { useMemo, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import type { Word } from "../model";
import { Button } from "./Button";
import { FeedbackBar } from "./FeedbackBar";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

type PageTwoQuizProps = {
  words: Word[];
  totalWords: Word[];
  questionWord: Word;
  onNext: (wasWrong: boolean, timeMs: number) => void;
};

/**
 * Page 2: Listening – hear the word and choose the correct text.
 */
export function PageTwoQuiz({
  totalWords,
  questionWord,
  onNext,
}: PageTwoQuizProps) {
  const options = useMemo(() => {
    const correct = questionWord.text;
    const others = totalWords
      .filter((w) => w.word_id !== questionWord.word_id)
      .map((w) => w.text)
      .filter((t) => t !== correct);
    const shuffled = shuffle(others).slice(0, 3);
    return shuffle([correct, ...shuffled]);
  }, [totalWords, questionWord]);

  const correct = options.indexOf(questionWord.text);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  // Thời điểm câu hỏi xuất hiện (khi component mount)
  const startTimeRef = useRef<number>(Date.now());
  const [answerTimeMs, setAnswerTimeMs] = useState(0);

  const handleCheck = () => {
    setAnswerTimeMs(Date.now() - startTimeRef.current);
    setChecked(true);
  };

  const playAudio = () => {
    const u = new SpeechSynthesisUtterance(questionWord.text);
    u.lang = "ja-JP";
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Nghe và chọn từ bạn nghe được
      </p>

      <div className="flex justify-center py-6">
        <Button
          kind="elevated"
          icon={Volume2}
          size="2xl"
          spacing="lg"
          onClick={playAudio}
        >
          Nhấn để nghe
        </Button>
      </div>

      <div className="h-100 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              color={showResult ? (isCorrectOpt ? "green" : "red") : "rose"}
              size="2xl"
              onClick={() => !checked && setSelected(i)}
              selected={isSelected || (showResult && isCorrectOpt)}
              isHover={!showResult}
              className="text-left justify-start h-full"
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