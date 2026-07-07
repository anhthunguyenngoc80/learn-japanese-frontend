import { Plus } from "lucide-react";
import { IconButton } from "../../../components";
import { WordEntryPanel } from "../sections";
import type { ModeContentProps } from "../../../model";

const UNASSIGNED = "Chưa phân loại";

export const ParallelMode = ({ words, topics, onFileUpload, isUploading }: ModeContentProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Nhập từ vựng</h3>
        <WordEntryPanel onFileSelect={onFileUpload} loading={isUploading} />

        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Danh sách chủ đề
          </label>
          <div className="flex gap-2 mb-3">
            <input
              placeholder="Ví dụ: Bài 1"
              className="flex-1 px-4 py-2 rounded-xl border border-amber-200 bg-white text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
            />
            <IconButton aria-label="abc" icon={Plus} size="sm" />
          </div>
          <div className="flex flex-wrap gap-2">
            {topics.map((t, idx) => (
              <span
                key={"topic-" + idx}
                className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100"
              >
                {t.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-3">
          Gán chủ đề cho từng từ
        </h3>
        <div className="rounded-2xl border border-amber-100 bg-white shadow-sm overflow-hidden max-h-[480px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0">
              <tr className="border-b border-amber-100 bg-amber-50/80">
                <th className="px-4 py-2.5 text-left font-semibold text-gray-700 w-1">
                  #
                </th>
                <th className="px-4 py-2.5 text-left font-semibold text-gray-700">
                  Từ
                </th>
                <th className="px-4 py-2.5 text-left font-semibold text-gray-700">
                  Nghĩa
                </th>
                <th className="px-4 py-2.5 text-left font-semibold text-gray-700 w-40">
                  Chủ đề
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50">
              {words.map((w, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 text-xs text-gray-400">
                    {i + 1}.
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-800">
                    {w.text}
                  </td>
                  <td className="px-4 py-2 text-gray-500">{w.meaning}</td>
                  <td className="px-4 py-2">
                    <select className="w-full px-2 py-1.5 rounded-lg border border-amber-200 text-xs outline-none focus:border-amber-400 bg-white">
                      <option value="">{UNASSIGNED}</option>
                      {topics.map((t, idx) => (
                        <option key={"topic-" + idx} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};