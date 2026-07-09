import {
  forwardRef,
  type ReactNode,
  type ButtonHTMLAttributes,
  type AnchorHTMLAttributes,
  type ComponentType,
} from "react";
import { type LucideIcon, Loader2 } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { colorStyles, iconDimensionStyles, iconOnlyPaddingStyles, paddingStyles, radiusStyles, selectedStyles, textStyles, type AccentColor, type ComponentKind, type ComponentRadius, type ComponentSize, type ComponentSpacing } from "../constant";

/* ------------------------------------------------------------------ */
/*  Shared class builder                                               */
/* ------------------------------------------------------------------ */

interface BuildClassNameArgs {
  color: AccentColor;
  kind: ComponentKind;
  radius: ComponentRadius;
  size: ComponentSize;
  spacing: ComponentSpacing;
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
  fullWidth,
  disabled,
  iconOnly,
  selected,
  className = "",
}: BuildClassNameArgs) {
  return twMerge(
    "inline-flex items-center justify-center font-semibold transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    colorStyles[color][kind],
    // "text" và "ghost" vốn không có viền — thêm viền trong suốt để khi
    // selected chuyển sang viền màu thì layout không bị nhảy (giữ nguyên kích thước).
    (kind === "text" || kind === "ghost") && "border border-transparent",
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