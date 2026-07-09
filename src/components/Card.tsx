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
  IconButton,
  type ButtonColor,
  type ButtonKind,
  type ButtonRadius,
  type ButtonSpacing,
} from "./Button";

/* ------------------------------------------------------------------ */
/*  Design tokens (dùng chung "màu" & "bo góc" & "spacing" với Button)  */
/* ------------------------------------------------------------------ */

/**
 * Kiểu bề mặt của Card:
 * - solid: nền đặc màu, chữ trắng (giống Button solid)
 * - elevated: nền trắng, đổ bóng theo màu, hover nổi lên
 * - soft: nền nhạt màu
 * - outline: nền trắng, chỉ có viền màu
 * - ghost: trong suốt, chỉ đổi nền nhẹ khi hover
 */
export type CardKind = "solid" | "elevated" | "soft" | "outline" | "ghost";

/* ------------------------------------------------------------------ */
/*  Color x Kind matrix cho bề mặt Card — liệt kê tĩnh để Tailwind JIT  */
/*  quét được (không dùng chuỗi động kiểu `bg-${c}-50`).                */
/* ------------------------------------------------------------------ */

const cardSurfaceStyles: Record<ButtonColor, Record<CardKind, string>> = {
  rose: {
    solid: "bg-rose-600 text-white",
    elevated:
      "bg-white border border-rose-100 shadow-lg shadow-rose-500/10 hover:shadow-xl hover:-translate-y-0.5",
    soft: "bg-rose-50 border border-rose-100",
    outline:
      "bg-white border-3 border-rose-200 hover:border-rose-300 hover:shadow-md hover:-translate-y-0.5",
    ghost: "bg-transparent border border-transparent hover:bg-rose-50",
  },
  red: {
    solid: "bg-red-600 text-white",
    elevated:
      "bg-white border border-red-100 shadow-lg shadow-red-500/10 hover:shadow-xl hover:-translate-y-0.5",
    soft: "bg-red-50 border border-red-100",
    outline:
      "bg-white border-3 border-red-200 hover:border-red-300 hover:shadow-md hover:-translate-y-0.5",
    ghost: "bg-transparent border border-transparent hover:bg-red-50",
  },
  amber: {
    solid: "bg-amber-500 text-white",
    elevated:
      "bg-white border border-amber-100 shadow-lg shadow-amber-500/10 hover:shadow-xl hover:-translate-y-0.5",
    soft: "bg-amber-50 border border-amber-100",
    outline:
      "bg-white border-3 border-amber-200 hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5",
    ghost: "bg-transparent border border-transparent hover:bg-amber-50",
  },
  emerald: {
    solid: "bg-emerald-600 text-white",
    elevated:
      "bg-white border border-emerald-100 shadow-lg shadow-emerald-500/10 hover:shadow-xl hover:-translate-y-0.5",
    soft: "bg-emerald-50 border border-emerald-100",
    outline:
      "bg-white border-3 border-emerald-200 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5",
    ghost: "bg-transparent border border-transparent hover:bg-emerald-50",
  },
  teal: {
    solid: "bg-teal-600 text-white",
    elevated:
      "bg-white border border-teal-100 shadow-lg shadow-teal-500/10 hover:shadow-xl hover:-translate-y-0.5",
    soft: "bg-teal-50 border border-teal-100",
    outline:
      "bg-white border-3 border-teal-200 hover:border-teal-300 hover:shadow-md hover:-translate-y-0.5",
    ghost: "bg-transparent border border-transparent hover:bg-teal-50",
  },
  blue: {
    solid: "bg-blue-600 text-white",
    elevated:
      "bg-white border border-blue-100 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:-translate-y-0.5",
    soft: "bg-blue-50 border border-blue-100",
    outline:
      "bg-white border-3 border-blue-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5",
    ghost: "bg-transparent border border-transparent hover:bg-blue-50",
  },
  indigo: {
    solid: "bg-indigo-600 text-white",
    elevated:
      "bg-white border border-indigo-100 shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:-translate-y-0.5",
    soft: "bg-indigo-50 border border-indigo-100",
    outline:
      "bg-white border-3 border-indigo-200 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5",
    ghost: "bg-transparent border border-transparent hover:bg-indigo-50",
  },
  violet: {
    solid: "bg-violet-600 text-white",
    elevated:
      "bg-white border border-violet-100 shadow-lg shadow-violet-500/10 hover:shadow-xl hover:-translate-y-0.5",
    soft: "bg-violet-50 border border-violet-100",
    outline:
      "bg-white border-3 border-violet-200 hover:border-violet-300 hover:shadow-md hover:-translate-y-0.5",
    ghost: "bg-transparent border border-transparent hover:bg-violet-50",
  },
  slate: {
    solid: "bg-slate-800 text-white",
    elevated:
      "bg-white border border-slate-200 shadow-lg shadow-slate-500/10 hover:shadow-xl hover:-translate-y-0.5",
    soft: "bg-slate-100 border border-slate-200",
    outline:
      "bg-white border-3 border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5",
    ghost: "bg-transparent border border-transparent hover:bg-slate-100",
  },
  white: {
    solid: "bg-white text-slate-800",
    elevated:
      "bg-white/10 border border-white/20 text-white backdrop-blur hover:bg-white/15 hover:-translate-y-0.5",
    soft: "bg-white/10 border border-white/10 text-white",
    outline:
      "bg-transparent border border-white/30 text-white hover:border-white/50",
    ghost:
      "bg-transparent border border-transparent text-white hover:bg-white/10",
  },
};

