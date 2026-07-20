import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Layers,
  ArrowRightLeft,
} from "lucide-react";
import { Button, Card } from "../../components";
import { PATHS } from "../../constant";
import type * as models from "../../model";
import { getCollections } from "../../api";
import { twMerge } from "tailwind-merge";

type Step = 1 | 2 | 3 | 4;

type TimePreference = "days" | "hours";

const STEPS: { key: Step; label: string; icon: typeof BookOpen }[] = [
  { key: 1, label: "Tên lộ trình", icon: BookOpen },
  { key: 2, label: "Chọn bộ sưu tập", icon: Layers },
  { key: 3, label: "Thời gian", icon: ArrowRightLeft },
  { key: 4, label: "Xem trước", icon: Sparkles },
];

export const CreateLearningRoadmap = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [collections, setCollections] = useState<models.Collection[]>([]);
  const [selectionIds, setSelectionIds] = useState<string[]>([]);
  const [pref, setPref] = useState<TimePreference>("days");
  const [days, setDays] = useState<number>(30);
  const [hoursPerDay, setHoursPerDay] = useState<number>(1);

  const lessonDurationHours = 0.5;

  const selectedCollections = useMemo(
    () => collections.filter((c) => selectionIds.includes(c.collection_id)),
    [collections, selectionIds]
  );

  const estimation = useMemo(() => {
    const collectionCount = selectedCollections.length;
    if (collectionCount === 0) {
      return { totalWords: 0, totalLessons: 0, daysNeeded: 0, hoursPerDay: 0 };
    }

    const totalWords = selectedCollections.reduce(
      (sum, c) => sum + (c.topic_count ?? 0) * 20,
      0
    );
    const totalLessons = selectedCollections.reduce(
      (sum, c) => sum + (c.topic_count ?? 0),
      0
    );

    const totalLessonsHours = totalLessons * lessonDurationHours;

    if (pref === "days") {
      const daysVal = Math.max(days, 1);
      const hoursNeededPerDay = Math.max(totalLessonsHours / daysVal, 0.5);
      return {
        totalWords,
        totalLessons,
        daysNeeded: daysVal,
        hoursPerDay: Math.round(hoursNeededPerDay * 10) / 10,
      };
    }

    const hoursVal = Math.max(hoursPerDay, 0.5);
    const daysNeeded = Math.ceil(totalLessonsHours / hoursVal);
    return { totalWords, totalLessons, daysNeeded, hoursPerDay: hoursVal };
  }, [selectedCollections, pref, days, hoursPerDay]);

  const canNext = useMemo(() => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return selectionIds.length > 0;
    if (step === 3) {
      if (pref === "days") return days >= 1;
      return hoursPerDay >= 0.5;
    }
    return true;
  }, [step, name, selectionIds, pref, days, hoursPerDay]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const res = await getCollections();
        setCollections(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadCollections();
  }, []);

  const toggleSelection = (collection: models.Collection) => {
    setSelectionIds((prev) => {
      const exists = prev.includes(collection.collection_id);
      if (exists) {
        return prev.filter((id) => id !== collection.collection_id);
      }
      return [...prev, collection.collection_id];
    });
  };

  const handleSave = async () => {
    if (!name.trim() || selectionIds.length === 0) return;

    const roadmap = {
      name: name.trim(),
      collections: selectedCollections.map((c) => ({
        id: c.collection_id,
        title: c.name,
      })),
      preference: pref,
      days: pref === "days" ? days : estimation.daysNeeded,
      hours_per_day: estimation.hoursPerDay,
      total_words: estimation.totalWords,
      total_lessons: estimation.totalLessons,
    };

    console.log("Roadmap created:", roadmap);
    alert("Đã tạo lộ trình thành công!");
    navigate(PATHS.roadmap());
  };

  return (
    <div className="grow flex flex-col px-4 sm:px-6 py-8 max-w-3xl mx-auto w-full">
      <Button
        kind="text"
        color="slate"
        size="sm"
        spacing="none"
        icon={ChevronLeft}
        iconPosition="left"
        className="mb-6 w-fit"
        onClick={() => {
          if (step > 1) setStep((s) => (s - 1) as Step);
          else navigate(PATHS.dashboard);
        }}
      >
        {step === 1 ? "Quay lại" : "Quay lại"}
      </Button>

      <h1 className="text-3xl font-bold text-gray-800 mb-2">Tạo lộ trình</h1>
      <p className="text-gray-500 mb-8">
        Thiết lập lộ trình học tập phù hợp với mục tiêu của bạn.
      </p>

      <div className="flex items-center justify-between mb-10">
        {STEPS.map((s, idx) => {
          const active = step === s.key;
          const done = step > s.key;
          return (
            <div key={s.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={twMerge(
                    "flex items-center justify-center rounded-full w-10 h-10 transition-all duration-200",
                    active && "bg-rose-500 text-white scale-110",
                    done && "bg-rose-100 text-rose-700",
                    !active && !done && "bg-slate-200 text-slate-500",
                  )}
                >
                  {done ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <s.icon size={18} />
                  )}
                </div>
                <span
                  className={twMerge(
                    "text-xs font-medium hidden sm:block",
                    active && "text-rose-700",
                    done && "text-rose-600",
                    !active && !done && "text-slate-400",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="mx-2 h-[2px] flex-1 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-300"
                    style={{ width: done ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">
              Bước 1: Tên lộ trình
            </h2>
            <p className="text-gray-500 text-sm">
              Đặt tên để dễ nhận biết lộ trình của bạn.
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Tên lộ trình
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: N3 trong 30 ngày"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">
              Bước 2: Chọn bộ sưu tập
            </h2>
            <p className="text-gray-500 text-sm">
              Chọn các bộ sưu tập bạn muốn đưa vào lộ trình.
            </p>
            <div className="max-h-[360px] overflow-y-auto p-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {collections.map((collection) => {
                  const selected = selectionIds.includes(
                    collection.collection_id
                  );
                  return (
                    <Card
                      key={collection.collection_id}
                      item={{
                        id: collection.collection_id,
                        title: collection.name,
                        subtitle: `${collection.topic_count ?? 0} chủ đề`,
                      }}
                      selected={selected}
                      onClick={() => toggleSelection(collection)}
                      hoverEffect
                      color="rose"
                      kind="outline"
                      borderWidth="sm"
                      className="transition-all"
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">
              Bước 3: Thời gian hoàn thành
            </h2>
            <p className="text-gray-500 text-sm">
              Chọn một trong hai cách tính thời gian học.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPref("days")}
                className={twMerge(
                  "flex flex-col items-start gap-2 rounded-xl border px-4 py-4 transition-all duration-200",
                  pref === "days"
                    ? "border-rose-500 bg-rose-50 shadow-sm"
                    : "border-gray-300 bg-white hover:border-gray-400",
                )}
              >
                <CalendarDays
                  size={24}
                  className={twMerge(
                    "text-gray-500",
                    pref === "days" && "text-rose-600",
                  )}
                />
                <span className="text-sm font-semibold text-gray-800">
                  Theo số ngày
                </span>
                <span className="text-xs text-gray-500">
                  Tôi muốn hoàn thành trong bao lâu.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPref("hours")}
                className={twMerge(
                  "flex flex-col items-start gap-2 rounded-xl border px-4 py-4 transition-all duration-200",
                  pref === "hours"
                    ? "border-rose-500 bg-rose-50 shadow-sm"
                    : "border-gray-300 bg-white hover:border-gray-400",
                )}
              >
                <Clock
                  size={24}
                  className={twMerge(
                    "text-gray-500",
                    pref === "hours" && "text-rose-600",
                  )}
                />
                <span className="text-sm font-semibold text-gray-800">
                  Theo số giờ/ngày
                </span>
                <span className="text-xs text-gray-500">
                  Tôi học mỗi ngày bao nhiêu giờ.
                </span>
              </button>
            </div>

            {pref === "days" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Số ngày hoàn thành
                </label>
                <input
                  type="number"
                  value={days}
                  onChange={(e) =>
                    setDays(Math.max(1, parseInt(e.target.value || "1", 10)))
                  }
                  min={1}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition"
                />
              </div>
            )}

            {pref === "hours" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Số giờ học mỗi ngày
                </label>
                <input
                  type="number"
                  value={hoursPerDay}
                  onChange={(e) =>
                    setHoursPerDay(
                      Math.max(0.5, parseFloat(e.target.value || "0.5"))
                    )
                  }
                  min={0.5}
                  step={0.5}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition"
                />
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">
              Bước 4: Xem trước lộ trình
            </h2>
            <p className="text-gray-500 text-sm">
              Kiểm tra lại thông tin trước khi tạo lộ trình.
            </p>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
              <div>
                <p className="text-xs font-bold uppercase text-gray-500 tracking-wide mb-1">
                  Tên lộ trình
                </p>
                <p className="text-sm font-semibold text-gray-800">{name}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-gray-500 tracking-wide mb-1">
                  Các bộ sưu tập
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedCollections.map((c) => (
                    <span
                      key={c.collection_id}
                      className="text-xs font-medium bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded-lg"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-gray-500 tracking-wide mb-1">
                  Cách tính thời gian
                </p>
                <p className="text-sm text-gray-700">
                  {pref === "days"
                    ? `Hoàn thành trong ${estimation.daysNeeded} ngày`
                    : `Học ${hoursPerDay} giờ mỗi ngày`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
                <p className="text-xs font-bold uppercase text-rose-600 mb-1">
                  Số bài học
                </p>
                <p className="text-2xl font-bold text-rose-700">
                  {estimation.totalLessons}
                </p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
                <p className="text-xs font-bold uppercase text-rose-600 mb-1">
                  Từ vựng
                </p>
                <p className="text-2xl font-bold text-rose-700">
                  {estimation.totalWords}
                </p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
                <p className="text-xs font-bold uppercase text-rose-600 mb-1">
                  Số ngày
                </p>
                <p className="text-2xl font-bold text-rose-700">
                  {estimation.daysNeeded}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 mt-auto">
        {step > 1 && (
          <Button
            kind="soft"
            color="slate"
            size="md"
            spacing="md"
            radius="full"
            className="px-5"
            onClick={() => setStep((s) => (s - 1) as Step)}
          >
            Quay lại
          </Button>
        )}
        <Button
          kind="solid"
          color="rose"
          size="md"
          spacing="md"
          radius="full"
          disabled={!canNext}
          icon={step === 4 ? undefined : ChevronRight}
          iconPosition="right"
          className="px-5"
          onClick={() => {
            if (step < 4) setStep((s) => (s + 1) as Step);
            else handleSave();
          }}
        >
          {step === 4 ? "Tạo lộ trình" : "Tiếp theo"}
        </Button>
      </div>
    </div>
  );
};