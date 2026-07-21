import { Check, X, ArrowRight } from "lucide-react";
import type { Word } from "../model";
import { Button } from "./Button";

type FeedbackBarProps = {
  selected: number | null;
  correct: number;
  checked: boolean;
  onCheck: () => void;
  onNext: () => void;
  questionWord: Word;
};

export function FeedbackBar({
  selected,
  correct,
  checked,
  onCheck,
  onNext,
  questionWord,
}: FeedbackBarProps) {
  const isCorrect = selected === correct;

  if (!checked) {
    return (
      <Button
        kind="solid"
        size="xl"
        spacing="lg"
        onClick={onCheck}
        disabled={selected === null}
        className="w-full uppercase tracking-wide"
      >
        Kiểm tra
      </Button>
    );
  }

  return (
    <div
      className={`rounded-2xl p-5 ${
        isCorrect
          ? "bg-green-500/10 text-green-700 dark:text-green-400"
          : "bg-destructive/10 text-destructive"
      }`}
    >
      <div className="mb-3 flex items-center gap-2 text-base font-bold">
        {isCorrect ? (
          <>
            <Check className="h-6 w-6" /> Chính xác!
          </>
        ) : (
          <>
            <X className="h-6 w-6" /> Chưa đúng, thử lại nhé
          </>
        )}
      </div>
      <div className="mb-3 text-xl text-left">
        {questionWord.text}
        {questionWord.reading ? ` (${questionWord.reading})` : ""}: {questionWord.meaning}
      </div>
      <Button
        kind="solid"
        color={isCorrect ? "green" : "red"}
        size="xl"
        spacing="lg"
        icon={ArrowRight}
        iconPosition="right"
        onClick={onNext}
        className="w-full uppercase tracking-wide"
      >
        Tiếp tục
      </Button>
    </div>
  );
}