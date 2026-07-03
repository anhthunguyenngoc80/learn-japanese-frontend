import { type ReactNode, type ComponentType } from "react";
import { type LucideIcon } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "rounded-xl bg-rose-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition-all hover:bg-rose-700 hover:shadow-xl hover:shadow-rose-500/40 hover:-translate-y-0.5",
  secondary:
    "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50",
  tertiary:
    "rounded-xl bg-white px-6 py-2 text-sm font-semibold text-rose-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl",
  ghost:
    "rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  fullWidth = false,
  className = "",
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const IconComponent = icon;

  const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold transition-all";
  const widthStyles = fullWidth ? "w-full" : "";
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";

  const combinedClassName = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    widthStyles,
    disabledStyles,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={combinedClassName}
      onClick={onClick}
      disabled={disabled}
    >
      {IconComponent && iconPosition === "left" && (
        <IconComponent className="h-4 w-4" />
      )}
      {children}
      {IconComponent && iconPosition === "right" && (
        <IconComponent className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      )}
    </button>
  );
}

// Specialized button for gradient backgrounds
interface GradientButtonProps {
  children: ReactNode;
  icon?: LucideIcon;
  className?: string;
  onClick?: () => void;
}

export function GradientButton({
  children,
  icon,
  className = "",
  onClick,
}: GradientButtonProps) {
  const IconComponent = icon;

  return (
    <button
      className={`mt-8 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-rose-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl ${className}`}
      onClick={onClick}
    >
      {IconComponent && <IconComponent className="h-4 w-4" />}
      {children}
    </button>
  );
}

// Social icon button
interface SocialIconButtonProps {
  icon: ComponentType<{ className?: string }>;
  href?: string;
  className?: string;
}

export function SocialIconButton({
  icon: Icon,
  href = "#",
  className = "",
}: SocialIconButtonProps) {
  return (
    <a
      href={href}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 ${className}`}
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}