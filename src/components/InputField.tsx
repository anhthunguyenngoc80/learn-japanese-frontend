import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputClasses = error
      ? "w-full px-4 py-3 bg-white border border-rose-300 bg-rose-50/40 rounded-xl transition-all text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
      : "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl transition-all text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500";

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={id}
          className="text-sm font-semibold text-slate-700 ml-1 block text-left"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={`${inputClasses} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-rose-500 font-medium ml-1">{error}</p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";