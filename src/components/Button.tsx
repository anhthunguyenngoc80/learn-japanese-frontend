import {
  forwardRef,
  type ReactNode,
  type ButtonHTMLAttributes,
  type AnchorHTMLAttributes,
  type ComponentType,
} from "react";
import { type LucideIcon, Loader2 } from "lucide-react";
import { twMerge } from "tailwind-merge";
import {
  colorStyles,
  iconDimensionStyles,
  iconOnlyPaddingStyles,
  paddingStyles,
  radiusStyles,
  selectedStyles,
  textStyles,
  borderWidthStyles,
  type AccentColor,
  type ComponentKind,
  type ComponentRadius,
  type ComponentSize,
  type ComponentSpacing,
  type ComponentBorderWidth,
} from "../constant";

/* ------------------------------------------------------------------ */
/*  Shared class builder                                               */
/* ------------------------------------------------------------------ */

interface BuildClassNameArgs {
  color: AccentColor;
  kind: ComponentKind;
  radius: ComponentRadius;
  size: ComponentSize;
  spacing: ComponentSpacing;
  /** Độ dày viền — chỉ có tác dụng với kind "outline"/"text"/"ghost". Mặc định "md". */
  borderWidth?: ComponentBorderWidth;
  fullWidth?: boolean;
  disabled?: boolean;
  iconOnly?: boolean;
  selected?: boolean;
  className?: string;
}

function buildButtonClassName({
  color,
  kind,
  radius,
  size,
  spacing,
  borderWidth = "md",
  fullWidth,
  disabled,
  iconOnly,
  selected,
  className = "",
}: BuildClassNameArgs) {
  const borderClass =
    kind === "outline"
      ? borderWidthStyles[borderWidth]
      : kind === "text" || kind === "ghost"
        ? twMerge(borderWidthStyles[borderWidth], "border-transparent")
        : "";

  return twMerge(
    "inline-flex items-center justify-center font-semibold transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    colorStyles[color][kind],
    borderClass,
    radiusStyles[radius],
    iconOnly ? iconOnlyPaddingStyles[spacing] : paddingStyles[spacing],
    !iconOnly && textStyles[size],
    fullWidth ? "w-full" : "",
    // selectedStyles được đặt SAU colorStyles để twMerge ưu tiên đè lên
    // các class nền/màu chữ/viền mặc định của kind, áp dụng cho mọi kind.
    selected ? selectedStyles[color] : "",
    disabled ? "pointer-events-none opacity-50" : "",
    className,
  );
}

/* ------------------------------------------------------------------ */
/*  Button — text-only, icon+text, hoặc render như <a> nếu có href     */
/* ------------------------------------------------------------------ */

interface CommonButtonProps {
  children?: ReactNode;
  color?: AccentColor;
  kind?: ComponentKind;
  radius?: ComponentRadius;
  size?: ComponentSize;
  spacing?: ComponentSpacing;
  /** Độ dày viền cho kind "outline"/"text"/"ghost". Mặc định "md" (border-3). */
  borderWidth?: ComponentBorderWidth;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  loading?: boolean;
  /** Đánh dấu nút đang ở trạng thái được chọn (vd: toggle, tab, filter chip). */
  selected?: boolean;
  className?: string;
  href?: string;
  disabled?: boolean;
}

type ButtonAsButtonProps = CommonButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & { href?: undefined };

type ButtonAsAnchorProps = CommonButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color" | "href"> & {
    href: string;
  };

