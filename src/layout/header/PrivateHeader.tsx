import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Logo, Button } from "../../components";
import { logout, useAppDispatch } from "../../store";

export function PrivateHeader() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isJLPTActive = location.pathname === "/collection";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

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
          <Link
            to="/collection"
            className={`text-sm font-medium transition-colors hover:text-rose-600 ${isJLPTActive ? "text-rose-600 font-semibold" : "text-slate-700"}`}
          >
            JLPT
          </Link>
          <Link
            to="/kaiwa"
            className="text-sm font-medium text-slate-700 transition-colors hover:text-rose-600"
          >
            Kaiwa
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
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
              href="/collection"
              className={`block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 ${isJLPTActive ? "text-rose-600 bg-rose-50" : "text-slate-700"}`}
            >
              JLPT
            </a>
            <a
              href="/kaiwa"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Kaiwa
            </a>
            <div className="mt-3 flex flex-col gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={handleLogout}
              >
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
