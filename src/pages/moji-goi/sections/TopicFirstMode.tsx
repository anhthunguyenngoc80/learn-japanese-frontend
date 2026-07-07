import { Plus, X, Check } from "lucide-react";
import { Button, IconButton } from "../../../components";
import { WordEntryPanel, WordPreviewTable } from "../sections";
import type { ModeContentProps } from "../../../model";

export const TopicFirstMode = ({ words, topics, onFileUpload, isUploading }: ModeContentProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">
          Danh sách chủ đề
        </h3>
        <div className="flex gap-2 mb-3">
          <input
            placeholder="Ví dụ: Bài 1 - Chào hỏi"
            className="flex-1 px-4 py-2.5 rounded-xl border border-amber-200 bg-white text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
          />
          <IconButton aria-label="abc" icon={Plus} size="sm" />
        </div>
        <div className="flex flex-col gap-2">
          {topics.map((t, i) => (
            <Button
              key={"topic-" + i}
              // variant={i === 0 ? "primary" : "secondary"}
              className={`w-full justify-between ${i === 0
                  ? "border-amber-400 bg-amber-50"
                  : "border-amber-100 bg-white hover:border-amber-200"
                }`}
            >
              <span className="text-sm font-medium text-gray-800 truncate">
                {i + 1}. {t.name}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                  <Check size={12} /> 3 từ
                </span>
                <span className="w-6 h-6 rounded-full grid place-items-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
                  <X size={12} />
                </span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-3">
          Từ vựng cho: {topics[0]?.name}
        </h3>
        <div className="mb-4">
          <WordEntryPanel onFileSelect={onFileUpload} loading={isUploading} />
        </div>
        <div className="mb-3">
          <WordPreviewTable words={words.slice(0, 2)} compact />
        </div>
        <Button  size="sm" icon={Check} iconPosition="left" className="bg-amber-100 text-amber-700 hover:bg-amber-200">
          Xác nhận cho chủ đề này
        </Button>
      </div>
    </div>
  );
};