/** Badge nền cho icon — mặc định dùng tông nhạt, riêng khi Card kind="solid" thì đổi sang lớp phủ trắng mờ. */
const iconBadgeStyles: Record<ButtonColor, string> = {
  rose: "bg-rose-100 text-rose-600",
  red: "bg-red-100 text-red-600",
  amber: "bg-amber-100 text-amber-600",
  emerald: "bg-emerald-100 text-emerald-600",
  teal: "bg-teal-100 text-teal-600",
  blue: "bg-blue-100 text-blue-600",
  indigo: "bg-indigo-100 text-indigo-600",
  violet: "bg-violet-100 text-violet-600",
  slate: "bg-slate-100 text-slate-600",
  white: "bg-white/15 text-white",
};

const iconBadgeOnSolidStyles: Record<ButtonColor, string> = {
  rose: "bg-white/15 text-white",
  red: "bg-white/15 text-white",
  amber: "bg-white/15 text-white",
  emerald: "bg-white/15 text-white",
  teal: "bg-white/15 text-white",
  blue: "bg-white/15 text-white",
  indigo: "bg-white/15 text-white",
  violet: "bg-white/15 text-white",
  slate: "bg-white/15 text-white",
  white: "bg-slate-800/10 text-slate-800",
};

/** Track & fill cho thanh tiến độ, đổi theo màu — riêng "solid" dùng lớp phủ trắng mờ để nổi trên nền đặc. */
const progressStyles: Record<ButtonColor, { track: string; fill: string }> = {
  rose: { track: "bg-rose-100", fill: "bg-rose-600" },
  red: { track: "bg-red-100", fill: "bg-red-600" },
  amber: { track: "bg-amber-100", fill: "bg-amber-500" },
  emerald: { track: "bg-emerald-100", fill: "bg-emerald-600" },
  teal: { track: "bg-teal-100", fill: "bg-teal-600" },
  blue: { track: "bg-blue-100", fill: "bg-blue-600" },
  indigo: { track: "bg-indigo-100", fill: "bg-indigo-600" },
  violet: { track: "bg-violet-100", fill: "bg-violet-600" },
  slate: { track: "bg-slate-200", fill: "bg-slate-700" },
  white: { track: "bg-white/20", fill: "bg-white/80" },
};

