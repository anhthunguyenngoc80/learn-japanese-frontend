import type { ComponentType, SVGProps } from "react";

export interface SelectionOption {
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;
  label: string;
  subtitle?: string;
  onClick: () => void;
  iconBg?: string;
  iconColor?: string;
}

export interface SelectionModalProps {
  title: string;
  description?: string;
  options: SelectionOption[];
  onCancel?: () => void;
  cancelLabel?: string;
}

export const SelectionModal = ({
  title,
  description,
  options,
  onCancel,
  cancelLabel = "Huỷ",
}: SelectionModalProps) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 mb-5">{description}</p>
      )}
      <div className="flex flex-col gap-3">
        {options.map((option, index) => {
          const Icon = option.icon;
          return (
            <button
              key={index}
              onClick={option.onClick}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 transition-all text-left group"
            >
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br grid place-items-center shrink-0 group-hover:scale-110 transition-transform ${
                  option.iconBg ?? "from-amber-100 to-amber-200"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${option.iconColor ?? "text-amber-600"}`}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">
                  {option.label}
                </span>
                {option.subtitle && (
                  <span className="text-xs text-gray-400">
                    {option.subtitle}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-4 w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
        >
          {cancelLabel}
        </button>
      )}
    </div>
  );
};