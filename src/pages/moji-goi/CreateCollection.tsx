import { useState } from "react";
import {
  Save,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Upload,
  Check,
  ListOrdered,
  Layers,
  Rows3,
  Folder,
} from "lucide-react";

/**
 * ---------------------------------------------------------------------------
 * PHIÊN BẢN CHỈ-GIAO-DIỆN (UI-ONLY)
 * ---------------------------------------------------------------------------
 * Toàn bộ logic nghiệp vụ đã được loại bỏ:
 *  - Không còn parseText / parseExcel / parseCSV
 *  - Không còn tính toán nhóm chủ đề (vocabFirstGroups, topicFirstGroups...)
 *  - Không còn lưu/đọc localStorage, không còn điều hướng router
 *  - Không còn sửa/xoá từ, không còn gán khoảng số thực sự
 *
 * Chỉ giữ lại:
 *  - Cấu trúc JSX / class Tailwind y hệt bản gốc
 *  - Dữ liệu mẫu (mock) tĩnh để layout hiển thị đầy đủ nội dung
 *  - Vài state thuần UI để bạn xem được các trạng thái khác nhau của giao diện
 *    (chọn mode, chuyển screen 1/2, mở rộng thẻ chủ đề). Đây KHÔNG phải logic
 *    nghiệp vụ, chỉ là điều hướng hiển thị.
 *
 * Mọi nút hành động (Lưu, Phân tích, Gán, Xác nhận...) đều không làm gì cả —
 * chỉ còn hình dáng để bạn chỉnh sửa style/layout theo ý muốn.
 * ---------------------------------------------------------------------------
 */

type AccentColor = {
  border: string;
  bg: string;
  text: string;
  dot: string;
};

type MockWord = {
  text: string;
  reading: string;
  meaning: string;
  topic?: string;
};

type MockTopic = {
  id: string;
  name: string;
  color: AccentColor;
};

type Mode = "vocab-first" | "topic-first" | "parallel";

const UNASSIGNED = "Chưa phân loại";

