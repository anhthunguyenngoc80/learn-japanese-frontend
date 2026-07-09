import { useState } from "react";
import { X } from "lucide-react";
import { Button, IconButton } from "../../../components";
import type { CreateTopic } from "../../../model";
import {
  accentCycle,
  accentMap,
  type AccentColor,
} from "../../../constant/styleConstant";

export interface TopicCardProps {
  topic: CreateTopic;
  index: number;
  wordsLength: number;
  rangeFrom: string;
  rangeTo: string;
  onRangeFromChange: (value: string) => void;
  onRangeToChange: (value: string) => void;
  onAssign: () => void;
  onDelete: () => void;
}

interface AssignmentRow {
  from: string;
  to: string;
}

export const TopicCard = ({
  topic,
  index,
  wordsLength,
  rangeFrom,
  rangeTo,
  onRangeFromChange,
  onRangeToChange,
  onAssign,
  onDelete,
}: TopicCardProps) => {
  const [savedAssignments, setSavedAssignments] = useState<AssignmentRow[]>([]);
  const accentColor: AccentColor =
    accentCycle[index % accentCycle.length];
  const color = accentMap[accentColor];

  const handleAssign = () => {
    if (!rangeFrom.trim() && !rangeTo.trim()) return;

    setSavedAssignments((prev) => [
      ...prev,
      { from: rangeFrom || "1", to: rangeTo || String(wordsLength) },
    ]);
    onAssign();
    onRangeFromChange("");
    onRangeToChange("");
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md ${color.bg}`}
    >
      {/* Thanh nhấn màu bên trái */}
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 w-1.5 rounded-l-2xl ${color.dot}`}
      />

      {/* Header */}
      <div className="mb-3 flex items-center justify-between pl-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm ring-2 ring-white ${color.dot}`}
          >
            {index + 1}
          </span>

          <span
            className={`truncate text-sm font-bold tracking-tight ${color.text}`}
          >
            {topic.name}
          </span>

          <span className="shrink-0 text-[11px] font-medium text-gray-400">
            ({topic.words.length} từ)
          </span>
        </div>

        <IconButton
          aria-label="Xoá chủ đề"
          kind="ghost"
          icon={X}
          size="sm"
          color={accentColor}
          className="h-6 w-6 opacity-60 transition-opacity hover:opacity-100 !p-0"
          onClick={onDelete}
        />
      </div>

      {/* Các khoảng đã gán */}
      {savedAssignments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5 pl-2">
          {savedAssignments.map((row, i) => (
            <div
              key={i}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px]`}
            >
              <span className="text-gray-500">Từ số</span>

              <span className="font-semibold tabular-nums text-gray-700">
                {row.from}
              </span>

              <span className="text-gray-500">tới</span>

              <span className="font-semibold tabular-nums text-gray-700">
                {row.to}
              </span>

              <span className="ml-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                ✓ Đã gán
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Dòng nhập khoảng */}
      <div className="flex items-center gap-2 pl-2">
        <span className="shrink-0 text-[11px] font-medium text-gray-500">
          Từ số
        </span>

        <input
          placeholder="1"
          value={rangeFrom}
          onChange={(e) => onRangeFromChange(e.target.value)}
          className={`w-14 rounded-lg border border-gray-200 bg-white px-2 py-1 text-center text-xs text-gray-700 outline-none transition focus:ring-2 focus:ring-offset-1 ${color.ring}`}
        />

        <span className="shrink-0 text-[11px] font-medium text-gray-500">
          tới
        </span>

        <input
          placeholder={String(wordsLength)}
          value={rangeTo}
          onChange={(e) => onRangeToChange(e.target.value)}
          className={`w-14 rounded-lg border border-gray-200 bg-white px-2 py-1 text-center text-xs text-gray-700 outline-none transition focus:ring-2 focus:ring-offset-1 ${color.ring}`}
        />

        <div className="flex-1" />

        <Button
          kind="soft"
          color={accentColor}
          size="sm"
          spacing="xxs"
          radius="sm"
          className="text-[11px] font-semibold"
          onClick={handleAssign}
        >
          Gán
        </Button>
      </div>
    </div>
  );
};
