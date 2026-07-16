import { Button } from "../../../components";

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
  <Button
    kind="outline"
    color="amber"
    onClick={onClick}
    className={`text-left flex items-start p-4 ${
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
  </Button>
);
