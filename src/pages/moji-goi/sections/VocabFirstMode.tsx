import { useState, useEffect } from "react";
import { Plus, X, Settings2, ChevronDown } from "lucide-react";
import { Button, IconButton } from "../../../components";
import { WordEntryPanel, StepHeader } from "../sections";
import type { ModeContentProps } from "../../../model";
import { accentFromTopic, accentMap, topicAccentCycle, type AccentColor } from "../../../constant/styleConstant";
import { WordCard } from "./WordCard";

export const VocabFirstMode = ({ 
  words, 
  topics, 
  onFileUpload, 
  isUploading,
  onAddTopic,
  onDeleteTopic,
  onUpdateTopic,
  accent,
  topic,
  topicIndex 
}: ModeContentProps & {
  accent?: AccentColor;
  topic?: string | number;
  topicIndex?: number;
}) => {
  const [showMappingConfig, setShowMappingConfig] = useState(false);
  const [expandedStep, setExpandedStep] = useState<1 | 2 | 3>(1);
  const [newTopicName, setNewTopicName] = useState("");
  const [rangeFrom, setRangeFrom] = useState<Record<number, string>>({});
  const [rangeTo, setRangeTo] = useState<Record<number, string>>({});

  // Auto-advance from step 1 to step 2 when words are entered
  useEffect(() => {
    if (words.length > 0 && expandedStep === 1) {
      setExpandedStep(2);
    }
  }, [words.length]);

  const handleStepToggle = (step: 1 | 2 | 3) => {
    setExpandedStep(step);
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
    const endIdx = isNaN(to) ? words.length - 1 : Math.min(words.length - 1, to - 1);

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
    const isExpanded = expandedStep === step;
    
    return (
      <div 
        className={`rounded-2xl border p-4 flex flex-col transition-all duration-300 ${
          isExpanded 
            ? 'border-amber-200 bg-amber-50/30 flex-1 lg:h-[600px]' 
            : 'border-gray-200 bg-gray-50 w-20 shrink-0 lg:h-[600px] cursor-pointer hover:bg-gray-100'
        }`}
        onClick={() => !isExpanded && handleStepToggle(step)}
      >
        <StepHeader
          step={step}
          title={title}
          hint={isExpanded ? hint : undefined}
          done={done}
          rightAction={isExpanded ? rightAction : undefined}
          className={isExpanded ? 'items-start' : 'flex-col items-center'}
        />
        {isExpanded && (
          <div className="overflow-y-auto pr-1 grow">
            {content}
          </div>
        )}
        {!isExpanded && (
          <div className="flex items-center justify-center mt-1">
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex gap-4 mb-6 items-start">
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
        />
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
                  // Handle edit word logic here
                }}
                onDelete={(word) => {
                  // Handle delete word logic here
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
        </div>
      )}

      {renderStep(
        3,
        "Chia chủ đề",
        "Tạo chủ đề, gán theo khoảng số thứ tự, hoặc chỉ định trực tiếp cho từng từ.",
        false,
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              placeholder="Tên chủ đề mới"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTopicName.trim() && onAddTopic) {
                  onAddTopic(newTopicName.trim());
                  setNewTopicName("");
                }
              }}
              className="flex-1 px-3 py-2 rounded-xl border border-amber-200 bg-white text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
            />
            <IconButton
              aria-label="Thêm chủ đề"
              icon={Plus}
              size="md"
              spacing="md"
              kind="solid"
              color="amber"
              onClick={() => {
                if (newTopicName.trim() && onAddTopic) {
                  onAddTopic(newTopicName.trim());
                  setNewTopicName("");
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-3">
            {topics.map((t, idx) => {
              const count = topics.length;
              const accentColor =
                topicAccentCycle[idx % topicAccentCycle.length];
              const color = accentMap[accentColor];
              return (
                <div
                  key={"topic-" + t.name}
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
                        ({t.words.length} từ)
                      </span>
                    </div>
                    <IconButton
                      aria-label="Xoá chủ đề"
                      kind="ghost"
                      icon={X}
                      size="sm"
                      color={accentColor}
                      className="!p-0 w-5 h-5"
                      onClick={() => onDeleteTopic?.(idx)}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-gray-500 shrink-0">
                      Từ số
                    </span>
                    <input
                      placeholder="1"
                      value={rangeFrom[idx] ?? ""}
                      onChange={(e) => setRangeFrom((prev) => ({ ...prev, [idx]: e.target.value }))}
                      className="w-14 px-2 py-1 rounded-lg border border-white/80 bg-white text-xs outline-none focus:border-amber-400"
                    />
                    <span className="text-[11px] text-gray-500 shrink-0">
                      tới
                    </span>
                    <input
                      placeholder={String(words.length)}
                      value={rangeTo[idx] ?? ""}
                      onChange={(e) => setRangeTo((prev) => ({ ...prev, [idx]: e.target.value }))}
                      className="w-14 px-2 py-1 rounded-lg border border-white/80 bg-white text-xs outline-none focus:border-amber-400"
                    />
                    <div className="w-full"></div>
                    <Button
                      kind="soft"
                      color={accentColor}
                      size="sm"
                      spacing="xxs"
                      radius="sm"
                      className="text-[11px]"
                      onClick={() => handleAssign(idx)}
                    >
                      Gán
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};