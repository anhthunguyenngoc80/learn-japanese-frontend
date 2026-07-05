import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button, InputField } from "../../components";
import * as api from "../../api";
import * as constant from "../../constant";
import { loginSuccess, useAppDispatch } from "../../store";

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email không hợp lệ";

    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";
    else if (formData.password.length < 6)
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy[field];
          return copy;
        });
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await api.login({
        email: formData.email,
        password: formData.password,
      });

      // Assuming API returns { user: { id, username, email }, token: string }
      dispatch(loginSuccess({ user: response.data }));
      navigate(constant.PATHS.collection);
    } catch (error) {
      console.error("Login failed:", error);
      setErrors((prev) => ({
        ...prev,
        general:
          "Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative">
      <div className="absolute -top-12 left-0">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          <span className="font-medium">Quay lại Dashboard</span>
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Đăng nhập</h2>
        <p className="text-slate-500 mt-2">
          Chào mừng bạn trở lại! Hãy đăng nhập để tiếp tục học tập.
        </p>
      </div>

      {errors.general && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 ring-1 ring-red-500/20 text-red-800 text-sm font-medium">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <InputField
          id="email"
          label="Email"
          type="email"
          placeholder="example@gmail.com"
          value={formData.email}
          onChange={handleChange("email")}
          error={errors.email}
        />

        <InputField
          id="password"
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange("password")}
          error={errors.password}
        />

        <div className="flex items-center justify-end">
          <a
            href="#"
            className="text-sm text-rose-600 hover:text-rose-700 hover:underline font-medium"
          >
            Quên mật khẩu?
          </a>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3 text-base font-semibold bg-rose-600 hover:bg-rose-700"
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
        </Button>
      </form>

      <p className="mt-10 text-center text-slate-600">
        Chưa có tài khoản?{" "}
        <Link
          to="/register"
          className="text-rose-600 font-bold hover:text-rose-700 hover:underline decoration-rose-500/30 underline-offset-4"
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
};
