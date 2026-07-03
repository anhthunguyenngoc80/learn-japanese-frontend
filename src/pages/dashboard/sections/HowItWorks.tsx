import { Route, BookMarked, Dumbbell, TrendingUp, type LucideIcon } from "lucide-react";
import { GradientButton } from "../../../components";

type Step = { n: string; icon: LucideIcon; title: string; desc: string };

const steps: Step[] = [
  { n: "01", icon: Route, title: "Chọn lộ trình", desc: "Xác định mục tiêu và chọn cấp độ JLPT phù hợp với bạn." },
  { n: "02", icon: BookMarked, title: "Học bài", desc: "Học từ vựng, Kanji và ngữ pháp theo lộ trình cá nhân hóa." },
  { n: "03", icon: Dumbbell, title: "Luyện tập", desc: "Củng cố kiến thức với flashcard, bài tập và đề thi thử." },
  { n: "04", icon: TrendingUp, title: "Theo dõi tiến bộ", desc: "Xem biểu đồ, phân tích điểm mạnh yếu và cải thiện." },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden bg-gradient-to-b from-slate-50/50 to-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Cách hoạt động
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Bốn bước đơn giản để bắt đầu hành trình chinh phục tiếng Nhật.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StepCard steps={steps} />
        </div>

        <div className="mt-16 rounded-3xl bg-gradient-to-br from-rose-600 to-rose-500 p-10 text-center shadow-xl shadow-rose-500/20 sm:p-14">
          <h3 className="text-2xl font-bold text-white sm:text-3xl">Sẵn sàng bắt đầu?</h3>
          <div className="mx-auto mt-3 max-w-xl text-rose-50">
            Tham gia cùng hàng nghìn học viên đang chinh phục tiếng Nhật mỗi ngày.
          </div>
          <GradientButton>Đăng ký miễn phí</GradientButton>
        </div>
      </div>
    </section>
  );
}

const StepCard = ({ steps }: { steps: Step[] }) => {
  return (<>{steps.map((s) => (
    <div
      key={s.n}
      className="relative rounded-3xl border border-slate-200/60 bg-white p-7 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10"
    >
      <span className="absolute right-6 top-6 text-4xl font-bold text-slate-100">{s.n}</span>
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <s.icon className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-900">{s.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.desc}</p>
    </div>
  ))}</>)
}