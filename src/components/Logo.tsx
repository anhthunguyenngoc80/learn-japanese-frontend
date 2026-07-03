import { Languages } from "lucide-react";
import { Link } from "react-router-dom";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showHoverEffect?: boolean;
  asLink?: boolean;
  href?: string;
  variant?: "light" | "dark";
}

export function Logo({ 
  size = "md", 
  showHoverEffect = false, 
  asLink = true,
  href = "/",
  variant = "light"
}: LogoProps) {
  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-10 w-10"
  };

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  const textSizeClasses = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl"
  };

  const isDark = variant === "dark";

  const logoContent = (
    <>
      <span 
        className={`
          flex items-center justify-center rounded-xl 
          bg-gradient-to-br from-rose-500 to-rose-700 
          text-white shadow-sm shadow-rose-500/30
          ${sizeClasses[size]}
          ${showHoverEffect ? 'transition-transform group-hover:scale-105' : ''}
        `}
      >
        <Languages className={iconSizeClasses[size]} />
      </span>
      <span className={`${textSizeClasses[size]} font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
        Nihongo<span className={isDark ? 'text-rose-300' : 'text-rose-600'}>Go</span>
      </span>
    </>
  );

  if (asLink) {
    return (
      <Link to={href} className={`flex items-center gap-2 group ${showHoverEffect ? '' : ''}`}>
        {logoContent}
      </Link>
    );
  }

  return <div className="flex items-center gap-2">{logoContent}</div>;
}