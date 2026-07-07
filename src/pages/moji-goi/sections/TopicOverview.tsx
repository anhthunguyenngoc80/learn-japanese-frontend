import { useState } from "react";
import { Folder } from "lucide-react";
import { Button } from "../../../components";
import type { CreateTopic, CreateWord } from "../../../model";

export const TopicOverview = ({topics, words}: {topics: CreateTopic[], words: CreateWord[]})  => {
  const [expanded, setExpanded] = useState<string | null>(null);
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
            <ul className="divide-y divide-amber-50 text-sm">
              {words.map((w, i) => (
                <li key={i} className="px-4 py-2 flex gap-3">
                  <span className="text-gray-400 w-6 shrink-0">{i + 1}.</span>
                  <span className="font-medium text-gray-800 shrink-0">
                    {w.text}
                  </span>
                  <span className="text-gray-500 truncate">{w.meaning}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
