import { useState } from "react";
import { Folder } from "lucide-react";
import { Button } from "../../../components";
import type { CreateTopic, CreateWord } from "../../../model";
import {
  accentFromTopic,
  accentMap,
  type AccentColor,
} from "../../../constant/styleConstant";
import { WordCard } from "./WordCard";

export const TopicOverview = ({
  topics,
  words,
  accent,
  topic,
  topicIndex,
  onEditWord,
  onDeleteWord,
}: {
  topics: CreateTopic[];
  words: CreateWord[];
  accent?: AccentColor;
  topic?: string | number;
  topicIndex?: number;
  onEditWord?: (index: number, word: CreateWord) => void;
  onDeleteWord?: (index: number) => void;
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const resolvedAccent: AccentColor =
    accent ?? (topic != null ? accentFromTopic(topic) : "amber");
  const s = accentMap[resolvedAccent];
  const resolvedTopicIndex =
    topicIndex ?? (typeof topic === "number" ? topic : undefined);
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        {topics.map((g, i) => (
          <Button
            key={g.name}
            onClick={() => setExpanded(g.name)}
            kind="outline"
            color="amber"
            className={`${
              expanded === g.name
                ? "border-amber-400 bg-amber-50/60 shadow-sm"
                : "border-amber-100 bg-white hover:border-amber-200"
            }`}
          >
            <div className="w-8 h-8 rounded-lg grid place-items-center mb-2">
              {g.name === "Chưa phân loại" ? (
                <Folder size={15} />
              ) : (
                <span className="text-xs font-bold">{i + 1}</span>
              )}
            </div>
            <p className="font-semibold text-gray-800 text-sm truncate">
              {g.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{g.words.length} từ</p>
          </Button>
        ))}
      </div>

      {words && (
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <span className="text-gray-400 font-normal">
              ({words.length} từ)
            </span>
          </p>
          <div className="rounded-xl border border-amber-100 bg-white overflow-hidden max-h-[360px] overflow-y-auto">
            {words.map((w, i) => (
              <WordCard
                key={`word-${i}`}
                word={w}
                accent={s}
                topicIndex={resolvedTopicIndex}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
