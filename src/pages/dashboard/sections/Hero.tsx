import { ArrowRight, Sparkles, Play } from "lucide-react";
import { Button } from "../../../components";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/60 via-white to-white">
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-rose-200/40 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-28">
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
            <Sparkles className="h-3.5 w-3.5" />
            Nền tảng học tiếng Nhật thế hệ mới
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Chinh phục{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-transparent">
                tiếng Nhật
              </span>
            </span>{" "}
            theo cách của bạn
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Học từ vựng, Kanji, ngữ pháp và luyện thi JLPT với lộ trình cá nhân hóa. 
            Thiết kế bởi người yêu tiếng Nhật, dành cho người học nghiêm túc.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="primary" icon={ArrowRight} iconPosition="right">
              Bắt đầu học ngay
            </Button>
            <Button variant="secondary" icon={Play}>
              Khám phá
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
            <div className="flex -space-x-2">
              {["bg-rose-400", "bg-rose-500", "bg-rose-600", "bg-rose-700"].map((c, i) => (
                <div key={i} className={`h-8 w-8 rounded-full border-2 border-white ${c}`} />
              ))}
            </div>
            <span><b className="text-slate-900">10,000+</b> học viên đang học</span>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="relative aspect-square w-full max-w-lg">
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-rose-500 to-rose-400 rotate-6 opacity-20" />
            <div className="relative h-full w-full rounded-[2.5rem] bg-white p-8 shadow-2xl shadow-rose-500/10 border border-slate-100">
              <div className="grid h-full grid-cols-3 grid-rows-3 gap-3">
                {["日", "本", "語", "学", "習", "漢", "字", "文", "法"].map((ch, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-rose-50 text-3xl font-bold text-slate-800 shadow-sm transition-transform hover:scale-105 hover:from-rose-100 hover:to-rose-100 hover:text-rose-700"
                    style={{ animation: `float 3s ease-in-out ${i * 0.15}s infinite` }}
                  >
                    {ch}
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-4 shadow-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 font-bold">A+</div>
                <div>
                  <div className="text-xs text-slate-500">Điểm JLPT N3</div>
                  <div className="text-sm font-bold text-slate-900">180 / 180</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </section>
  );
}
