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
  stripHoverClasses,
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
  /** Bật/tắt hiệu ứng hover. Mặc định true. */
  isHover?: boolean;
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
  isHover = true,
  className = "",
}: BuildClassNameArgs) {
  const borderClass =
    kind === "outline"
      ? borderWidthStyles[borderWidth]
      : kind === "text" || kind === "ghost"
        ? twMerge(borderWidthStyles[borderWidth], "border-transparent")
        : "";

  const colorClass = isHover
    ? colorStyles[color][kind]
    : stripHoverClasses(colorStyles[color][kind]);

  const selectedClass = selected
    ? isHover
      ? selectedStyles[color]
      : stripHoverClasses(selectedStyles[color])
    : "";

  return twMerge(
    "inline-flex items-center justify-center font-semibold transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    colorClass,
    borderClass,
    radiusStyles[radius],
    iconOnly ? iconOnlyPaddingStyles[spacing] : paddingStyles[spacing],
    !iconOnly && textStyles[size],
    fullWidth ? "w-full" : "",
    selectedClass,
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
  /** Bật/tắt hiệu ứng hover. Mặc định true. */
  isHover?: boolean;
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
      isHover = true,
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
      isHover,
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
  /** Bật/tắt hiệu ứng hover. Mặc định true. */
  isHover?: boolean;
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
      isHover = true,
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
      isHover,
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

/* ------------------------------------------------------------------ */
/*  ActionButton — Button mở rộng: icon tròn + tiêu đề + phụ đề       */
/* ------------------------------------------------------------------ */

interface CommonActionButtonProps {
  kind?: ComponentKind;
  icon?: ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  color?: AccentColor;
  radius?: ComponentRadius;
  size?: ComponentSize;
  borderWidth?: ComponentBorderWidth;
  fullWidth?: boolean;
  loading?: boolean;
  /** Bật/tắt hiệu ứng hover. Mặc định true. */
  isHover?: boolean;
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

// Cỡ chữ subtitle ăn theo ComponentSize, luôn nhỏ hơn 1 bậc so với title.
const subtitleTextStyles: Record<ComponentSize, string> = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-base",
  '2xl': "text-base",
  '4xl': "text-lg",
};

export const ActionButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ActionButtonProps
>(
  (
    {
      kind = "outline",
      icon: Icon,
      title,
      subtitle,
      color = "rose",
      radius = "md",
      size = "lg",
      borderWidth,
      fullWidth,
      loading,
      isHover = true,
      disabled,
      className = "",
      href,
      ...rest
    },
    ref,
  ) => {
    const badgeWrapperSize: Record<ComponentSize, string> = {
      sm: "w-9 h-9",
      md: "w-11 h-11",
      lg: "w-14 h-14",
      xl: "w-20 h-20",
      '2xl': "w-23 h-23",
      '4xl': "w-26 h-26",
    };

    const buttonProps = {
      kind,
      color,
      radius,
      size,
      borderWidth,
      fullWidth,
      loading,
      isHover,
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
        {Icon && (
          <div
            className={twMerge(
              "rounded-full grid place-items-center bg-current/10 transition-transform",
              isHover && "group-hover:scale-110",
              badgeWrapperSize[size],
            )}
          >
            <Icon className={twMerge(iconDimensionStyles[size], "text-current")} />
          </div>
        )}
        <span className="font-semibold text-current">{title}</span>
        {subtitle && (
          <span
            className={twMerge(
              subtitleTextStyles[size],
              "text-current opacity-60",
            )}
          >
            {subtitle}
          </span>
        )}
      </Button>
    );
  },
);
ActionButton.displayName = "ActionButton";