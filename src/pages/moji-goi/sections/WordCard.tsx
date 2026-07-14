import { useState } from "react";

import type { AccentStyles } from "../../../constant/styleConstant";
import type { CreateExample, CreateWord, Word } from "../../../model";
import { Button, IconButton, LevelBadge } from "../../../components";

import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Check,
  X,
  Plus,
  Quote,
} from "lucide-react";

export const WordCard = ({
  word,
  accent,
  topicIndex,
  onEdit,
  onDelete,
}: {
  word: CreateWord | Word;
  accent?: AccentStyles;
  topicIndex?: number;
  onEdit?: (word: CreateWord | Word) => void;
  onDelete?: (word: CreateWord | Word) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<CreateWord | Word>(word);
  const exampleCount =
    (isEditing ? draft.examples?.length : word.examples?.length) ?? 0;

  const startEdit = () => {
    setDraft(word);
    setIsEditing(true);
    setOpen(true);
  };

  const cancelEdit = () => {
    setDraft(word);
    setIsEditing(false);
  };

  const saveEdit = () => {
    onEdit?.(draft);
    setIsEditing(false);
  };

  const updateField = <K extends keyof CreateWord>(
    field: K,
    value: CreateWord[K],
  ) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const updateExample = (
    index: number,
    field: keyof CreateExample,
    value: string,
  ) => {
    setDraft((prev) => {
      const examples = [...(prev.examples ?? [])];
      examples[index] = { ...examples[index], [field]: value };
      return { ...prev, examples };
    });
  };

  const addExample = () => {
    setDraft((prev) => ({
      ...prev,
      examples: [
        ...(prev.examples ?? []),
        { content: "", meaning: "" } as CreateExample,
      ],
    }));
    setOpen(true);
  };

  const removeExample = (index: number) => {
    setDraft((prev) => {
      const examples = [...(prev.examples ?? [])];
      examples.splice(index, 1);
      return { ...prev, examples };
    });
  };

  const inputBase = "bg-transparent border-none outline-none p-0 m-0";

  return (
    <div
      className={`w-70 group relative overflow-hidden rounded-2xl border ${accent?.border} ${accent?.cardHoverBorder} bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl`}
    >
      {/* Dải màu accent bên trái - điểm nhấn chính */}
      <div
        className={`absolute inset-y-0 left-0 w-1.5 ${accent?.exampleBar}`}
        aria-hidden
      />

      <div className="relative p-5 pl-7">
        {/* Badge số thứ tự */}
        {topicIndex != null && (
          <div
            className={`absolute -left-3 -top-3 flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 text-sm font-black shadow-md ring-4 ring-white ${accent?.badgeBg} ${accent?.badgeText}`}
          >
            {topicIndex}
          </div>
        )}

        {/* Tiến độ hình tròn + nút hành động ở góc phải trên */}
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {/* Tag trạng thái - nằm bên trái tiến độ */}
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap bg-gray-100 text-gray-500}`}
          >
            Chưa học
          </span>

          {word.overall_mastery != null && (
            <LevelBadge level="mastered" score={word.overall_mastery} size={50}></LevelBadge>
          )}

          <div className="flex items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">
            {isEditing ? (
              <>
                <IconButton
                  icon={Check}
                  kind="ghost"
                  spacing="xs"
                  color="slate"
                  size="sm"
                  onClick={saveEdit}
                  aria-label="Lưu"
                />
                <IconButton
                  icon={X}
                  kind="ghost"
                  spacing="xs"
                  color="slate"
                  size="sm"
                  onClick={cancelEdit}
                  aria-label="Hủy"
                />
              </>
            ) : (
              <>
                {onEdit && (
                  <IconButton
                    icon={Pencil}
                    kind="ghost"
                    spacing="xs"
                    color="slate"
                    size="sm"
                    onClick={startEdit}
                    aria-label="Sửa từ"
                  />
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
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Header: từ vựng nổi bật */}
        <div className="flex items-start justify-between gap-3 pr-14">
          <div className="min-w-0 flex-1">
            {/* Từ chính */}
            {isEditing ? (
              <input
                type="text"
                value={draft.text}
                onChange={(e) => updateField("text", e.target.value)}
                className={`${inputBase} block w-full text-start text-2xl font-bold tracking-tight text-gray-900`}
                placeholder="Từ vựng"
              />
            ) : (
              <h4 className="text-start text-2xl font-bold tracking-tight text-gray-900 leading-tight">
                {word.text}
              </h4>
            )}

            {/* Reading + sv_word */}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={draft.reading ?? ""}
                    onChange={(e) => updateField("reading", e.target.value)}
                    style={{
                      width: `${Math.max((draft.reading ?? "").length, 6)}ch`,
                    }}
                    className={`${inputBase} text-sm font-medium ${accent?.chipText}`}
                    placeholder="Cách đọc"
                  />
                  <input
                    type="text"
                    value={draft.sv_word ?? ""}
                    onChange={(e) => updateField("sv_word", e.target.value)}
                    style={{
                      width: `${Math.max((draft.sv_word ?? "").length, 6)}ch`,
                    }}
                    className={`${inputBase} text-xs text-gray-500`}
                    placeholder="Từ liên quan"
                  />
                </>
              ) : (
                <>
                  {word.reading && (
                    <span
                      className={`rounded-md px-2 py-0.5 text-sm font-medium ${accent?.chipBg} ${accent?.chipText}`}
                    >
                      {word.reading}
                    </span>
                  )}
                  {word.sv_word && (
                    <span className="text-xs font-medium text-gray-400">
                      · {word.sv_word}
                    </span>
                  )}
                  {word.partOfSpeech && !isEditing && (
                    <span className="rounded-md border border-gray-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      {word.partOfSpeech}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Nghĩa */}
            {isEditing ? (
              <textarea
                value={draft.meaning ?? ""}
                onChange={(e) => updateField("meaning", e.target.value)}
                className={`${inputBase} mt-3 block w-full resize-none text-start text-base font-medium text-gray-800`}
                placeholder="Nghĩa"
                rows={1}
                ref={(el) => {
                  if (el) {
                    el.style.height = "auto";
                    el.style.height = `${el.scrollHeight}px`;
                  }
                }}
              />
            ) : (
              word.meaning && (
                <div className="mt-3 text-start text-base font-medium leading-relaxed text-gray-800">
                  {word.meaning}
                </div>
              )
            )}

            {/* Từ loại khi đang edit */}
            {isEditing && (
              <input
                type="text"
                value={draft.partOfSpeech ?? ""}
                onChange={(e) => updateField("partOfSpeech", e.target.value)}
                className={`${inputBase} mt-2 block w-full text-xs italic text-gray-500`}
                placeholder="Từ loại"
              />
            )}
          </div>
        </div>

        {/* Section ví dụ */}
        {(exampleCount > 0 || isEditing) && (
          <div className="mt-4">
            {exampleCount > 0 && (
              <div className="flex items-center gap-2">
                <div
                  className="border-2 border-rose-200 rounded-full flex-1"
                  aria-hidden
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setOpen((v) => !v)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${accent?.chipBg} ${accent?.chipText} ${accent?.chipHover}`}
                  icon={open ? ChevronDown : ChevronRight}
                  iconPosition="left"
                >
                  {open ? "Ẩn ví dụ" : `${exampleCount} ví dụ`}
                </Button>
                <div
                  className="border-2 border-rose-200 rounded-full flex-1"
                  aria-hidden
                />
              </div>
            )}

            {(open || (isEditing && exampleCount === 0)) && (
              <ul className="mt-3 space-y-2">
                {(isEditing ? draft.examples : word.examples)?.map(
                  (ex: CreateExample, i: number) => (
                    <li
                      key={i}
                      className={`group/ex relative flex gap-3 rounded-xl ${accent?.exampleBg} p-3 pl-4 transition-transform hover:translate-x-0.5`}
                    >
                      <Quote
                        className={`absolute right-2 top-2 h-3.5 w-3.5 ${accent?.chipText} opacity-30`}
                        aria-hidden
                      />
                      <div className="flex-1 text-start text-sm text-gray-700">
                        {isEditing ? (
                          <>
                            <div className="flex items-baseline gap-1">
                              <span
                                className={`shrink-0 text-xs font-bold ${accent?.chipText}`}
                              >
                                {i + 1}.
                              </span>
                              <input
                                type="text"
                                value={ex.content}
                                onChange={(e) =>
                                  updateExample(i, "content", e.target.value)
                                }
                                className={`${inputBase} w-full font-medium text-gray-800`}
                                placeholder="Câu ví dụ"
                              />
                            </div>
                            <input
                              type="text"
                              value={ex.meaning}
                              onChange={(e) =>
                                updateExample(i, "meaning", e.target.value)
                              }
                              className={`${inputBase} mt-0.5 block w-full text-gray-500`}
                              placeholder="Nghĩa ví dụ"
                            />
                          </>
                        ) : (
                          <>
                            <div className="font-medium text-gray-800">
                              <span
                                className={`mr-1 text-xs font-bold ${accent?.chipText}`}
                              >
                                {i + 1}.
                              </span>
                              <span className="border-b-2 border-dashed border-amber-400 pb-0.5">
                                {ex.content}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500 italic">
                              {ex.meaning}
                            </div>
                          </>
                        )}
                      </div>
                      {isEditing && (
                        <IconButton
                          icon={Trash2}
                          kind="ghost"
                          spacing="xs"
                          color="slate"
                          size="sm"
                          onClick={() => removeExample(i)}
                          aria-label="Xóa ví dụ"
                          className="shrink-0 self-start"
                        />
                      )}
                    </li>
                  ),
                )}
              </ul>
            )}

            {isEditing && (
              <Button
                type="button"
                size="sm"
                onClick={addExample}
                className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${accent?.chipBg} ${accent?.chipText} ${accent?.chipHover}`}
                icon={Plus}
                iconPosition="left"
              >
                Thêm ví dụ
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
