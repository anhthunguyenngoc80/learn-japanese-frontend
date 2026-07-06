import { forwardRef, type ReactNode, type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ComponentType } from "react";
import { type LucideIcon, Loader2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/* ------------------------------------------------------------------ */

/** Bảng màu chủ đạo có thể chọn. "white" dùng cho nút đặt trên nền tối/gradient. */
export type ButtonColor =
  | "rose"
  | "red"
  | "amber"
  | "emerald"
  | "teal"
  | "blue"
  | "indigo"
  | "violet"
  | "slate"
  | "white";

/** Kiểu hiển thị: trơn (solid), đổ bóng (elevated), nền nhạt (soft), viền (outline), không nền (ghost). */
export type ButtonKind = "solid" | "elevated" | "soft" | "outline" | "ghost";

/** Độ bo góc: vuông, hơi bo, vừa, bo nhiều, tròn hoàn toàn (pill/circle). */
export type ButtonRadius = "none" | "sm" | "md" | "lg" | "full";

export type ButtonSize = "sm" | "md" | "lg" | "xl";

/* ------------------------------------------------------------------ */
/*  Color x Kind matrix — mỗi màu cần liệt kê class đầy đủ, tĩnh,       */
/*  để Tailwind JIT quét được (không dùng chuỗi động kiểu `bg-${c}`).  */
/* ------------------------------------------------------------------ */

const colorStyles: Record<ButtonColor, Record<ButtonKind, string>> = {
  rose: {
    solid: "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500",
    elevated:
      "bg-rose-600 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-700 hover:shadow-xl hover:shadow-rose-500/40 hover:-translate-y-0.5 focus-visible:ring-rose-500",
    soft: "bg-rose-100 text-rose-700 hover:bg-rose-200 focus-visible:ring-rose-500",
    outline: "border border-rose-300 text-rose-700 hover:bg-rose-50 focus-visible:ring-rose-500",
    ghost: "text-rose-700 hover:bg-rose-50 focus-visible:ring-rose-500",
  },
  red: {
    solid: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
    elevated:
      "bg-red-600 text-white shadow-lg shadow-red-500/30 hover:bg-red-700 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 focus-visible:ring-red-500",
    soft: "bg-red-100 text-red-700 hover:bg-red-200 focus-visible:ring-red-500",
    outline: "border border-red-300 text-red-700 hover:bg-red-50 focus-visible:ring-red-500",
    ghost: "text-red-700 hover:bg-red-50 focus-visible:ring-red-500",
  },
  amber: {
    solid: "bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500",
    elevated:
      "bg-amber-500 text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 focus-visible:ring-amber-500",
    soft: "bg-amber-100 text-amber-700 hover:bg-amber-200 focus-visible:ring-amber-500",
    outline: "border border-amber-300 text-amber-700 hover:bg-amber-50 focus-visible:ring-amber-500",
    ghost: "text-amber-700 hover:bg-amber-50 focus-visible:ring-amber-500",
  },
  emerald: {
    solid: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
    elevated:
      "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 focus-visible:ring-emerald-500",
    soft: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 focus-visible:ring-emerald-500",
    outline: "border border-emerald-300 text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500",
    ghost: "text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500",
  },
  teal: {
    solid: "bg-teal-600 text-white hover:bg-teal-700 focus-visible:ring-teal-500",
    elevated:
      "bg-teal-600 text-white shadow-lg shadow-teal-500/30 hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 focus-visible:ring-teal-500",
    soft: "bg-teal-100 text-teal-700 hover:bg-teal-200 focus-visible:ring-teal-500",
    outline: "border border-teal-300 text-teal-700 hover:bg-teal-50 focus-visible:ring-teal-500",
    ghost: "text-teal-700 hover:bg-teal-50 focus-visible:ring-teal-500",
  },
  blue: {
    solid: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
    elevated:
      "bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 focus-visible:ring-blue-500",
    soft: "bg-blue-100 text-blue-700 hover:bg-blue-200 focus-visible:ring-blue-500",
    outline: "border border-blue-300 text-blue-700 hover:bg-blue-50 focus-visible:ring-blue-500",
    ghost: "text-blue-700 hover:bg-blue-50 focus-visible:ring-blue-500",
  },
  indigo: {
    solid: "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500",
    elevated:
      "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 focus-visible:ring-indigo-500",
    soft: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 focus-visible:ring-indigo-500",
    outline: "border border-indigo-300 text-indigo-700 hover:bg-indigo-50 focus-visible:ring-indigo-500",
    ghost: "text-indigo-700 hover:bg-indigo-50 focus-visible:ring-indigo-500",
  },
  violet: {
    solid: "bg-violet-600 text-white hover:bg-violet-700 focus-visible:ring-violet-500",
    elevated:
      "bg-violet-600 text-white shadow-lg shadow-violet-500/30 hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-500/40 hover:-translate-y-0.5 focus-visible:ring-violet-500",
    soft: "bg-violet-100 text-violet-700 hover:bg-violet-200 focus-visible:ring-violet-500",
    outline: "border border-violet-300 text-violet-700 hover:bg-violet-50 focus-visible:ring-violet-500",
    ghost: "text-violet-700 hover:bg-violet-50 focus-visible:ring-violet-500",
  },
  slate: {
    solid: "bg-slate-800 text-white hover:bg-slate-900 focus-visible:ring-slate-500",
    elevated:
      "bg-white text-slate-800 shadow-sm border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 focus-visible:ring-slate-400",
    soft: "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400",
    outline: "border border-slate-200 text-slate-800 hover:bg-slate-50 focus-visible:ring-slate-400",
    ghost: "text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400",
  },
  white: {
    solid: "bg-white text-slate-800 hover:bg-slate-50 focus-visible:ring-white",
    elevated:
      "bg-white text-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus-visible:ring-white",
    soft: "bg-white/15 text-white hover:bg-white/25 focus-visible:ring-white",
    outline: "border border-white/40 text-white hover:bg-white/10 focus-visible:ring-white",
    ghost: "text-white hover:bg-white/10 focus-visible:ring-white",
  },
};

const radiusStyles: Record<ButtonRadius, string> = {
  none: "rounded-none",
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  full: "rounded-full",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-7 py-3.5 text-base gap-2.5",
  xl: "px-9 py-4 text-lg gap-3",
};

// Padding vuông dành riêng cho icon-only, để icon luôn nằm giữa hình vuông/tròn.
const iconOnlySizeStyles: Record<ButtonSize, string> = {
  sm: "p-1.5",
  md: "p-2.5",
  lg: "p-3.5",
  xl: "p-4",
};

const iconDimensionStyles: Record<ButtonSize, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  xl: "h-6 w-6",
};

