import type { ReactNode } from "react";
import { Library } from "lucide-react";
import { Logo } from "../components";

type AuthLayoutProps = {
  children: ReactNode;
};

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding with visual effects */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-rose-700 via-rose-800 to-rose-900 text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Animated background circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Floating Japanese characters */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 text-6xl text-white/8 font-bold animate-bounce" style={{ animationDuration: '3s' }}>学</div>
          <div className="absolute top-40 right-32 text-5xl text-white/8 font-bold animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>語</div>
          <div className="absolute bottom-32 left-32 text-7xl text-white/8 font-bold animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>日</div>
          <div className="absolute bottom-20 right-20 text-6xl text-white/8 font-bold animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}>本</div>
          <div className="absolute top-1/2 left-1/4 text-5xl text-white/8 font-bold animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '2s' }}>語</div>
        </div>

        {/* Content */}
        <div className="max-w-md relative z-10">
          <Logo size="lg" asLink={false} variant="dark" />
          
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Học tiếng Nhật<br />thông minh
          </h1>
          
          <p className="text-rose-200 text-lg mb-8 leading-relaxed">
            Khám phá phương pháp học từ vựng và kanji hiệu quả với công nghệ hiện đại.
          </p>

          {/* Feature highlights */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📚</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Từ vựng phong phú</h3>
                <p className="text-sm text-rose-200">Hàng ngàn từ vựng được phân loại theo chủ đề</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">✍️</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Luyện viết kanji</h3>
                <p className="text-sm text-rose-200">Thực hành viết chữ Hán một cách chính xác</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🎯</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Flashcard thông minh</h3>
                <p className="text-sm text-rose-200">Học từ vựng hiệu quả với thuật toán spaced repetition</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100 p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 grid place-items-center">
              <Library className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-lg font-semibold text-gray-800">Moji-goi</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};