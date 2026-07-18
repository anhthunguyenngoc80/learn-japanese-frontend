import { Check } from "lucide-react";
import type { ReactNode } from "react";

export const StepHeader = ({
  step,
  title,
  hint,
  done,
  rightAction,
  className,
}: {
  step: number;
  title: string;
  hint?: string;
  done?: boolean;
  rightAction?: ReactNode;
  className?: string;
}) => (
  <div className={`flex gap-2.5 mb-3 ${className}`}>
    <div
      className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold shrink-0 ${
        done ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
      }`}
    >
      {done ? <Check size={13} /> : step}
    </div>
    <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
      <div className="min-w-0">
        <h3 className="font-semibold text-gray-800 leading-tight">{title}</h3>
        {hint && (
          <p className="text-xs text-gray-400 leading-tight mt-0.5">{hint}</p>
        )}
      </div>
      {rightAction && <div className="shrink-0">{rightAction}</div>}
    </div>
  </div>
);