/* ------------------------------------------------------------------ */
/*  Shared class builder                                               */
/* ------------------------------------------------------------------ */

interface BuildClassNameArgs {
  color: ButtonColor;
  kind: ButtonKind;
  radius: ButtonRadius;
  size: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  iconOnly?: boolean;
  className?: string;
}

function buildButtonClassName({
  color,
  kind,
  radius,
  size,
  fullWidth,
  disabled,
  iconOnly,
  className = "",
}: BuildClassNameArgs) {
  return [
    "inline-flex items-center justify-center font-semibold transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    colorStyles[color][kind],
    radiusStyles[radius],
    iconOnly ? iconOnlySizeStyles[size] : sizeStyles[size],
    fullWidth ? "w-full" : "",
    disabled ? "pointer-events-none opacity-50" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

/* ------------------------------------------------------------------ */
/*  Button — text-only, icon+text, hoặc render như <a> nếu có href     */
/* ------------------------------------------------------------------ */

interface CommonButtonProps {
  children?: ReactNode;
  color?: ButtonColor;
  kind?: ButtonKind;
  radius?: ButtonRadius;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
  href?: string;
  disabled?: boolean;
}

type ButtonAsButtonProps = CommonButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & { href?: undefined };

type ButtonAsAnchorProps = CommonButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color" | "href"> & { href: string };

export type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      children,
      color = "rose",
      kind = "solid",
      radius = "md",
      size = "md",
      icon: Icon,
      iconPosition = "left",
      fullWidth = false,
      loading = false,
      disabled,
      className = "",
      href,
      ...rest
    },
    ref
  ) => {
    const combinedClassName = buildButtonClassName({
      color,
      kind,
      radius,
      size,
      fullWidth,
      disabled: disabled || loading,
      className,
    });

    const content = (
      <>
        {loading ? (
          <Loader2 className={`${iconDimensionStyles[size]} animate-spin`} />
        ) : (
          Icon && iconPosition === "left" && <Icon className={iconDimensionStyles[size]} />
        )}
        {children}
        {!loading && Icon && iconPosition === "right" && (
          <Icon className={iconDimensionStyles[size]} />
        )}
      </>
    );

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={combinedClassName}
          aria-disabled={disabled || loading}
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={combinedClassName}
        disabled={disabled || loading}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
);
Button.displayName = "Button";

/* ------------------------------------------------------------------ */
/*  IconButton — chỉ chứa icon, bắt buộc có aria-label để hỗ trợ tiếp cận */
/* ------------------------------------------------------------------ */
interface IconProps {
  size?: number | string;
  className?: string;
}

interface CommonIconButtonProps {
  icon: ComponentType<IconProps>;
  "aria-label": string;
  color?: ButtonColor;
  kind?: ButtonKind;
  radius?: ButtonRadius;
  size?: ButtonSize;
  className?: string;
  href?: string;
  disabled?: boolean;
}

type IconButtonAsButtonProps = CommonIconButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & { href?: undefined };

type IconButtonAsAnchorProps = CommonIconButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color" | "href"> & { href: string };

export type IconButtonProps = IconButtonAsButtonProps | IconButtonAsAnchorProps;

export const IconButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, IconButtonProps>(
  (
    {
      icon: Icon,
      color = "slate",
      kind = "ghost",
      radius = "md",
      size = "md",
      disabled,
      className = "",
      href,
      ...rest
    },
    ref
  ) => {
    const combinedClassName = buildButtonClassName({
      color,
      kind,
      radius,
      size,
      disabled,
      iconOnly: true,
      className,
    });

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={combinedClassName}
          aria-disabled={disabled}
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          <Icon className={iconDimensionStyles[size]} />
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={combinedClassName}
        disabled={disabled}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        <Icon className={iconDimensionStyles[size]} />
      </button>
    );
  }
);
IconButton.displayName = "IconButton";