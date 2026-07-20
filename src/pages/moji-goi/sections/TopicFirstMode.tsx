import { useState } from "react";
import { X, Check, ListPlus } from "lucide-react";
import { Button } from "../../../components";
import { WordEntryPanel } from "../sections";
import type { ModeContentProps } from "../../../model";
import { WordCard } from "./WordCard";
import type { AccentColor } from "../../../constant";
import { accentFromTopic, accentMap } from "../../../constant/styleConstant";

export const TopicFirstMode = ({ words, topics, onFileUpload, isUploading, onAddTopic, onDeleteTopic, onUpdateTopic, accent,
  topic,
  topicIndex
}: ModeContentProps & {
  accent?: AccentColor;
  topic?: string | number;
  topicIndex?: number;
}) => {
  const [multiTopicInput, setMultiTopicInput] = useState("");

  const resolvedAccent: AccentColor =
    accent ?? (topic != null ? accentFromTopic(topic) : "amber");
  const s = accentMap[resolvedAccent];
  const resolvedTopicIndex =
    topicIndex ?? (typeof topic === "number" ? topic : undefined);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">
          Danh sách chủ đề
        </h3>
        <div className="flex flex-col gap-2 mb-3">
          <textarea
            placeholder="Nhập nhiều chủ đề, mỗi chủ đề trên 1 dòng. Ví dụ:&#10;Bài 1 - Chào hỏi | 1-50&#10;Bài 2 - Tự giới thiệu | 51-80&#10;Bài 3 - Gia đình"
            value={multiTopicInput}
            onChange={(e) => setMultiTopicInput(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition resize-y"
          />
          <div className="flex gap-2">
              <Button
                kind="solid"
                color="amber"
                size="sm"
                spacing="md"
                radius="full"
                onClick={() => {
                  const lines = multiTopicInput
                    .split("\n")
                    .map((l) => l.trim())
                    .filter((l) => l.length > 0);
                  if (lines.length > 0 && onAddTopic) {
                    let topicIndex = topics.length;
                    lines.forEach((line) => {
                      // Split by "|" to get topic name and optional range
                      const parts = line.split("|").map((p) => p.trim());
                      const topicName = parts[0];

                      if (!topicName) return;

                      // Use current counter, then increment
                      const currentIndex = topicIndex;
                      topicIndex += 1;

                      // Add topic first
                      onAddTopic(topicName);

                      // If range is provided, assign words
                      if (parts.length > 1 && parts[1] && onUpdateTopic) {
                        const rangeParts = parts[1].split("-");
                        const from = parseInt(rangeParts[0], 10);
                        const to = parseInt(rangeParts[1], 10);
                        if (!isNaN(from) && !isNaN(to)) {
                          const indices: number[] = [];
                          for (let i = from; i <= to; i++) {
                            if (i >= 1 && i <= words.length) {
                              indices.push(i - 1); // Convert to 0-based
                            }
                          }
                          if (indices.length > 0) {
                            onUpdateTopic(currentIndex, indices);
                          }
                        }
                      }
                    });
                    setMultiTopicInput("");
                  }
                }}
              >
                <ListPlus size={16} />
                Thêm tất cả
              </Button>
          </div>
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
                <span 
                  className="w-6 h-6 rounded-full grid place-items-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition cursor-pointer"
                  onClick={() => onDeleteTopic?.(i)}
                >
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
        <div className="mb-3 overflow-y-auto pr-1 grow grid grid-cols-1 gap-4">
          {words.map((word, index) => (
            <WordCard
              key={`word-${index}`}
              word={word}
              accent={s}
              topicIndex={resolvedTopicIndex}
            />
          ))}
        </div>
        <Button size="sm" icon={Check} iconPosition="left" className="bg-amber-100 text-amber-700 hover:bg-amber-200">
          Xác nhận cho chủ đề này
        </Button>
      </div>
    </div>
  );
};
