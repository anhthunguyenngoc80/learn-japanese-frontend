import { useState } from "react";
import { Link } from "react-router-dom";

import { Button, InputField } from "../../components";
import * as api from "../../api";

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [agreed, setAgreed] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username.trim()) newErrors.username = "Vui lòng nhập tên đăng nhập";
    else if (formData.username.trim().length < 3)
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";

    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email không hợp lệ";

    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";
    else if (formData.password.length < 6)
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";

    if (!formData.confirmPassword) newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";

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
    setSuccess("");
    if (!validate()) return;

    console.log("Registered user:", formData.username, formData.email);

    try {
      await api.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      setSuccess("Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...");
      console.log("Registered user:", formData.username, formData.email);
      setTimeout(() => (window.location.href = "/login"), 1500);
    } catch (error) {
      console.error("Registration failed:", error);
      setErrors((prev) => ({
        ...prev,
        general: "Đăng ký thất bại. Vui lòng thử lại sau.",
      }));
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
        <h2 className="text-3xl font-bold text-slate-900">Tạo tài khoản</h2>
        <p className="text-slate-500 mt-2">
          Điền thông tin bên dưới để bắt đầu trải nghiệm học tập.
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 ring-1 ring-emerald-500/20 text-emerald-800 text-sm font-medium">
          {success}
        </div>
      )}

      {errors.general && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 ring-1 ring-red-500/20 text-red-800 text-sm font-medium">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <InputField
          id="username"
          label="Tên đăng nhập"
          type="text"
          placeholder="john_doe"
          value={formData.username}
          onChange={handleChange("username")}
          error={errors.username}
        />

        <InputField
          id="email"
          label="Email"
          type="email"
          placeholder="example@gmail.com"
          value={formData.email}
          onChange={handleChange("email")}
          error={errors.email}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            id="password"
            label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange("password")}
            error={errors.password}
          />
          <InputField
            id="confirmPassword"
            label="Xác nhận"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange("confirmPassword")}
            error={errors.confirmPassword}
          />
        </div>

        <div className="flex items-start gap-3 py-2">
          <input
            id="terms"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500"
          />
          <label htmlFor="terms" className="text-sm text-slate-600 leading-snug">
            Tôi đồng ý với{" "}
            <a href="#" className="text-rose-600 hover:text-rose-700 hover:underline font-medium">
              Điều khoản dịch vụ
            </a>{" "}
            và{" "}
            <a href="#" className="text-rose-600 hover:text-rose-700 hover:underline font-medium">
              Chính sách bảo mật
            </a>
            .
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3 text-base font-semibold bg-rose-600 hover:bg-rose-700"
          disabled={!agreed}
        >
          Đăng Ký
        </Button>
      </form>

      <p className="mt-10 text-center text-slate-600">
        Đã có tài khoản?{" "}
        <Link
          to="/login"
          className="text-rose-600 font-bold hover:text-rose-700 hover:underline decoration-rose-500/30 underline-offset-4"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
};