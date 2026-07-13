import { useMemo, useState } from "react";
import { Volume2, Check, X, ArrowRight } from "lucide-react";
import type { Word } from "../model";

type QuizType = 1 | 2 | 3;

type MultichoiceQuizProps = {
  words: Word[];
  /** Called when the quiz is done. Receives the word_ids answered incorrectly. */
  onComplete: (wrongWordIds: string[]) => void;
  /** Called each time user answers a question (before moving to next). */
  onAnswer?: (correct: boolean, wordId: string) => void;
};

function randomQuizType(): QuizType {
  return (Math.floor(Math.random() * 3) + 1) as QuizType;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function MultichoiceQuiz({ words, onComplete, onAnswer }: MultichoiceQuizProps) {
  // Thứ tự hỏi các từ trong batch (cố định 1 lần khi mount)
  const [order] = useState(() => shuffle(words));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [quizType, setQuizType] = useState<QuizType>(() => randomQuizType());

  if (words.length < 2) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <p className="text-center text-gray-500">Cần ít nhất 2 từ để bắt đầu quiz.</p>
        </div>
      </div>
    );
  }

  const currentWord = order[currentIndex];

  const handleAnswer = (wasWrong: boolean) => {
    const nextWrongIds = wasWrong ? [...wrongIds, currentWord.word_id] : wrongIds;

    // Thông báo kết quả realtime cho parent
    onAnswer?.(!wasWrong, currentWord.word_id);

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
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {quizType === 1 && (
          <PageOne key={pageKey} words={words} questionWord={currentWord} onNext={handleAnswer} />
        )}
        {quizType === 2 && (
          <PageTwo key={pageKey} words={words} questionWord={currentWord} onNext={handleAnswer} />
        )}
        {quizType === 3 && (
          <PageThree key={pageKey} words={words} questionWord={currentWord} onNext={handleAnswer} />
        )}
      </div>
    </div>
  );
}

