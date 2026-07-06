import { X } from "lucide-react";
import type { CreateWord } from "../../../model";
import { IconButton } from "../../../components";

export const WordPreviewTable = ({
  words,
  compact = false,
}: {
  words: CreateWord[];
  compact?: boolean;
}) => (
  <div
    className={`rounded-xl border border-amber-100 bg-white overflow-hidden ${
      compact ? "max-h-[420px] overflow-y-auto" : ""
    }`}
  >
    <p className="px-4 py-2 text-xs font-semibold text-gray-500 border-b border-amber-50">
      Xem trước ({words.length} từ)
    </p>
    <ul className="divide-y divide-amber-50 text-sm">
      {words.map((w, i) => (
        <li key={i} className="px-4 py-2 flex items-center gap-3">
          <span className="text-gray-400 w-6 shrink-0">{i + 1}.</span>
          <span className="font-medium text-gray-800 shrink-0">{w.text}</span>
          <span className="text-gray-400 shrink-0">{w.reading}</span>
          <span className="text-gray-500 truncate">{w.meaning}</span>
          <IconButton
            aria-label="abc"
            color="slate"
            icon={X}
            size="sm"
            spacing="sm"
          />
        </li>
      ))}
    </ul>
  </div>
);
