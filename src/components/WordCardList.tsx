import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Quote } from "lucide-react";
import { Button } from "./Button";
import {
  accentMap,
  accentFromTopic,
  type AccentColor,
  type AccentStyles,
} from "../constant/styleConstant";
import type { Word, Example } from "../model";

type CreateWord = Omit<Word, "word_id" | "topic_id">;

// ─── Props ──────────────────────────────────────────────────────────
export interface WordCardListProps {
  /** Dữ liệu các thẻ từ - sử dụng type Word từ model */
  items: CreateWord[];
  /** Icon hiển thị cạnh tiêu đề */
  icon?: ReactNode;
  /** Tiêu đề của khối */
  title: string;
  /** Nút hành động (ví dụ "Thêm") */
  actionButton?: ReactNode;
  /**
   * Topic được truyền vào — quyết định màu viền của các thẻ.
   * Có thể là số (thứ tự topic) hoặc chuỗi định danh.
   */
  topic?: string | number;
  /** Số thứ tự topic hiển thị ở góc trên-trái của thẻ. Nếu không truyền và topic là số, dùng luôn topic. */
  topicIndex?: number;
  /** Ghi đè màu accent nếu muốn */
  accent?: AccentColor;
  /** Class bổ sung cho wrapper */
  className?: string;
}

// ─── Word Card ──────────────────────────────────────────────────────
function WordCard({
  word,
  accent,
  topicIndex,
}: {
  word: CreateWord;
  accent: AccentStyles;
  topicIndex?: number;
}) {
  const [open, setOpen] = useState(false);
  const examples = word.examples ?? [];
  const exampleCount = examples.length;

  return (
    <div
      className={`relative rounded-xl border-2 ${accent.border} ${accent.cardHoverBorder} bg-white p-4 pl-5 shadow-sm transition-all hover:shadow-md`}
    >
      {/* Số thứ tự topic ở góc trên-trái */}
      {topicIndex != null && (
        <div
          className={`absolute -left-2 -top-2 flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-bold shadow-sm ${accent.badgeBg} ${accent.badgeText}`}
        >
          {topicIndex}
        </div>
      )}
      {/* Header của thẻ: từ + meta */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <h4 className="text-base font-semibold text-gray-900">
              {word.text}
            </h4>
            {word.reading && (
              <span className="text-xs text-gray-500">{word.reading}</span>
            )}
          </div>
          {word.meaning && (
            <div className="mt-1 text-sm text-gray-700">{word.meaning}</div>
          )}
          {word.partOfSpeech && (
            <div className="mt-1 text-xs text-gray-500 italic">
              {word.partOfSpeech}
            </div>
          )}
        </div>
      </div>
      {/* Toggle ví dụ */}
      {exampleCount > 0 && (
        <div className="mt-3">
          <Button
            type="button"
            
            size="sm"
            onClick={() => setOpen((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${accent.chipBg} ${accent.chipText} ${accent.chipHover}`}
            icon={open ? ChevronDown : ChevronRight}
            iconPosition="left"
          >
            {open ? "Ẩn ví dụ" : `${exampleCount} ví dụ`}
          </Button>
          {open && (
            <ul className="mt-3 space-y-2">
              {examples.map((ex: Example, i: number) => (
                <li
                  key={i}
                  className={`flex gap-2 rounded-lg ${accent.exampleBg} p-2.5 pl-3`}
                >
                  <span
                    className={`mt-0.5 w-0.5 shrink-0 rounded ${accent.exampleBar}`}
                    aria-hidden
                  />
                  <div className="flex-1 text-sm text-gray-700">
                    <Quote
                      className={`mr-1 inline h-3 w-3 ${accent.icon}`}
                      aria-hidden
                    />
                    {ex.content}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Component chính ────────────────────────────────────────────────
export const WordCardList = ({
  items,
  icon,
  title,
  actionButton,
  topic,
  topicIndex,
  accent,
  className = "",
}: WordCardListProps) => {
  const resolvedAccent: AccentColor =
    accent ?? (topic != null ? accentFromTopic(topic) : "amber");
  const s = accentMap[resolvedAccent];
  const resolvedTopicIndex =
    topicIndex ?? (typeof topic === "number" ? topic : undefined);

  return (
    <div
      className={`rounded-2xl border ${s.border} bg-white shadow-sm overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className={`px-5 py-4 border-b ${s.headerDivider} ${s.headerBg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <span className={s.icon}>{icon}</span>}
            <h3 className="font-semibold text-gray-800">{title}</h3>
          </div>
          {actionButton && <div>{actionButton}</div>}
        </div>
      </div>
      {/* Danh sách thẻ */}
      <div className="p-4">
        {items.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-400">
            Không có dữ liệu
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {items.map((word, index) => (
              <WordCard
                key={`word-${index}`}
                word={word}
                accent={s}
                topicIndex={resolvedTopicIndex}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WordCardList;
