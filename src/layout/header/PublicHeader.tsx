import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Logo, Button, IconButton } from "../../components";
import { PATHS } from "../../constant/Path";

export function PublicHeader() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo size="md" showHoverEffect={true} />

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            className="text-sm font-medium text-slate-700 transition-colors hover:text-rose-600"
          >
            Trang chủ
          </Link>
          <a
            href="#jlpt"
            className="text-sm font-medium text-slate-700 transition-colors hover:text-rose-600"
          >
            JLPT
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-slate-700 transition-colors hover:text-rose-600"
          >
            Tính năng
          </a>
          <a
            href="#how"
            className="text-sm font-medium text-slate-700 transition-colors hover:text-rose-600"
          >
            Lộ trình
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            kind="ghost"
            color="slate"
            size="sm"
            spacing="sm"
            onClick={() => navigate(PATHS.login)}
          >
            Đăng nhập
          </Button>
          <Button
            kind="elevated"
            size="sm"
            spacing="sm"
            onClick={() => navigate(PATHS.register)}
          >
            Đăng ký
          </Button>
        </div>

        <IconButton
          onClick={() => setOpen(!open)}
          size="md"
          spacing="md"
          className="md:hidden"
          aria-label="Menu"
          icon={open ? X : Menu}
        />
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="space-y-1 px-4 py-4">
            <a
              href="/"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Trang chủ
            </a>
            <a
              href="#jlpt"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              JLPT
            </a>
            <a
              href="#features"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Tính năng
            </a>
            <div className="mt-3 flex flex-col gap-2 pt-3 border-t border-slate-100">
              <Button
                kind="ghost"
                color="slate"
                size="sm"
                spacing="sm"
                fullWidth
                onClick={() => navigate(PATHS.login)}
              >
                Đăng nhập
              </Button>
              <Button
                kind="elevated"
                size="sm"
                spacing="sm"
                fullWidth
                onClick={() => navigate(PATHS.register)}
              >
                Đăng ký
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