export type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps;

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      children,
      color = "rose",
      kind = "solid",
      radius = "md",
      size = "md",
      spacing = "md",
      borderWidth,
      icon: Icon,
      iconPosition = "left",
      fullWidth = false,
      loading = false,
      selected,
      disabled,
      className = "",
      href,
      ...rest
    },
    ref,
  ) => {
    const combinedClassName = buildButtonClassName({
      color,
      kind,
      radius,
      size,
      spacing,
      borderWidth,
      fullWidth,
      disabled: disabled || loading,
      selected,
      className,
    });

    const content = (
      <>
        {loading ? (
          <Loader2 className={`${iconDimensionStyles[size]} animate-spin`} />
        ) : (
          Icon &&
          iconPosition === "left" && (
            <Icon className={iconDimensionStyles[size]} />
          )
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
          aria-pressed={selected}
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
        aria-pressed={selected}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  },
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
  color?: AccentColor;
  kind?: ComponentKind;
  radius?: ComponentRadius;
  size?: ComponentSize;
  /** Độ rộng rãi của padding quanh icon, độc lập với size. Mặc định "md". */
  spacing?: ComponentSpacing;
  /** Độ dày viền cho kind "outline"/"text"/"ghost". Mặc định "md" (border-3). */
  borderWidth?: ComponentBorderWidth;
  /** Đánh dấu nút đang ở trạng thái được chọn (vd: toggle, tab, filter chip). */
  selected?: boolean;
  className?: string;
  href?: string;
  disabled?: boolean;
}

type IconButtonAsButtonProps = CommonIconButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & { href?: undefined };

type IconButtonAsAnchorProps = CommonIconButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color" | "href"> & {
    href: string;
  };

export type IconButtonProps = IconButtonAsButtonProps | IconButtonAsAnchorProps;

export const IconButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  IconButtonProps
>(
  (
    {
      icon: Icon,
      color = "slate",
      kind = "ghost",
      radius = "md",
      size = "md",
      spacing = "md",
      borderWidth,
      selected,
      disabled,
      className = "",
      href,
      ...rest
    },
    ref,
  ) => {
    const combinedClassName = buildButtonClassName({
      color,
      kind,
      radius,
      size,
      spacing,
      borderWidth,
      disabled,
      selected,
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
          aria-pressed={selected}
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
        aria-pressed={selected}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        <Icon className={iconDimensionStyles[size]} />
      </button>
    );
  },
);
IconButton.displayName = "IconButton";

const actionBadgeStyles: Record<string, { bg: string; icon: string }> = {
  rose: {
    bg: "bg-gradient-to-br from-rose-100 to-rose-200",
    icon: "text-rose-600",
  },
  orange: {
    bg: "bg-gradient-to-br from-orange-100 to-orange-200",
    icon: "text-orange-600",
  },
  amber: {
    bg: "bg-gradient-to-br from-amber-100 to-amber-200",
    icon: "text-amber-600",
  },
  yellow: {
    bg: "bg-gradient-to-br from-yellow-100 to-yellow-200",
    icon: "text-yellow-600",
  },
  lime: {
    bg: "bg-gradient-to-br from-lime-100 to-lime-200",
    icon: "text-lime-600",
  },
  green: {
    bg: "bg-gradient-to-br from-green-100 to-green-200",
    icon: "text-green-600",
  },
  emerald: {
    bg: "bg-gradient-to-br from-emerald-100 to-emerald-200",
    icon: "text-emerald-600",
  },
  teal: {
    bg: "bg-gradient-to-br from-teal-100 to-teal-200",
    icon: "text-teal-600",
  },
  cyan: {
    bg: "bg-gradient-to-br from-cyan-100 to-cyan-200",
    icon: "text-cyan-600",
  },
  sky: {
    bg: "bg-gradient-to-br from-sky-100 to-sky-200",
    icon: "text-sky-600",
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-100 to-blue-200",
    icon: "text-blue-600",
  },
  indigo: {
    bg: "bg-gradient-to-br from-indigo-100 to-indigo-200",
    icon: "text-indigo-600",
  },
  violet: {
    bg: "bg-gradient-to-br from-violet-100 to-violet-200",
    icon: "text-violet-600",
  },
  purple: {
    bg: "bg-gradient-to-br from-purple-100 to-purple-200",
    icon: "text-purple-600",
  },
  fuchsia: {
    bg: "bg-gradient-to-br from-fuchsia-100 to-fuchsia-200",
    icon: "text-fuchsia-600",
  },
  pink: {
    bg: "bg-gradient-to-br from-pink-100 to-pink-200",
    icon: "text-pink-600",
  },
  red: {
    bg: "bg-gradient-to-br from-red-100 to-red-200",
    icon: "text-red-600",
  },
  slate: {
    bg: "bg-gradient-to-br from-slate-100 to-slate-200",
    icon: "text-slate-600",
  },
  gray: {
    bg: "bg-gradient-to-br from-gray-100 to-gray-200",
    icon: "text-gray-600",
  },
};

/** Kích thước badge tròn + icon bên trong, ăn theo ComponentSize. */
const actionBadgeSizeStyles: Record<string, { badge: string; icon: string }> = {
  sm: { badge: "w-9 h-9", icon: "w-4 h-4" },
  md: { badge: "w-12 h-12", icon: "w-6 h-6" },
  lg: { badge: "w-14 h-14", icon: "w-7 h-7" },
};

/* ------------------------------------------------------------------ */
/*  ActionButton — nút dạng thẻ: icon tròn + tiêu đề + phụ đề          */
/* ------------------------------------------------------------------ */

interface CommonActionButtonProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  color?: AccentColor;
  radius?: ComponentRadius;
  size?: ComponentSize;
  borderWidth?: ComponentBorderWidth;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

type ActionButtonAsButtonProps = CommonActionButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color" | "title"> & {
    href?: undefined;
  };

type ActionButtonAsAnchorProps = CommonActionButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color" | "title" | "href"> & {
    href: string;
  };

export type ActionButtonProps =
  | ActionButtonAsButtonProps
  | ActionButtonAsAnchorProps;

export const ActionButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ActionButtonProps
>(
  (
    {
      icon: Icon,
      title,
      subtitle,
      color = "rose",
      radius = "md",
      size = "lg",
      borderWidth,
      fullWidth,
      loading,
      disabled,
      className = "",
      href,
      ...rest
    },
    ref,
  ) => {
    const badgeColor = actionBadgeStyles[color] ?? actionBadgeStyles.rose;
    const badgeSize = actionBadgeSizeStyles[size] ?? actionBadgeSizeStyles.md;

    const buttonProps = {
      kind: "outline" as const,
      color,
      radius,
      size,
      borderWidth,
      fullWidth,
      loading,
      disabled,
      href,
      className: twMerge(
        "group flex flex-col items-center gap-3 p-6 h-auto",
        className,
      ),
      ...rest,
    } as ButtonProps;

    return (
      <Button ref={ref} {...buttonProps}>
        <div
          className={twMerge(
            "rounded-full grid place-items-center transition-transform group-hover:scale-110",
            badgeSize.badge,
            badgeColor.bg,
          )}
        >
          <Icon className={twMerge(badgeSize.icon, badgeColor.icon)} />
        </div>
        <span className="font-semibold text-gray-800">{title}</span>
        {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
      </Button>
    );
  },
);
ActionButton.displayName = "ActionButton";
