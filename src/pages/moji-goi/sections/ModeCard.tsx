import { Check } from "lucide-react";

export const ModeCard = ({
  icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`text-left p-4 rounded-2xl border-2 transition flex items-start gap-3 ${
      selected
        ? "border-amber-400 bg-amber-50/60 shadow-sm"
        : "border-amber-100 bg-white hover:border-amber-200"
    }`}
  >
    <div
      className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${
        selected ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-500"
      }`}
    >
      {icon}
    </div>
    <div className="grow min-w-0">
      <p className="font-semibold text-gray-800 text-sm">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
        {description}
      </p>
    </div>
    <div
      className={`w-4.5 h-4.5 rounded-full border-2 grid place-items-center shrink-0 mt-1 ${
        selected ? "border-amber-500 bg-amber-500" : "border-gray-300"
      }`}
    >
      {selected && <Check size={10} className="text-white" />}
    </div>
  </button>
);
