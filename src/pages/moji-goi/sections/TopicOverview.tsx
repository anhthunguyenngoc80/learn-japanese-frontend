import { useState } from "react";
import { Folder } from "lucide-react";
import { Button } from "../../../components";

export const TopicOverview = () => {
  const nonEmpty = [
    {
      name: "Bài 1 - Chào hỏi",
      words: [
        { text: "単語", reading: "たんご", meaning: "từ vựng" },
        { text: "勉強", reading: "べんきょう", meaning: "học tập" },
      ],
    },
    {
      name: "Bài 2 - Trường học",
      words: [
        { text: "学校", reading: "がっこう", meaning: "trường học" },
        { text: "先生", reading: "せんせい", meaning: "giáo viên" },
      ],
    },
    {
      name: "Chưa phân loại",
      words: [{ text: "友達", reading: "ともだち", meaning: "bạn bè" }],
    },
  ].filter((g) => g.words.length > 0);

  const [expanded, setExpanded] = useState<string | null>(
    nonEmpty[0]?.name ?? null,
  );
  const active = nonEmpty.find((g) => g.name === expanded) || null;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        {nonEmpty.map((g, i) => (
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

      {active && (
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
            {active.name}{" "}
            <span className="text-gray-400 font-normal">
              ({active.words.length} từ)
            </span>
          </p>
          <div className="rounded-xl border border-amber-100 bg-white overflow-hidden max-h-[360px] overflow-y-auto">
            <ul className="divide-y divide-amber-50 text-sm">
              {active.words.map((w, i) => (
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
