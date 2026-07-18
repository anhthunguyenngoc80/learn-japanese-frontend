import { useMemo, useRef, useState } from "react";
import { Volume2, Check, X, ArrowRight } from "lucide-react";
import type { Word } from "../model";
import { Button } from "./Button";

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

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function MultichoiceQuiz({ words, totalWords, onComplete, onAnswer }: MultichoiceQuizProps) {
  // Thứ tự hỏi các từ trong batch (cố định 1 lần khi mount)
  const [order] = useState(() => shuffle(words));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [quizType, setQuizType] = useState<QuizType>(() => randomQuizType());

  const currentWord = order[currentIndex];

  const handleAnswer = (wasWrong: boolean, timeMs: number) => {
    const nextWrongIds = wasWrong ? [...wrongIds, currentWord.word_id] : wrongIds;

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
          <PageOne key={pageKey} words={words} totalWords={totalWords} questionWord={currentWord} onNext={handleAnswer} />
        )}
        {quizType === 2 && (
          <PageTwo key={pageKey} words={words} totalWords={totalWords} questionWord={currentWord} onNext={handleAnswer} />
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
  totalWords,
  questionWord,
  onNext,
}: {
  words: Word[];
  totalWords: Word[];
  questionWord: Word;
  onNext: (wasWrong: boolean, timeMs: number) => void;
}) {
  const options = useMemo(() => {
    const correct = questionWord.meaning;
    const others = totalWords
      .filter((w) => w.word_id !== questionWord.word_id)
      .map((w) => w.meaning)
      .filter((m) => m !== correct);
    const shuffled = shuffle(others).slice(0, 3);
    return shuffle([correct, ...shuffled]);
  }, [words, questionWord]);

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
              className={`text-left justify-start h-full ${showResult ? isCorrectOpt
                ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400" : isSelected ? "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400" : "" : ""
                }`}
            >
              <span className={`mr-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-lg  text-white
                ${showResult ? isCorrectOpt ? "bg-green-700" : "bg-red-700"
                  : "bg-rose-700"} `}>
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

/* ---------- Page 2: Listening ---------- */
function PageTwo({
  words,
  totalWords,
  questionWord,
  onNext,
}: {
  words: Word[];
  totalWords: Word[];
  questionWord: Word;
  onNext: (wasWrong: boolean, timeMs: number) => void;
}) {
  const options = useMemo(() => {
    const correct = questionWord.text;
    const others = totalWords
      .filter((w) => w.word_id !== questionWord.word_id)
      .map((w) => w.text)
      .filter((t) => t !== correct);
    const shuffled = shuffle(others).slice(0, 3);
    return shuffle([correct, ...shuffled]);
  }, [words, questionWord]);

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
              color={showResult ? isCorrectOpt ? "green" : "red" : "rose"}
              size="2xl"
              onClick={() => !checked && setSelected(i)}
              selected={isSelected || (showResult && isCorrectOpt)}
              isHover={!showResult}
              className={`text-left justify-start h-full`}
            >
              <span className={`mr-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-lg text-white
                ${showResult ? isCorrectOpt ? "bg-green-700" : "bg-red-700"
                  : "bg-rose-700"} `}>
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

/* ---------- Page 3: Fill blanks by tapping characters ---------- */
function PageThree({
  words,
  questionWord,
  onNext,
}: {
  words: Word[];
  questionWord: Word;
  onNext: (wasWrong: boolean, timeMs: number) => void;
}) {
  // Tách reading thành từng ký tự (dùng Array.from để an toàn với unicode)
  const readingChars = Array.from(questionWord?.reading || questionWord?.text || "");
  const blanksCount = readingChars.length;
  const correctAnswer = readingChars;

  // Bank = các ký tự đúng (giữ nguyên số lượng, kể cả trùng lặp) + vài ký tự nhiễu, xáo trộn
  const bank = useMemo(() => {
    const pool = Array.from(
      new Set(
        words
          .filter((w) => w.word_id !== questionWord.word_id)
          .flatMap((w) => Array.from(w.reading || ""))
          .filter((c) => c.trim() !== "" && !readingChars.includes(c))
      )
    );

    const distractorCount = Math.min(3, pool.length);
    const distractors = shuffle(pool).slice(0, distractorCount);

    return shuffle([...readingChars, ...distractors]);
  }, [words, questionWord]);

  const [picked, setPicked] = useState<{ char: string; from: number }[]>([]);
  const [used, setUsed] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);

  // Thời điểm câu hỏi xuất hiện (khi component mount)
  const startTimeRef = useRef<number>(Date.now());
  const [answerTimeMs, setAnswerTimeMs] = useState(0);

  const pickChar = (char: string, idx: number) => {
    if (checked || used.has(idx) || picked.length >= blanksCount) return;
    setPicked([...picked, { char, from: idx }]);
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
    picked.length === blanksCount && picked.every((p, i) => p.char === correctAnswer[i]);

  const handleCheck = () => {
    setAnswerTimeMs(Date.now() - startTimeRef.current);
    setChecked(true);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Chọn và sắp xếp các chữ để tạo thành cách đọc đúng
      </p>
      <h2 className="text-2xl font-bold">{questionWord.text}</h2>

      {/* Blanks row – một gạch cho mỗi ký tự trong reading */}
      <div className="h-30 flex flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 text-lg">
        {Array.from({ length: blanksCount }).map((_, i) =>
          picked[i] ? (
            <Button
              key={i}
              kind="solid"
              color="rose"
              size="2xl"
              spacing="xs"
              onClick={() => removeAt(i)}
              className="border-b-4"
            >
              {picked[i].char}
            </Button>
          ) : (
            <span
              key={i}
              className="inline-block min-w-10 border-b-2 border-foreground/60 pb-1 text-center"
            >
              ＿
            </span>
          )
        )}
      </div>

      {/* Bank – các ký tự đúng + nhiễu, xáo trộn */}
      <p className="text-sm text-muted-foreground">Chọn theo thứ tự:</p>
      <div className="flex flex-wrap gap-2">
        {bank.map((c, i) => {
          const isUsed = used.has(i);
          const isFull = picked.length >= blanksCount;
          return (
            <Button
              kind="soft"
              color={isUsed || isFull ? "slate" : "rose"}
              size="2xl"
              spacing="xs"
              key={`${c}-${i}`}
              onClick={() => pickChar(c, i)}
              disabled={isUsed || isFull}
              className={`border-b-4 ${isUsed || isFull
                ? "cursor-not-allowed"
                : "border-rose-300"
                }`}
            >
              {c}
            </Button>
          );
        })}
      </div>

      <FeedbackBar
        selected={picked.length === blanksCount ? (isCorrect ? 0 : 1) : null}
        correct={0}
        checked={checked}
        onCheck={handleCheck}
        onNext={() => onNext(!isCorrect, answerTimeMs)}
        questionWord={questionWord}
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
  questionWord,
}: {
  selected: number | null;
  correct: number;
  checked: boolean;
  onCheck: () => void;
  onNext: () => void;
  questionWord: Word;
}) {
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
      className={`rounded-2xl p-5 ${isCorrect
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