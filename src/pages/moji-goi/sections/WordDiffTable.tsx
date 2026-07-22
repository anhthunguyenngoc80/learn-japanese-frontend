import { useMemo } from "react";
import { Check, X, Plus, Minus } from "lucide-react";

import type { Word } from "../../../model";
import { Button } from "../../../components";

export type DiffStatus = "added" | "removed" | "modified" | "unchanged";

export interface WordDiff {
  status: DiffStatus;
  /** Chỉ số của từ trong danh sách cũ (nếu có) */
  oldIndex?: number;
  /** Chỉ số của từ trong danh sách mới (nếu có) */
  newIndex?: number;
  /** Từ cũ (có thể undefined nếu là thêm mới) */
  oldWord?: Word;
  /** Từ mới (có thể undefined nếu là xóa) */
  newWord?: Partial<Word>;
  /** Trường bị thay đổi nếu status=modified */
  changedFields?: string[];
}

interface WordDiffTableProps {
  diffs: WordDiff[];
  /** Danh sách các diff đã được chấp nhận (index) */
  acceptedChanges: Set<number>;
  onToggleAccept: (diffIndex: number) => void;
  onAcceptAll: () => void;
  onDeclineAll: () => void;
  loading?: boolean;
}

const STATUS_CONFIG = {
  added: {
    label: "Thêm",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-300",
    rowClass: "bg-emerald-50/40",
    icon: Plus,
    iconClass: "text-emerald-600",
  },
  removed: {
    label: "Xóa",
    badgeClass: "bg-red-100 text-red-700 border-red-300",
    rowClass: "bg-red-50/40",
    icon: Minus,
    iconClass: "text-red-600",
  },
  modified: {
    label: "Sửa",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-300",
    rowClass: "bg-amber-50/40",
    icon: X as React.FC<{ className?: string; size?: number }>,
    iconClass: "text-amber-600",
  },
  unchanged: {
    label: "",
    badgeClass: "",
    rowClass: "",
    icon: Check as React.FC<{ className?: string; size?: number }>,
    iconClass: "text-gray-400",
  },
};

