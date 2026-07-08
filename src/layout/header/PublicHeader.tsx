import { NavLink, useNavigate } from "react-router-dom";
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

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 inline-flex items-center gap-2 ${
                isActive
                  ? "text-rose-700 bg-rose-50 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`
            }
          >
            {({ isActive }) => (
              <>
                Trang chủ
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-rose-500" />
                )}
              </>
            )}
          </NavLink>
          <a
            href="#jlpt"
            className="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/60"
          >
            JLPT
          </a>
          <a
            href="#features"
            className="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/60"
          >
            Tính năng
          </a>
          <a
            href="#how"
            className="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/60"
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
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium ${
                isActive
                  ? "text-rose-700 bg-rose-50"
                  : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            {({ isActive }) => (
              <>
                Trang chủ
                {isActive && (
                  <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}
              </>
            )}
          </NavLink>
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
