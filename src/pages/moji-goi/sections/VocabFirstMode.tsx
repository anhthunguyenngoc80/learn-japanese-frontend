import { Plus, X } from "lucide-react";
import { Button, IconButton } from "../../../components";
import { WordEntryPanel, WordPreviewTable, StepHeader } from "../sections";
import type { ModeContentProps } from "../../../model";
import { accentMap, topicAccentCycle } from "../../../constant/styleConstant";

export const VocabFirstMode = ({ words, topics }: ModeContentProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 items-stretch">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-4 flex flex-col lg:h-[600px]">
        <StepHeader
          step={1}
          title="Nhập từ vựng"
          hint="Dán văn bản hoặc tải file Excel"
          done
        />
        <div className="overflow-y-auto pr-1 grow">
          <WordEntryPanel />
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-white p-4 flex flex-col lg:h-[600px]">
        <StepHeader
          step={2}
          title="Xem trước từ vựng"
          hint="Kiểm tra, sửa hoặc xoá từ. Số ở góc mỗi dòng cho biết từ đã thuộc chủ đề nào."
        />
        <div className="overflow-y-auto pr-1 grow">
          <WordPreviewTable words={words} compact />
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-white p-4 flex flex-col lg:h-[600px]">
        <StepHeader
          step={3}
          title="Chia chủ đề"
          hint="Tạo chủ đề, gán theo khoảng số thứ tự, hoặc chỉ định trực tiếp cho từng từ."
        />
        <div className="overflow-y-auto pr-1 grow">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <input
                placeholder="Tên chủ đề mới"
                className="flex-1 px-3 py-2 rounded-xl border border-amber-200 bg-white text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
              />
              <IconButton aria-label="abc" icon={Plus} size="sm" />
            </div>

            <div className="flex flex-col gap-3">
              {topics.map((t, idx) => {
                const count = topics.length;
                const accentColor = topicAccentCycle[idx % topicAccentCycle.length];
                const color = accentMap[accentColor];
                return (
                  <div
                    className={`rounded-xl border p-3 ${color.border} ${color.bg}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white shrink-0 ${color.dot}`}
                        >
                          {idx + 1}
                        </span>
                        <span
                          className={`text-xs font-semibold truncate ${color.text}`}
                        >
                          {t.name}
                        </span>
                        <span className="text-[11px] text-gray-400 shrink-0">
                          ({count} từ)
                        </span>
                      </div>
                      <IconButton aria-label="abc" icon={X}  size="sm" className="!p-0 w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-gray-500 shrink-0">
                        Từ số
                      </span>
                      <input
                        placeholder="1"
                        className="w-14 px-2 py-1 rounded-lg border border-white/80 bg-white text-xs outline-none focus:border-amber-400"
                      />
                      <span className="text-[11px] text-gray-500 shrink-0">
                        tới
                      </span>
                      <input
                        placeholder={String(words.length)}
                        className="w-14 px-2 py-1 rounded-lg border border-white/80 bg-white text-xs outline-none focus:border-amber-400"
                      />
                      <Button  size="sm" className="text-[11px]">Gán</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};