const WordDiffRow = ({
  diff,
  diffIndex,
  isAccepted,
  onToggleAccept,
}: {
  diff: WordDiff;
  diffIndex: number;
  isAccepted: boolean;
  onToggleAccept: (i: number) => void;
}) => {
  const cfg = STATUS_CONFIG[diff.status];
  const StatusIcon = cfg.icon;
  const wordToDisplay = diff.newWord ?? diff.oldWord;

  if (diff.status === "unchanged") return null;

  return (
    <div
      className={`rounded-xl border transition-all ${
        isAccepted ? "border-gray-200 opacity-60" : cfg.rowClass
      } border`}
    >
      <div className="flex items-start gap-4 p-4">
        {/* Checkbox chấp nhận */}
        <button
          onClick={() => onToggleAccept(diffIndex)}
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
            isAccepted
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-gray-300 hover:border-emerald-400"
          }`}
          aria-label={isAccepted ? "Bỏ chọn" : "Chấp nhận thay đổi"}
        >
          {isAccepted && <Check size={14} />}
        </button>

        {/* Badge trạng thái + nội dung thay đổi */}
        <div className="min-w-0 flex-1 space-y-2">
          {/* Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.badgeClass}`}
            >
              <StatusIcon size={12} className={cfg.iconClass} />
              {cfg.label}
            </span>
            {diff.status === "modified" && diff.changedFields && (
              <span className="text-[11px] text-gray-500">
                Thay đổi: {diff.changedFields.join(", ")}
              </span>
            )}
          </div>

          {/* Nội dung diff */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Cột cũ (nếu có) */}
            {diff.oldWord && (
              <div className="rounded-lg border border-red-200 bg-red-50/60 p-3">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-red-500">
                  Cũ
                </div>
                <div className="space-y-1 text-sm">
                  {diff.status === "removed" && (
                    <p className="font-bold text-gray-900 line-through">
                      {diff.oldWord.text}
                    </p>
                  )}
                  {diff.status === "modified" && diff.oldWord.text && (
                    <p className="font-bold text-gray-900 line-through">
                      {diff.oldWord.text}
                    </p>
                  )}
                  {diff.oldWord.reading && (
                    <p className="text-gray-600 line-through">
                      {diff.oldWord.reading}
                    </p>
                  )}
                  {diff.oldWord.meaning && (
                    <p className="text-gray-600 line-through">
                      {diff.oldWord.meaning}
                    </p>
                  )}
                  {diff.oldWord.partOfSpeech && (
                    <p className="text-gray-400 line-through">
                      {diff.oldWord.partOfSpeech}
                    </p>
                  )}
                  {diff.oldWord.examples && diff.oldWord.examples.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {diff.oldWord.examples.map((ex, i) => (
                        <p key={i} className="text-gray-500 line-through text-xs">
                          {ex.content} {ex.meaning ? `— ${ex.meaning}` : ""}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cột mới (nếu có) */}
            {wordToDisplay && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                  Mới
                </div>
                <div className="space-y-1 text-sm">
                  {(diff.newWord as any)?.text && (
                    <p className="font-bold text-gray-900">
                      {(diff.newWord as any).text}
                    </p>
                  )}
                  {(diff.newWord as any)?.reading && (
                    <p className="text-gray-600">
                      {(diff.newWord as any).reading}
                    </p>
                  )}
                  {(diff.newWord as any)?.meaning && (
                    <p className="text-gray-600">
                      {(diff.newWord as any).meaning}
                    </p>
                  )}
                  {(diff.newWord as any)?.partOfSpeech && (
                    <p className="text-gray-400">
                      {(diff.newWord as any).partOfSpeech}
                    </p>
                  )}
                  {(diff.newWord as any)?.examples &&
                    (diff.newWord as any).examples.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {(diff.newWord as any).examples.map(
                          (ex: { content: string; meaning?: string }, i: number) => (
                            <p key={i} className="text-gray-500 text-xs">
                              {ex.content} {ex.meaning ? `— ${ex.meaning}` : ""}
                            </p>
                          ),
                        )}
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const WordDiffTable = ({
  diffs,
  acceptedChanges,
  onToggleAccept,
  onAcceptAll,
  onDeclineAll,
  loading = false,
}: WordDiffTableProps) => {
  const visibleDiffs = useMemo(
    () => diffs.filter((d) => d.status !== "unchanged"),
    [diffs],
  );

  const allAccepted = visibleDiffs.every((_, i) => {
    const realIndex = diffs.findIndex(
      (d, idx) => d.status !== "unchanged" && idx === i,
    );
    return acceptedChanges.has(realIndex);
  });

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          So sánh thay đổi ({visibleDiffs.length} thay đổi)
        </h3>
        <div className="flex items-center gap-2">
          <Button
            kind="outline"
            color="emerald"
            size="sm"
            onClick={onAcceptAll}
            disabled={loading || allAccepted}
            icon={Check}
            iconPosition="left"
          >
            Chấp nhận tất cả
          </Button>
          <Button
            kind="outline"
            color="red"
            size="sm"
            onClick={onDeclineAll}
            disabled={loading}
            icon={X}
            iconPosition="left"
          >
            Từ chối tất cả
          </Button>
        </div>
      </div>

      {/* Danh sách các diff */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      )}

      {!loading && visibleDiffs.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center text-gray-500">
          Không có thay đổi nào để hiển thị
        </div>
      )}

      <div className="space-y-3">
        {diffs.map((diff, index) => (
          <WordDiffRow
            key={index}
            diff={diff}
            diffIndex={index}
            isAccepted={acceptedChanges.has(index)}
            onToggleAccept={onToggleAccept}
          />
        ))}
      </div>
    </div>
  );
};