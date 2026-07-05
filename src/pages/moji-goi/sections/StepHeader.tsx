import { Check } from "lucide-react";

export const StepHeader = ({
  step,
  title,
  hint,
  done,
}: {
  step: number;
  title: string;
  hint?: string;
  done?: boolean;
}) => (
  <div className="flex items-start gap-2.5 mb-3">
    <div
      className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold shrink-0 ${
        done ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
      }`}
    >
      {done ? <Check size={13} /> : step}
    </div>
    <div className="min-w-0">
      <h3 className="font-semibold text-gray-800 leading-tight">{title}</h3>
      {hint && (
        <p className="text-xs text-gray-400 leading-tight mt-0.5">{hint}</p>
      )}
    </div>
  </div>
);