const accentCycle: AccentColor[] = [
  {
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  {
    border: "border-sky-200",
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-500",
  },
];

// ----------------------------- DỮ LIỆU MẪU ---------------------------------
const MOCK_WORDS: MockWord[] = [
  {
    text: "単語",
    reading: "たんご",
    meaning: "từ vựng",
    topic: "Bài 1 - Chào hỏi",
  },
  {
    text: "勉強",
    reading: "べんきょう",
    meaning: "học tập",
    topic: "Bài 1 - Chào hỏi",
  },
  {
    text: "学校",
    reading: "がっこう",
    meaning: "trường học",
    topic: "Bài 2 - Trường học",
  },
  {
    text: "先生",
    reading: "せんせい",
    meaning: "giáo viên",
    topic: "Bài 2 - Trường học",
  },
  { text: "友達", reading: "ともだち", meaning: "bạn bè" },
  { text: "図書館", reading: "としょかん", meaning: "thư viện" },
];

const MOCK_TOPICS: MockTopic[] = [
  { id: "t1", name: "Bài 1 - Chào hỏi", color: accentCycle[0] },
  { id: "t2", name: "Bài 2 - Trường học", color: accentCycle[1] },
];

const MOCK_GROUPS = [
  {
    name: "Bài 1 - Chào hỏi",
    words: MOCK_WORDS.filter((w) => w.topic === "Bài 1 - Chào hỏi"),
  },
  {
    name: "Bài 2 - Trường học",
    words: MOCK_WORDS.filter((w) => w.topic === "Bài 2 - Trường học"),
  },
  { name: UNASSIGNED, words: MOCK_WORDS.filter((w) => !w.topic) },
];

// --------------------------- COMPONENT DÙNG CHUNG --------------------------

const StepHeader = ({
  step,
  title,
  hint,
  done,
}: {
  step: number;
  title: string;
  hint?: string;
  done?: boolean;
}) => (
  <div className="mb-3">
    <div className="flex items-center gap-2">
      <span
        className={`w-6 h-6 rounded-full grid place-items-center text-xs font-bold ${
          done ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-700"
        }`}
      >
        {done ? <Check size={12} /> : step}
      </span>
      <h3 className="font-semibold text-gray-800">{title}</h3>
    </div>
    {hint && <p className="text-xs text-gray-500 mt-1 ml-8">{hint}</p>}
  </div>
);

const ModeCard = ({
  icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`text-left p-4 rounded-2xl border-2 transition ${
      selected
        ? "border-amber-400 bg-amber-50/60 shadow-sm"
        : "border-gray-100 bg-white hover:border-amber-200"
    }`}
  >
    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 grid place-items-center mb-2">
      {icon}
    </div>
    <p className="font-semibold text-gray-800 text-sm">{title}</p>
    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
  </button>
);

// Khối "dán văn bản hoặc tải file" — chỉ còn hình dáng, không xử lý gì.
const WordEntryPanel = () => (
  <div>
    <div className="mb-4">
      <p className="mt-2 text-[11px] text-gray-400 text-right whitespace-nowrap">
        Cột: Số thứ tự • Từ • Hán Việt • Cách đọc • Nghĩa • Ví dụ (dòng đầu là
        tên cột)
      </p>

      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-8 px-6 cursor-pointer transition border-emerald-300 bg-emerald-50/40 hover:border-emerald-500">
        <Upload className="text-emerald-600" size={28} />
        <p className="text-sm font-medium text-gray-700">
          Kéo & thả file Excel vào đây
        </p>
        <p className="text-xs text-gray-500">
          hoặc{" "}
          <span className="text-emerald-600 font-medium">bấm để chọn file</span>
        </p>
        <p className="text-[11px] text-gray-400 text-center">
          Hỗ trợ <code>.xlsx</code>, <code>.xls</code>, <code>.csv</code>
        </p>
      </div>
    </div>

    <div>
      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
        Hoặc nhập từ vựng (dạng văn bản)
      </label>

      <p className="mt-2 text-xs text-gray-500 text-left leading-relaxed">
        <span className="font-medium">Chú thích:</span> Mỗi từ cách nhau bởi một
        dòng trống. Các trường được phân tách bằng dấu{" "}
        <code className="font-mono text-amber-600">|</code>. Ví dụ:{" "}
        <code className="font-mono text-amber-600">
          単語 | よみ | 意味 | 例文
        </code>
      </p>

      <textarea
        placeholder="Dán nội dung từ vựng vào đây...

Ví dụ: 単語 | よみ | 意味 | 例文"
        rows={6}
        className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition resize-y font-mono"
      />

      <button className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium hover:bg-amber-200 transition">
        <Plus size={14} /> Phân tích
      </button>
    </div>
  </div>
);

// Bảng xem trước — chỉ hiển thị dữ liệu mẫu, không còn sửa/xoá thật.
const WordPreviewTable = ({
  words,
  compact = false,
}: {
  words: MockWord[];
  compact?: boolean;
}) => (
  <div
    className={`rounded-xl border border-amber-100 bg-white overflow-hidden ${
      compact ? "max-h-[420px] overflow-y-auto" : ""
    }`}
  >
    <p className="px-4 py-2 text-xs font-semibold text-gray-500 border-b border-amber-50">
      Xem trước ({words.length} từ)
    </p>
    <ul className="divide-y divide-amber-50 text-sm">
      {words.map((w, i) => (
        <li key={i} className="px-4 py-2 flex items-center gap-3">
          <span className="text-gray-400 w-6 shrink-0">{i + 1}.</span>
          <span className="font-medium text-gray-800 shrink-0">{w.text}</span>
          <span className="text-gray-400 shrink-0">{w.reading}</span>
          <span className="text-gray-500 truncate">{w.meaning}</span>
          <button className="ml-auto text-gray-300 hover:text-red-400 shrink-0">
            <X size={14} />
          </button>
        </li>
      ))}
    </ul>
  </div>
);

// Lưới thẻ chủ đề + panel chi tiết — expand/collapse là tương tác UI thuần,
// không tính toán dữ liệu.
const TopicOverview = () => {
  const nonEmpty = MOCK_GROUPS.filter((g) => g.words.length > 0);
  const [expanded, setExpanded] = useState<string | null>(
    nonEmpty[0]?.name ?? null,
  );
  const active = nonEmpty.find((g) => g.name === expanded) || null;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        {nonEmpty.map((g, i) => (
          <button
            key={g.name}
            onClick={() => setExpanded(g.name)}
            className={`p-4 rounded-2xl border-2 text-left transition ${
              expanded === g.name
                ? "border-amber-400 bg-amber-50/60 shadow-sm"
                : "border-amber-100 bg-white hover:border-amber-200"
            }`}
          >
            <div className="w-8 h-8 rounded-lg grid place-items-center mb-2">
              {g.name === UNASSIGNED ? (
                <Folder size={15} />
              ) : (
                <span className="text-xs font-bold">{i + 1}</span>
              )}
            </div>
            <p className="font-semibold text-gray-800 text-sm truncate">
              {g.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{g.words.length} từ</p>
          </button>
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

// ---------------------------------------------------------------------------
// Component chính — chỉ còn state điều hướng giao diện (mode, screen)
// ---------------------------------------------------------------------------
export const CreateCollection = () => {
  const [mode, setMode] = useState<Mode>("vocab-first");
  const [screen, setScreen] = useState<1 | 2>(1);

  const totalWords = MOCK_WORDS.length;

  return (
    <div className="grow flex flex-col px-6 py-8 max-w-7xl mx-auto w-full">
      <button className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 mb-6 w-fit">
        <ChevronLeft size={16} /> Quay lại
      </button>

      <div className="mb-6 max-w-md">
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
          Tên bộ sưu tập
        </label>
        <input
          placeholder="Ví dụ: Từ vựng N3 - Bài 1"
          className="w-full px-4 py-2.5 rounded-xl border border-amber-200 bg-white text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
        />
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Nhập từ vựng và chủ đề
      </h1>

      {screen === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <ModeCard
            icon={<ListOrdered size={16} />}
            title="Từ vựng trước, chủ đề sau"
            description="Nhập từ vựng, xem trước, rồi gán chủ đề theo khoảng số hoặc từng từ."
            selected={mode === "vocab-first"}
            onClick={() => setMode("vocab-first")}
          />
          <ModeCard
            icon={<Layers size={16} />}
            title="Chủ đề trước, từ vựng sau"
            description="Tạo danh sách chủ đề, rồi nhập từ cho từng chủ đề."
            selected={mode === "topic-first"}
            onClick={() => setMode("topic-first")}
          />
          <ModeCard
            icon={<Rows3 size={16} />}
            title="Nhập song song"
            description="Nhập từ và gán chủ đề cho từng từ cùng lúc."
            selected={mode === "parallel"}
            onClick={() => setMode("parallel")}
          />
        </div>
      )}

      {/* ============================ SCREEN 1 — vocab-first ============================ */}
      {screen === 1 && mode === "vocab-first" && (
        <>
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
                <WordPreviewTable words={MOCK_WORDS} compact />
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
                    <button className="px-3 py-2 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition shrink-0">
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {MOCK_TOPICS.map((t, idx) => {
                      const count = MOCK_WORDS.filter(
                        (w) => w.topic === t.name,
                      ).length;
                      return (
                        <div
                          key={t.id}
                          className={`rounded-xl border p-3 ${t.color.border} ${t.color.bg}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white shrink-0 ${t.color.dot}`}
                              >
                                {idx + 1}
                              </span>
                              <span
                                className={`text-xs font-semibold truncate ${t.color.text}`}
                              >
                                {t.name}
                              </span>
                              <span className="text-[11px] text-gray-400 shrink-0">
                                ({count} từ)
                              </span>
                            </div>
                            <button className="w-5 h-5 rounded-full grid place-items-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition shrink-0">
                              <X size={11} />
                            </button>
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
                              placeholder={String(MOCK_WORDS.length)}
                              className="w-14 px-2 py-1 rounded-lg border border-white/80 bg-white text-xs outline-none focus:border-amber-400"
                            />
                            <button className="ml-auto px-2.5 py-1 rounded-lg bg-white text-[11px] font-medium text-gray-700 border border-white/80 hover:bg-gray-50 transition shrink-0">
                              Gán
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setScreen(2)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-md shadow-amber-200 hover:shadow-lg transition"
            >
              Xem trước toàn diện <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}

      {/* ============================ SCREEN 1 — topic-first ============================ */}
      {screen === 1 && mode === "topic-first" && (
        <>
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
                <button className="px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition">
                  <Plus size={14} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {MOCK_TOPICS.map((t, i) => (
                  <button
                    key={t.id}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition text-left ${
                      i === 0
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
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Từ vựng cho: {MOCK_TOPICS[0]?.name}
              </h3>
              <div className="mb-4">
                <WordEntryPanel />
              </div>
              <div className="mb-3">
                <WordPreviewTable words={MOCK_WORDS.slice(0, 2)} compact />
              </div>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium hover:bg-amber-200 transition">
                <Check size={14} /> Xác nhận cho chủ đề này
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setScreen(2)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-md shadow-amber-200 hover:shadow-lg transition"
            >
              Xem trước toàn diện <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}

      {/* ============================ SCREEN 1 — parallel ============================ */}
      {screen === 1 && mode === "parallel" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Nhập từ vựng</h3>
              <WordEntryPanel />

              <div className="mt-6">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Danh sách chủ đề
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    placeholder="Ví dụ: Bài 1"
                    className="flex-1 px-4 py-2 rounded-xl border border-amber-200 bg-white text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                  />
                  <button className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {MOCK_TOPICS.map((t) => (
                    <span
                      key={t.id}
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
                    {MOCK_WORDS.map((w, i) => (
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
                            {MOCK_TOPICS.map((t) => (
                              <option key={t.id} value={t.name}>
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

          <div className="flex justify-end">
            <button
              onClick={() => setScreen(2)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-md shadow-amber-200 hover:shadow-lg transition"
            >
              Xem trước toàn diện <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}

      {/* ============================ SCREEN 2 ============================ */}
      {screen === 2 && (
        <>
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <p className="text-sm text-amber-700 font-medium">
              Tổng cộng {totalWords} từ vựng trong{" "}
              {MOCK_GROUPS.filter((g) => g.words.length > 0).length} chủ đề.
            </p>
          </div>

          <TopicOverview />

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setScreen(1)}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600"
            >
              <ChevronLeft size={16} /> Quay lại chỉnh sửa
            </button>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-md shadow-amber-200 hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition">
              <Save size={18} /> Lưu bộ từ vựng
            </button>
          </div>
        </>
      )}
    </div>
  );
};
