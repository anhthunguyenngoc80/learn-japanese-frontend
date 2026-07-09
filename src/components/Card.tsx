import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import { MoreVertical, type LucideIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";
import {
  Button,
  IconButton}
  from "./Button";
import {
  type ComponentKind,
  type ComponentRadius,
  type ComponentSpacing, colorStyles, radiusStyles, type AccentColor, 
  stripHoverClasses} from "../constant";

/** Badge nền cho icon — mặc định dùng tông nhạt, riêng khi Card kind="solid" thì đổi sang lớp phủ trắng mờ. */
const iconBadgeStyles: Record<AccentColor, string> = {
  rose: "bg-rose-100 text-rose-600",
  red: "bg-red-100 text-red-600",
  amber: "bg-amber-100 text-amber-600",
  emerald: "bg-emerald-100 text-emerald-600",
  teal: "bg-teal-100 text-teal-600",
  blue: "bg-blue-100 text-blue-600",
  indigo: "bg-indigo-100 text-indigo-600",
  violet: "bg-violet-100 text-violet-600",
  sky: "bg-sky-100 text-sky-600",
  slate: "bg-slate-100 text-slate-600",
  white: "bg-white/15 text-white",
};

const iconBadgeOnSolidStyles: Record<AccentColor, string> = {
  rose: "bg-white text-rose-700",
  red: "bg-white/15 text-white",
  amber: "bg-white/15 text-white",
  emerald: "bg-white/15 text-white",
  teal: "bg-white/15 text-white",
  blue: "bg-white/15 text-white",
  indigo: "bg-white/15 text-white",
  violet: "bg-white/15 text-white",
  sky: "bg-white/15 text-white",
  slate: "bg-white/15 text-white",
  white: "bg-slate-800/10 text-slate-800",
};

/** Track & fill cho thanh tiến độ, đổi theo màu — riêng "solid" dùng lớp phủ trắng mờ để nổi trên nền đặc. */
const progressStyles: Record<AccentColor, { track: string; fill: string }> = {
  rose: { track: "bg-rose-100", fill: "bg-rose-600" },
  red: { track: "bg-red-100", fill: "bg-red-600" },
  amber: { track: "bg-amber-100", fill: "bg-amber-500" },
  emerald: { track: "bg-emerald-100", fill: "bg-emerald-600" },
  teal: { track: "bg-teal-100", fill: "bg-teal-600" },
  blue: { track: "bg-blue-100", fill: "bg-blue-600" },
  indigo: { track: "bg-indigo-100", fill: "bg-indigo-600" },
  violet: { track: "bg-violet-100", fill: "bg-violet-600" },
  sky: { track: "bg-sky-100", fill: "bg-sky-600" },
  slate: { track: "bg-slate-200", fill: "bg-slate-700" },
  white: { track: "bg-white/20", fill: "bg-white/80" },
};

const progressOnSolidStyles = { track: "bg-white", fill: "bg-white/90" };

/** Style trạng thái "selected" — dùng khi Card đóng vai trò lựa chọn (vd: chọn gói, chọn hạng mục). */
const selectedRingStyles: Record<AccentColor, string> = {
  rose: "ring-2 ring-rose-500 ring-offset-2",
  red: "ring-2 ring-red-500 ring-offset-2",
  amber: "ring-2 ring-amber-500 ring-offset-2",
  emerald: "ring-2 ring-emerald-500 ring-offset-2",
  teal: "ring-2 ring-teal-500 ring-offset-2",
  blue: "ring-2 ring-blue-500 ring-offset-2",
  indigo: "ring-2 ring-indigo-500 ring-offset-2",
  violet: "ring-2 ring-violet-500 ring-offset-2",
  sky: "ring-2 ring-sky-500 ring-offset-2",
  slate: "ring-2 ring-slate-400 ring-offset-2",
  white: "ring-2 ring-white ring-offset-2",
};

/** Màu chữ + hover cho từng mục trong menu "...", dùng lại bảng màu chung. */
const menuItemTextStyles: Record<AccentColor, string> = {
  rose: "text-rose-700 hover:bg-rose-50",
  red: "text-red-700 hover:bg-red-50",
  amber: "text-amber-700 hover:bg-amber-50",
  emerald: "text-emerald-700 hover:bg-emerald-50",
  teal: "text-teal-700 hover:bg-teal-50",
  blue: "text-blue-700 hover:bg-blue-50",
  indigo: "text-indigo-700 hover:bg-indigo-50",
  violet: "text-violet-700 hover:bg-violet-50",
  sky: "text-sky-700 hover:bg-sky-50",
  slate: "text-slate-700 hover:bg-slate-50",
  white: "text-slate-700 hover:bg-slate-50",
};

/** Padding cho toàn bộ nội dung Card — dùng chung thang đo với Button để nhất quán. */
const paddingStyles: Record<ComponentSpacing, string> = {
  none: "p-0",
  xxs: "p-2.5",
  xs: "p-4",
  sm: "p-5",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
};

/* ------------------------------------------------------------------ */
/*  Menu "..." ở góc trên bên phải Card                                 */
/* ------------------------------------------------------------------ */

export interface CardMenuItem {
  icon?: LucideIcon;
  label: string;
  onClick: () => void;
  /** Màu chữ riêng cho mục này, vd "red" cho hành động xoá. Mặc định "slate". */
  color?: AccentColor;
  disabled?: boolean;
}

interface CardMenuProps {
  items: CardMenuItem[];
  triggerColor: AccentColor;
  triggerAriaLabel?: string;
}

function CardMenu({
  items,
  triggerColor,
  triggerAriaLabel = "Tuỳ chọn khác",
}: CardMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      <IconButton
        icon={MoreVertical}
        aria-label={triggerAriaLabel}
        color={triggerColor}
        kind="ghost"
        size="sm"
        spacing="xs"
        onClick={() => setOpen((v) => !v)}
      />
      {open && (
        <div
          className="absolute right-0 top-full z-10 mt-1 min-w-40 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-lg"
          role="menu"
        >
          {items.map((menuItem, index) => (
            <button
              key={index}
              type="button"
              role="menuitem"
              disabled={menuItem.disabled}
              onClick={() => {
                setOpen(false);
                menuItem.onClick();
              }}
              className={twMerge(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors",
                menuItemTextStyles[menuItem.color ?? "slate"],
                menuItem.disabled && "pointer-events-none opacity-50",
              )}
            >
              {menuItem.icon && <menuItem.icon className="h-4 w-4 shrink-0" />}
              <span className="truncate">{menuItem.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

export interface CardData {
  id: string;
  title: string;
  subtitle?: string;
  /** 0–100. Chỉ ẩn thanh tiến độ khi để `undefined` (0% vẫn hiển thị thanh rỗng). */
  progress?: number;
  icon?: LucideIcon;
  buttonText?: string;
  onButtonClick?: () => void;
  buttonHref?: string;
}

export interface CardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onClick"
> {
  item: CardData;
  color?: AccentColor;
  kind?: ComponentKind;
  radius?: ComponentRadius;
  spacing?: ComponentSpacing;
  fullWidth?: boolean;
  selected?: boolean;
  /** Cho phép cả Card bấm được (vd: chọn thẻ), không chỉ nút bên trong. */
  onClick?: () => void;
  /** Ghi đè kind/color của nút hành động bên trong, mặc định tự chọn tương phản hợp lý theo `kind` của Card. */
  buttonKind?: ComponentKind;
  buttonColor?: AccentColor;
  /** Danh sách hành động hiện trong menu "..." ở góc trên bên phải. Bỏ trống thì không hiện nút menu. */
  menuItems?: CardMenuItem[];
  menuButtonLabel?: string;
  className?: string;
  hoverEffect: boolean
}

/* ------------------------------------------------------------------ */
/*  Card                                                                */
/* ------------------------------------------------------------------ */

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      item,
      color = "indigo",
      kind = "outline",
      radius = "lg",
      spacing = "md",
      fullWidth = true,
      selected = false,
      onClick,
      buttonKind,
      buttonColor,
      menuItems = [],
      menuButtonLabel,
      className = "",
      hoverEffect = true,
      ...rest
    },
    ref,
  ) => {
    const isSolid = kind === "solid";
    const isOnDark = isSolid || color === "white";

    const titleTextClass = isOnDark ? "text-white" : "text-foreground";
    const subtitleTextClass = isOnDark
      ? "text-white/70"
      : "text-muted-foreground";
    const labelTextClass = isOnDark ? "text-white/80" : "text-muted-foreground";

    const iconBadgeClass = isSolid
      ? iconBadgeOnSolidStyles[color]
      : iconBadgeStyles[color];

    const progress = isSolid ? progressOnSolidStyles : progressStyles[color];

    const resolvedButtonColor = buttonColor ?? (isOnDark ? "white" : color);
    const resolvedComponentKind = buttonKind ?? (isOnDark ? "soft" : "solid");

    const colorClass = hoverEffect
      ? colorStyles[color][kind]
      : stripHoverClasses(colorStyles[color][kind]);

    const containerClassName = twMerge(
      "flex flex-col transition-all",
      colorClass,
      radiusStyles[radius],
      paddingStyles[spacing],
      fullWidth ? "w-full" : "",
      onClick ? "cursor-pointer" : "",
      selected ? selectedRingStyles[color] : "",
      className,
    );

    return (
      <div
        ref={ref}
        className={containerClassName}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-pressed={onClick ? selected : undefined}
        {...rest}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {item.icon && (
              <span
                className={twMerge(
                  "grid size-12 shrink-0 place-items-center rounded-2xl text-2xl",
                  iconBadgeClass,
                )}
              >
                <item.icon />
              </span>
            )}
            <div className="min-w-0 text-start">
              <h3 className={twMerge("truncate font-bold", titleTextClass)}>
                {item.title}
              </h3>
              {item.subtitle && (
                <p className={twMerge("truncate text-xs", subtitleTextClass)}>
                  {item.subtitle}
                </p>
              )}
            </div>
          </div>

          {menuItems.length > 0 && (
            <CardMenu
              items={menuItems}
              triggerColor={isOnDark ? "white" : "slate"}
              triggerAriaLabel={menuButtonLabel}
            />
          )}
        </div>

        {item.progress !== undefined && (
          <div className="mt-5">
            <div
              className={twMerge(
                "mb-1.5 flex items-center justify-between text-xs font-semibold",
                labelTextClass,
              )}
            >
              <span>Tiến độ</span>
              <span className={twMerge("font-bold", titleTextClass)}>
                {item.progress}%
              </span>
            </div>
            <div
              className={twMerge(
                "h-2 overflow-hidden rounded-full",
                progress.track,
              )}
            >
              <div
                className={twMerge(
                  "h-full rounded-full transition-all duration-700",
                  progress.fill,
                )}
                style={{
                  width: `${Math.min(100, Math.max(0, item.progress))}%`,
                }}
              />
            </div>
          </div>
        )}

        {item.buttonText && (
          <Button
            className="mt-5"
            color={resolvedButtonColor}
            kind={resolvedComponentKind}
            fullWidth
            href={item.buttonHref}
            onClick={
              item.buttonHref
                ? undefined
                : (e: { stopPropagation: () => void }) => {
                    e.stopPropagation();
                    item.onButtonClick?.();
                  }
            }
          >
            {item.buttonText}
          </Button>
        )}
      </div>
    );
  },
);
Card.displayName = "Card";
