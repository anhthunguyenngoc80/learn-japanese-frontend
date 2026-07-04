import {
  BookOpen, Brain, PenLine, Layers, GraduationCap, Trophy, LineChart,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
};

const features: Feature[] = [
  { icon: BookOpen, title: "Học từ vựng", desc: "Hơn 10,000 từ vựng theo chủ đề với ví dụ và phát âm chuẩn.", color: "from-rose-500 to-rose-600" },
  { icon: Brain, title: "Học Kanji", desc: "2,000+ Kanji sắp xếp theo cấp độ JLPT, có bộ thủ và stroke order.", color: "from-rose-500 to-rose-600" },
  { icon: Layers, title: "Ngữ pháp", desc: "500+ mẫu ngữ pháp giải thích rõ ràng kèm bài tập.", color: "from-rose-500 to-rose-600" },
  { icon: GraduationCap, title: "Flashcard", desc: "Ghi nhớ hiệu quả với thuật toán Spaced Repetition.", color: "from-rose-500 to-rose-600" },
  { icon: PenLine, title: "Luyện viết", desc: "Tập viết Hiragana, Katakana và Kanji theo nét chuẩn.", color: "from-rose-500 to-rose-600" },
  { icon: Trophy, title: "Luyện JLPT", desc: "Đề thi thử từ N5 đến N1 sát với kỳ thi thật.", color: "from-rose-500 to-rose-600" },
  { icon: LineChart, title: "Theo dõi tiến độ", desc: "Biểu đồ trực quan, thống kê chi tiết hành trình học.", color: "from-rose-600 to-rose-500" },
];

export function Features() {
  return (
    <section id="features" className="bg-slate-50/50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Tất cả những gì bạn cần để học tiếng Nhật
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Bộ công cụ toàn diện, được thiết kế cho hành trình chinh phục Nihongo của bạn.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard features={features} />
        </div>
      </div>
    </section>
  );
}

const FeatureCard = ({ features }: { features: Feature[] }) => {
  return (
    <>
      {features.map((f) => (
        <div
          key={f.title}
          className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/10"
        >
          <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-md`}>
            <f.icon className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-slate-900">{f.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
          <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-rose-500 to-rose-400 transition-transform duration-300 group-hover:scale-x-100" />
        </div>
      ))}
    </>
  )
}