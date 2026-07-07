import { useState } from "react";
import type { AccentStyles } from "../../../constant/styleConstant";
import type { CreateExample, CreateWord } from "../../../model";
import { Button, IconButton } from "../../../components/Button";
import { ChevronDown, ChevronRight, Pencil, Quote, Trash2 } from "lucide-react";

// ─── Word Card ──────────────────────────────────────────────────────
export const WordCard = ({
  word,
  accent,
  topicIndex,
  onEdit,
  onDelete,
}: {
  word: CreateWord;
  accent: AccentStyles;
  topicIndex?: number;
  onEdit?: (word: CreateWord) => void;
  onDelete?: (word: CreateWord) => void;
}) => {
  const [open, setOpen] = useState(false);
  const exampleCount = word.examples?.length ?? 0;

  return (
    <div
      className={`group relative rounded-xl border-2 ${accent.border} ${accent.cardHoverBorder} bg-white p-4 pl-5 shadow-sm transition-all hover:shadow-md`}
    >
      {/* Số thứ tự topic ở góc trên-trái */}
      {topicIndex != null && (
        <div
          className={`absolute -left-2 -top-2 flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-bold shadow-sm ${accent.badgeBg} ${accent.badgeText}`}
        >
          {topicIndex}
        </div>
      )}

      {/* Nút Sửa / Xóa ở góc trên-phải */}
      {(onEdit || onDelete) && (
        <div className="absolute right-3 top-3 flex items-center gap-1">
          {onEdit && (
            <IconButton
              icon={Pencil}
              kind="ghost"
              spacing="xs"
              color="slate"
              size="sm"
              onClick={() => onEdit(word)}
              aria-label="Sửa từ"
            >
            </IconButton>
          )}
          {onDelete && (
            <IconButton
              icon={Trash2}
              kind="ghost"
              spacing="xs"
              color="slate"
              size="sm"
              onClick={() => onDelete(word)}
              aria-label="Xóa từ"
            >
            </IconButton>
          )}
        </div>
      )}

      {/* Header của thẻ: từ + meta */}
      <div className="flex items-start justify-between gap-3 pr-14">
        <div className="min-w-0 flex-1">
          <div>
            <h4 className="text-start text-base font-semibold text-gray-900">
              {word.text}
            </h4>
            <div className="flex flex-wrap items-baseline gap-2">
            {word.reading && (
              <span className="text-xs text-gray-500">{word.reading}</span>
            )}
            {word.sv_word && (
              <span className="text-xs text-gray-500">{word.sv_word}</span>
            )}
            </div>
          </div>

          {word.meaning && (
            <div className="text-start mt-1.5 text-sm text-gray-700">{word.meaning}</div>
          )}

          {word.partOfSpeech && (
            <div className="mt-1 text-xs italic text-gray-500">
              {word.partOfSpeech}
            </div>
          )}
        </div>
      </div>

      {/* Toggle ví dụ */}
      {exampleCount > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-3">
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
              {word.examples?.map((ex: CreateExample, i: number) => (
                <li
                  key={i}
                  className={`flex gap-2 rounded-lg ${accent.exampleBg} p-2.5 pl-3`}
                >
                  <span
                    className={`mt-0.5 w-0.5 shrink-0 rounded ${accent.exampleBar}`}
                    aria-hidden
                  />
                  <div className="flex-1 text-start text-sm text-gray-700">
                    <div>
                      {i + 1}. {ex.content}
                    </div>
                    <div className="mt-0.5 text-gray-500">{ex.meaning}</div>
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