const progressOnSolidStyles = { track: "bg-white/20", fill: "bg-white/90" };

const radiusStyles: Record<ButtonRadius, string> = {
  none: "rounded-none",
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  full: "rounded-3xl", // "full" trên Card không nên thành hình viên thuốc như Button, chỉ bo rất nhiều
};

/** Padding cho toàn bộ nội dung Card — dùng chung thang đo với Button để nhất quán. */
const paddingStyles: Record<ButtonSpacing, string> = {
  none: "p-0",
  xxs: "p-2.5",
  xs: "p-4",
  sm: "p-5",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
};

/** Style trạng thái "selected" — dùng khi Card đóng vai trò lựa chọn (vd: chọn gói, chọn hạng mục). */
const selectedRingStyles: Record<ButtonColor, string> = {
  rose: "ring-2 ring-rose-500 ring-offset-2",
  red: "ring-2 ring-red-500 ring-offset-2",
  amber: "ring-2 ring-amber-500 ring-offset-2",
  emerald: "ring-2 ring-emerald-500 ring-offset-2",
  teal: "ring-2 ring-teal-500 ring-offset-2",
  blue: "ring-2 ring-blue-500 ring-offset-2",
  indigo: "ring-2 ring-indigo-500 ring-offset-2",
  violet: "ring-2 ring-violet-500 ring-offset-2",
  slate: "ring-2 ring-slate-400 ring-offset-2",
  white: "ring-2 ring-white ring-offset-2",
};

/** Màu chữ + hover cho từng mục trong menu "...", dùng lại bảng màu chung. */
const menuItemTextStyles: Record<ButtonColor, string> = {
  rose: "text-rose-700 hover:bg-rose-50",
  red: "text-red-700 hover:bg-red-50",
  amber: "text-amber-700 hover:bg-amber-50",
  emerald: "text-emerald-700 hover:bg-emerald-50",
  teal: "text-teal-700 hover:bg-teal-50",
  blue: "text-blue-700 hover:bg-blue-50",
  indigo: "text-indigo-700 hover:bg-indigo-50",
  violet: "text-violet-700 hover:bg-violet-50",
  slate: "text-slate-700 hover:bg-slate-50",
  white: "text-slate-700 hover:bg-slate-50",
};

/* ------------------------------------------------------------------ */
/*  Menu "..." ở góc trên bên phải Card                                 */
/* ------------------------------------------------------------------ */

export interface CardMenuItem {
  icon?: LucideIcon;
  label: string;
  onClick: () => void;
  /** Màu chữ riêng cho mục này, vd "red" cho hành động xoá. Mặc định "slate". */
  color?: ButtonColor;
  disabled?: boolean;
}

interface CardMenuProps {
  items: CardMenuItem[];
  triggerColor: ButtonColor;
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
  color?: ButtonColor;
  kind?: CardKind;
  radius?: ButtonRadius;
  spacing?: ButtonSpacing;
  fullWidth?: boolean;
  selected?: boolean;
  /** Cho phép cả Card bấm được (vd: chọn thẻ), không chỉ nút bên trong. */
  onClick?: () => void;
  /** Ghi đè kind/color của nút hành động bên trong, mặc định tự chọn tương phản hợp lý theo `kind` của Card. */
  buttonKind?: ButtonKind;
  buttonColor?: ButtonColor;
  /** Danh sách hành động hiện trong menu "..." ở góc trên bên phải. Bỏ trống thì không hiện nút menu. */
  menuItems?: CardMenuItem[];
  menuButtonLabel?: string;
  className?: string;
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
    const resolvedButtonKind = buttonKind ?? (isOnDark ? "soft" : "solid");

    const containerClassName = twMerge(
      "flex flex-col transition-all",
      cardSurfaceStyles[color][kind],
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
            <div className="min-w-0">
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
            kind={resolvedButtonKind}
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