/* ---------- Page 1: Multiple choice ---------- */
function PageOne({
  words,
  questionWord,
  onNext,
}: {
  words: Word[];
  questionWord: Word;
  onNext: (wasWrong: boolean) => void;
}) {
  const options = useMemo(() => {
    const correct = questionWord.meaning;
    const others = words
      .filter((w) => w.word_id !== questionWord.word_id)
      .map((w) => w.meaning)
      .filter((m) => m !== correct);
    const shuffled = shuffle(others).slice(0, 3);
    return shuffle([correct, ...shuffled]);
  }, [words, questionWord]);

  const correct = options.indexOf(questionWord.meaning);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  return (
    <div className="space-y-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Chọn đáp án đúng
      </p>
      <h2 className="text-2xl font-bold">Đâu là nghĩa của từ "{questionWord.text}"?</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((opt, i) => {
          const isSelected = selected === i;
          const showResult = checked;
          const isCorrectOpt = i === correct;
          return (
            <button
              key={opt}
              onClick={() => !checked && setSelected(i)}
              className={`rounded-2xl border-2 px-4 py-4 text-left font-medium transition-all ${showResult
                  ? isCorrectOpt
                    ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
                    : isSelected
                      ? "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
                      : "border-border opacity-50"
                  : isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-accent"
                }`}
            >
              <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded border border-current text-xs">
                {i + 1}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      <FeedbackBar
        selected={selected}
        correct={correct}
        checked={checked}
        onCheck={() => setChecked(true)}
        onNext={() => onNext(selected !== correct)}
      />
    </div>
  );
}

/* ---------- Page 2: Listening ---------- */
function PageTwo({
  words,
  questionWord,
  onNext,
}: {
  words: Word[];
  questionWord: Word;
  onNext: (wasWrong: boolean) => void;
}) {
  const options = useMemo(() => {
    const correct = questionWord.text;
    const others = words
      .filter((w) => w.word_id !== questionWord.word_id)
      .map((w) => w.text)
      .filter((t) => t !== correct);
    const shuffled = shuffle(others).slice(0, 3);
    return shuffle([correct, ...shuffled]);
  }, [words, questionWord]);

  const correct = options.indexOf(questionWord.text);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

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
        <button
          onClick={playAudio}
          className="group flex items-center gap-4 rounded-2xl bg-primary px-8 py-6 text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <Volume2 className="h-10 w-10" />
          <span className="text-lg font-semibold">Nhấn để nghe</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((opt, i) => {
          const isSelected = selected === i;
          const showResult = checked;
          const isCorrectOpt = i === correct;
          return (
            <button
              key={opt}
              onClick={() => !checked && setSelected(i)}
              className={`rounded-2xl border-2 px-4 py-4 text-left font-medium transition-all ${showResult
                  ? isCorrectOpt
                    ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
                    : isSelected
                      ? "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
                      : "border-border opacity-50"
                  : isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-accent"
                }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <FeedbackBar
        selected={selected}
        correct={correct}
        checked={checked}
        onCheck={() => setChecked(true)}
        onNext={() => onNext(selected !== correct)}
      />
    </div>
  );
}

/* ---------- Page 3: Fill blanks by tapping words ---------- */
function PageThree({
  words,
  questionWord,
  onNext,
}: {
  words: Word[];
  questionWord: Word;
  onNext: (wasWrong: boolean) => void;
}) {
  const example = questionWord.examples?.[0];
  const hasExample = !!example?.content;

  const blanksCount = 1;
  const correctAnswer = [questionWord.text];
  const bank = useMemo(() => {
    const others = words.filter((w) => w.word_id !== questionWord.word_id).map((w) => w.text);
    const shuffled = shuffle(others).slice(0, 3);
    return shuffle([questionWord.text, ...shuffled]);
  }, [words, questionWord]);

  const [picked, setPicked] = useState<{ word: string; from: number }[]>([]);
  const [used, setUsed] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);

  const pickWord = (word: string, idx: number) => {
    if (checked || used.has(idx) || picked.length >= blanksCount) return;
    setPicked([...picked, { word, from: idx }]);
    setUsed(new Set([...used, idx]));
  };

  const removeAt = (i: number) => {
    if (checked) return;
    const item = picked[i];
    const nextUsed = new Set(used);
    nextUsed.delete(item.from);
    setUsed(nextUsed);
    setPicked(picked.filter((_, idx) => idx !== i));
  };

  const isCorrect =
    picked.length === blanksCount && picked.every((p, i) => p.word === correctAnswer[i]);

  return (
    <div className="space-y-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {hasExample ? "Điền từ còn thiếu vào câu" : "Chọn từ đúng"}
      </p>
      <h2 className="text-2xl font-bold">
        {hasExample
          ? `Dịch: "${example?.meaning || questionWord.meaning}"`
          : `Chọn từ "${questionWord.meaning}"`}
      </h2>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 text-lg">
        {hasExample ? (
          <>
            {example.content.split(questionWord.text).map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 &&
                  (picked[0] ? (
                    <button
                      onClick={() => removeAt(0)}
                      className="rounded-lg border-b-4 border-primary/60 bg-primary px-3 py-1 font-semibold text-primary-foreground shadow"
                    >
                      {picked[0].word}
                    </button>
                  ) : (
                    <span className="inline-block min-w-16 border-b-2 border-foreground/60 pb-1">
                      &nbsp;
                    </span>
                  ))}
              </span>
            ))}
          </>
        ) : (
          <>
            {(questionWord?.reading || "").split(" ").map((r, index) => (
              <span key={`${r}-${index}`}>___ </span>
            ))}
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {(questionWord?.reading || "").split(" ").map((r, i) => {
          return (
            <button
              key={r}
              onClick={() => pickWord(r, i)}
              className={`rounded-lg border-b-4 px-4 py-2 font-semibold transition-all`}
            >
              {r}
            </button>
          );
        })}
      </div>

      <FeedbackBar
        selected={picked.length === blanksCount ? (isCorrect ? 0 : 1) : null}
        correct={0}
        checked={checked}
        onCheck={() => setChecked(true)}
        onNext={() => onNext(!isCorrect)}
      />
    </div>
  );
}

/* ---------- Shared feedback / action bar ---------- */
function FeedbackBar({
  selected,
  correct,
  checked,
  onCheck,
  onNext,
}: {
  selected: number | null;
  correct: number;
  checked: boolean;
  onCheck: () => void;
  onNext: () => void;
}) {
  const isCorrect = selected === correct;

  if (!checked) {
    return (
      <button
        onClick={onCheck}
        disabled={selected === null}
        className="w-full rounded-xl bg-primary py-4 text-lg font-bold uppercase tracking-wide text-primary-foreground shadow disabled:cursor-not-allowed disabled:opacity-40"
      >
        Kiểm tra
      </button>
    );
  }

  return (
    <div
      className={`rounded-2xl p-5 ${isCorrect
          ? "bg-green-500/10 text-green-700 dark:text-green-400"
          : "bg-destructive/10 text-destructive"
        }`}
    >
      <div className="mb-3 flex items-center gap-2 text-lg font-bold">
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
      <button
        onClick={onNext}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 font-bold uppercase text-background"
      >
        Tiếp tục <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}