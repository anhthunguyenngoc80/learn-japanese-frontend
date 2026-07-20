import { useState, useEffect } from "react";
import { Plus, Settings2, ChevronDown, X } from "lucide-react";
import { Button, IconButton } from "../../../components";
import { WordEntryPanel, StepHeader, TopicCard } from "../sections";
import type { ModeContentProps } from "../../../model";
import {
  accentFromTopic,
  accentMap,
  type AccentColor,
} from "../../../constant/styleConstant";
import { WordCard } from "./WordCard";
import type { CreateWord } from "../../../model";

export const VocabFirstMode = ({
  words,
  topics,
  onFileUpload,
  isUploading,
  onAddTopic,
  onDeleteTopic,
  onUpdateTopic,
  onDeleteWord,
  onEditWord,
  accent,
  topic,
  topicIndex,
}: ModeContentProps & {
  accent?: AccentColor;
  topic?: string | number;
  topicIndex?: number;
}) => {
  const [showMappingConfig, setShowMappingConfig] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<(1 | 2 | 3)[]>([1]);
  const [newTopicName, setNewTopicName] = useState("");
  const [rangeFrom, setRangeFrom] = useState<Record<number, string>>({});
  const [rangeTo, setRangeTo] = useState<Record<number, string>>({});
  const [multiTopicInput, setMultiTopicInput] = useState("");

  // Auto-open step 2 when words are entered
  useEffect(() => {
    if (words.length > 0 && !expandedSteps.includes(2)) {
      setExpandedSteps((prev) => [...prev, 2]);
    }
  }, [words.length]);

  const handleStepToggle = (step: 1 | 2 | 3) => {
    setExpandedSteps((prev) =>
      prev.includes(step)
        ? prev.filter((s) => s !== step)
        : [...prev, step],
    );
  };

  const handleMappingConfigClose = () => {
    setShowMappingConfig(false);
  };

  const handleAssign = (topicIdx: number) => {
    const fromStr = rangeFrom[topicIdx]?.trim();
    const toStr = rangeTo[topicIdx]?.trim();

    const from = fromStr ? parseInt(fromStr, 10) : NaN;
    const to = toStr ? parseInt(toStr, 10) : NaN;

    // Use 1-based index as shown in the UI, convert to 0-based for array
    const startIdx = isNaN(from) ? 0 : Math.max(0, from - 1);
    const endIdx = isNaN(to)
      ? words.length - 1
      : Math.min(words.length - 1, to - 1);

    if (startIdx > endIdx) return;

    const indices: number[] = [];
    for (let i = startIdx; i <= endIdx; i++) {
      indices.push(i);
    }

    onUpdateTopic?.(topicIdx, indices);
  };

  useEffect(() => {
    console.log("Current topics:", topics);
  }, [topics]);

  const resolvedAccent: AccentColor =
    accent ?? (topic != null ? accentFromTopic(topic) : "amber");
  const s = accentMap[resolvedAccent];
  const resolvedTopicIndex =
    topicIndex ?? (typeof topic === "number" ? topic : undefined);

  const renderStep = (
    step: 1 | 2 | 3,
    title: string,
    hint: string,
    done: boolean,
    content: React.ReactNode,
    rightAction?: React.ReactNode,
  ) => {
    const isExpanded = expandedSteps.includes(step);

    if (!isExpanded) {
      return (
        <div
          className="rounded-2xl border border-gray-200 bg-gray-50 w-20 shrink-0 lg:h-[600px] cursor-pointer hover:bg-gray-100 flex flex-col items-center justify-center p-2 transition-all duration-300"
          onClick={() => handleStepToggle(step)}
        >
          <span className="text-xs font-medium text-gray-600 text-center leading-tight">
            {title}
          </span>
          <div className="flex items-center justify-center mt-2">
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/30 flex-1 lg:h-[600px] flex flex-col transition-all duration-300">
        <div className="flex items-center justify-between">
          <StepHeader
            step={step}
            title={title}
            hint={hint}
            done={done}
            className="items-start"
          />
          <div className="flex items-center gap-1">
            {rightAction}
            <IconButton
              aria-label={`Đóng bước ${step}`}
              icon={X}
              size="sm"
              kind="ghost"
              color="slate"
              onClick={() => handleStepToggle(step)}
              className="!p-1"
            />
          </div>
        </div>
        <div className="overflow-y-auto pr-1 grow">{content}</div>
      </div>
    );
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6 items-start">
      {renderStep(
        1,
        "Nhập từ vựng",
        "Dán văn bản hoặc tải file Excel",
        words.length > 0,
        <WordEntryPanel
          onFileSelect={onFileUpload}
          loading={isUploading}
          showMappingConfig={showMappingConfig}
          onMappingConfigClose={handleMappingConfigClose}
        />,
        <IconButton
          aria-label="Cài đặt cột Excel"
          icon={Settings2}
          size="sm"
          kind="ghost"
          color="slate"
          onClick={() => setShowMappingConfig(true)}
          className="!p-1"
        />,
      )}

      {renderStep(
        2,
        "Xem trước từ vựng",
        "Kiểm tra, sửa hoặc xoá từ. Số ở góc mỗi dòng cho biết từ đã thuộc chủ đề nào.",
        false,
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4">
            {words.map((word, index) => (
              <WordCard
                key={`word-${index}`}
                word={word}
                accent={s}
                topicIndex={resolvedTopicIndex}
                onEdit={(word) => {
                  onEditWord?.(index, word as CreateWord);
                }}
                onDelete={() => {
                  onDeleteWord?.(index);
                }}
              />
            ))}
          </div>
          {words.length > 0 && (
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <Button
                kind="solid"
                color="amber"
                size="sm"
                spacing="md"
                radius="full"
                onClick={() => handleStepToggle(3)}
              >
                Tiếp tục →
              </Button>
            </div>
          )}
        </div>,
      )}

      {renderStep(
        3,
        "Chia chủ đề",
        "Tạo chủ đề, gán theo khoảng số thứ tự, hoặc chỉ định trực tiếp cho từng từ.",
        false,
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
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
                    let nextTopicIndex = topics.length; // vị trí topic tiếp theo sẽ được thêm vào

                    lines.forEach((line) => {
                      // Split by "|" để lấy tên chủ đề và khoảng (tuỳ chọn)
                      const parts = line.split("|").map((p) => p.trim());
                      const topicName = parts[0];

                      if (!topicName) return;

                      const topicIndex = nextTopicIndex;
                      nextTopicIndex += 1; // chỉ tăng khi thực sự thêm topic

                      // Thêm topic trước
                      onAddTopic(topicName);

                      // Nếu có khoảng, gán từ vựng theo khoảng đó
                      if (parts.length > 1 && parts[1] && onUpdateTopic) {
                        const rangeParts = parts[1].split("-");
                        const from = parseInt(rangeParts[0], 10);
                        const to = parseInt(rangeParts[1], 10);
                        if (!isNaN(from) && !isNaN(to)) {
                          const indices: number[] = [];
                          for (let i = from; i <= to; i++) {
                            if (i >= 1 && i <= words.length) {
                              indices.push(i - 1); // chuyển sang 0-based
                            }
                          }
                          if (indices.length > 0) {
                            onUpdateTopic(topicIndex, indices);
                          }
                        }
                      }
                    });
                    setMultiTopicInput("");
                  }
                }}
              >
                <Plus size={16} />
                Thêm tất cả
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {topics.map((t, idx) => (
              <TopicCard
                key={"topic-" + t.name}
                topic={t}
                index={idx}
                wordsLength={words.length}
                rangeFrom={rangeFrom[idx] ?? ""}
                rangeTo={rangeTo[idx] ?? ""}
                onRangeFromChange={(value: string) =>
                  setRangeFrom((prev) => ({ ...prev, [idx]: value }))
                }
                onRangeToChange={(value: string) =>
                  setRangeTo((prev) => ({ ...prev, [idx]: value }))
                }
                onAssign={() => handleAssign(idx)}
                onDelete={() => onDeleteTopic?.(idx)}
              />
            ))}
          </div>
        </div>,
      )}
    </div>
  );
};
