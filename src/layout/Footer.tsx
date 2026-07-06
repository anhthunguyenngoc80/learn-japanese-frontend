import { Mail } from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";
import { IconButton, Logo } from "../components";

const cols = [
  { title: "Sản phẩm", links: ["Học từ vựng", "Học Kanji", "Ngữ pháp", "Luyện JLPT"] },
  { title: "Công ty", links: ["Giới thiệu", "Liên hệ", "Tuyển dụng", "Blog"] },
  { title: "Pháp lý", links: ["Điều khoản", "Chính sách bảo mật", "Cookie", "Giấy phép"] },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo size="md" asLink={false} />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              Nền tảng học tiếng Nhật hiện đại, giúp bạn chinh phục JLPT từ N5 đến N1 một cách hiệu quả.
            </p>
            <div className="mt-6 flex gap-3">
              {[FaFacebook, FaXTwitter, FaYoutube, FaInstagram, Mail].map((Icon, i) => (
                <IconButton aria-label="abc" key={i} icon={Icon} />
              ))}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-semibold text-slate-900">{c.title}</h4>
              <ul className="mt-4 space-y-3">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-slate-600 transition-colors hover:text-rose-600">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">© 2026 NihongoGo. All rights reserved.</p>
          <p className="text-xs text-slate-500">Made with ❤️ for Japanese learners</p>
        </div>
      </div>
    </footer>
  );
}