import { ArrowRight } from "lucide-react";

type Level = {
  level: string;
  title: string;
  desc: string;
  hours: string;
  color: string;
  ring: string;
};

const levels = [
  { level: "N5", title: "Cơ bản", desc: "Nắm vững Hiragana, Katakana và giao tiếp cơ bản.", hours: "150h", color: "bg-rose-500", ring: "ring-rose-100" },
  { level: "N4", title: "Sơ cấp", desc: "Hiểu hội thoại đơn giản, khoảng 300 Kanji.", hours: "300h", color: "bg-rose-600", ring: "ring-rose-100" },
  { level: "N3", title: "Trung cấp", desc: "Giao tiếp trong đời sống hàng ngày, 650 Kanji.", hours: "450h", color: "bg-rose-500", ring: "ring-rose-100" },
  { level: "N2", title: "Trung cao cấp", desc: "Hiểu tin tức, tài liệu công việc, 1,000 Kanji.", hours: "600h", color: "bg-rose-600", ring: "ring-rose-100" },
  { level: "N1", title: "Cao cấp", desc: "Thành thạo mọi tình huống, 2,000+ Kanji.", hours: "900h", color: "bg-rose-700", ring: "ring-rose-100" },
];

export function LearningPath() {
  return (
    <section id="jlpt" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
            Lộ trình JLPT
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Từ N5 đến N1 — mỗi bước đều rõ ràng
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Lộ trình được thiết kế theo chuẩn JLPT, phù hợp với mọi trình độ.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-5">
          <LevelCard levels={levels} />
        </div>
      </div>
    </section>
  );
}

const LevelCard = ({ levels }: { levels: Level[] }) => {
  return (<>
    {levels.map((l, i) => (
            <div
              key={l.level}
              className="group relative rounded-3xl border border-slate-200/60 bg-white p-6 transition-all hover:-translate-y-1 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/10"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${l.color} text-white font-bold text-lg shadow-md ring-8 ${l.ring}`}>
                {l.level}
              </div>
              <h3 className="mt-5 text-base font-semibold text-slate-900">{l.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{l.desc}</p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs font-medium text-slate-500">~{l.hours}</span>
                <ArrowRight className="h-4 w-4 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-rose-600" />
              </div>
              {i < levels.length - 1 && (
                <div className="absolute top-12 -right-2 hidden h-0.5 w-4 bg-slate-200 md:block" />
              )}
            </div>
          ))}
  </>)
}