/** Bảng màu chủ đạo có thể chọn. "white" dùng cho nút đặt trên nền tối/gradient. */
export type AccentColor =
  | "rose"
  | "red"
  | "amber"
  | "emerald"
  | "teal"
  | "blue"
  | "indigo"
  | "violet"
  | "sky"
  | "slate"
  | "white";

export type ComponentKind =
  | "solid"               // - solid: trơn
  | "elevated"            //‌‌ - elevated: đổ bóng
  | "soft"                // - soft: nền nhạt
  | "outline"             // - outline: viền
  | "ghost"               // - ghost: không nền, nhưng CÓ nền nhạt khi hover
  | "text";               // - text: chỉ có chữ, không có nền kể cả khi hover (chỉ đổi màu chữ)

/** Độ bo góc: vuông, hơi bo, vừa, bo nhiều, tròn hoàn toàn (pill/circle). */
export type ComponentRadius = "none" | "sm" | "md" | "lg" | "full";

/** Cỡ chữ / icon / khoảng cách gap giữa icon và text — KHÔNG quyết định padding. */
export type ComponentSize = "sm" | "md" | "lg" | "xl";

/** Độ "rộng rãi" của padding (px & py dùng chung 1 thang đo) — độc lập với size. */
export type ComponentSpacing = "none" | "xxs" | "xs" | "sm" | "md" | "lg" | "xl";

  // ─── Topic Accent Cycle ─────────────────────────────────────────────
/**
 * Ordered cycle of accent colors for topic assignment
 * Topics are assigned colors in a deterministic, repeating pattern
 */
export const accentCycle: AccentColor[] = [
  "rose",
  "red",
  "amber",
  "emerald",
  "teal",
  "blue",
  "indigo",
  "violet",
  "sky",
  "slate",
  "white"
];

// ─── Accent Style Configuration ─────────────────────────────────────
/**
 * Style configuration for each accent color theme
 * Contains all CSS classes needed for consistent theming
 */
export interface AccentStyles {
  border: string;
  bg: string;
  ring: string;
  headerBg: string;
  headerDivider: string;
  cardHoverBorder: string;
  badgeBg: string;
  badgeText: string;
  dot: string;
  text: string;
  icon: string;
  chipBg: string;
  chipText: string;
  chipHover: string;
  exampleBar: string;
  exampleBg: string;
}

/**
 * Complete accent color palette with all style configurations
 * Maps each accent color to its corresponding CSS classes
 */
export const accentMap: Record<AccentColor, AccentStyles> = {
  amber: {
    border: "border-amber-300",
    bg: "bg-amber-50/40",
    ring: "ring-amber-100",
    headerBg: "bg-gradient-to-r from-amber-50/50 to-transparent",
    headerDivider: "border-amber-100",
    cardHoverBorder: "hover:border-amber-400",
    badgeBg: "bg-amber-500",
    badgeText: "text-white",
    dot: "bg-amber-500",
    text: "text-amber-700",
    icon: "text-amber-600",
    chipBg: "bg-amber-100",
    chipText: "text-amber-700",
    chipHover: "hover:bg-amber-200",
    exampleBar: "bg-amber-300",
    exampleBg: "bg-amber-50/40",
  },
  indigo: {
    border: "border-indigo-300",
    bg: "bg-indigo-50/40",
    ring: "ring-indigo-100",
    headerBg: "bg-gradient-to-r from-indigo-50/50 to-transparent",
    headerDivider: "border-indigo-100",
    cardHoverBorder: "hover:border-indigo-400",
    badgeBg: "bg-indigo-500",
    badgeText: "text-white",
    dot: "bg-indigo-500",
    text: "text-indigo-700",
    icon: "text-indigo-600",
    chipBg: "bg-indigo-100",
    chipText: "text-indigo-700",
    chipHover: "hover:bg-indigo-200",
    exampleBar: "bg-indigo-300",
    exampleBg: "bg-indigo-50/40",
  },
  rose: {
    border: "border-rose-300",
    bg: "bg-rose-50/40",
    ring: "ring-rose-100",
    headerBg: "bg-gradient-to-r from-rose-50/50 to-transparent",
    headerDivider: "border-rose-100",
    cardHoverBorder: "hover:border-rose-400",
    badgeBg: "bg-rose-500",
    badgeText: "text-white",
    dot: "bg-rose-500",
    text: "text-rose-700",
    icon: "text-rose-600",
    chipBg: "bg-rose-100",
    chipText: "text-rose-700",
    chipHover: "hover:bg-rose-200",
    exampleBar: "bg-rose-300",
    exampleBg: "bg-rose-50/40",
  },
  teal: {
    border: "border-teal-300",
    bg: "bg-teal-50/40",
    ring: "ring-teal-100",
    headerBg: "bg-gradient-to-r from-teal-50/50 to-transparent",
    headerDivider: "border-teal-100",
    cardHoverBorder: "hover:border-teal-400",
    badgeBg: "bg-teal-500",
    badgeText: "text-white",
    dot: "bg-teal-500",
    text: "text-teal-700",
    icon: "text-teal-600",
    chipBg: "bg-teal-100",
    chipText: "text-teal-700",
    chipHover: "hover:bg-teal-200",
    exampleBar: "bg-teal-300",
    exampleBg: "bg-teal-50/40",
  },
  emerald: {
    border: "border-emerald-300",
    bg: "bg-emerald-50/40",
    ring: "ring-emerald-100",
    headerBg: "bg-gradient-to-r from-emerald-50/50 to-transparent",
    headerDivider: "border-emerald-100",
    cardHoverBorder: "hover:border-emerald-400",
    badgeBg: "bg-emerald-500",
    badgeText: "text-white",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    icon: "text-emerald-600",
    chipBg: "bg-emerald-100",
    chipText: "text-emerald-700",
    chipHover: "hover:bg-emerald-200",
    exampleBar: "bg-emerald-300",
    exampleBg: "bg-emerald-50/40",
  },
  violet: {
    border: "border-violet-300",
    bg: "bg-violet-50/40",
    ring: "ring-violet-100",
    headerBg: "bg-gradient-to-r from-violet-50/50 to-transparent",
    headerDivider: "border-violet-100",
    cardHoverBorder: "hover:border-violet-400",
    badgeBg: "bg-violet-500",
    badgeText: "text-white",
    dot: "bg-violet-500",
    text: "text-violet-700",
    icon: "text-violet-600",
    chipBg: "bg-violet-100",
    chipText: "text-violet-700",
    chipHover: "hover:bg-violet-200",
    exampleBar: "bg-violet-300",
    exampleBg: "bg-violet-50/40",
  },
  slate: {
    border: "border-slate-300",
    bg: "bg-slate-50/40",
    ring: "ring-slate-100",
    headerBg: "bg-gradient-to-r from-slate-50/50 to-transparent",
    headerDivider: "border-slate-100",
    cardHoverBorder: "hover:border-slate-400",
    badgeBg: "bg-slate-500",
    badgeText: "text-white",
    dot: "bg-slate-500",
    text: "text-slate-700",
    icon: "text-slate-600",
    chipBg: "bg-slate-100",
    chipText: "text-slate-700",
    chipHover: "hover:bg-slate-200",
    exampleBar: "bg-slate-300",
    exampleBg: "bg-slate-50/40",
  },
  red: {
    border: "border-red-300",
    bg: "bg-red-50/40",
    ring: "ring-red-100",
    headerBg: "bg-gradient-to-r from-red-50/50 to-transparent",
    headerDivider: "border-red-100",
    cardHoverBorder: "hover:border-red-400",
    badgeBg: "bg-red-500",
    badgeText: "text-white",
    dot: "bg-red-500",
    text: "text-red-700",
    icon: "text-red-600",
    chipBg: "bg-red-100",
    chipText: "text-red-700",
    chipHover: "hover:bg-red-200",
    exampleBar: "bg-red-300",
    exampleBg: "bg-red-50/40",
  },
  blue: {
    border: "border-blue-300",
    bg: "bg-blue-50/40",
    ring: "ring-blue-100",
    headerBg: "bg-gradient-to-r from-blue-50/50 to-transparent",
    headerDivider: "border-blue-100",
    cardHoverBorder: "hover:border-blue-400",
    badgeBg: "bg-blue-500",
    badgeText: "text-white",
    dot: "bg-blue-500",
    text: "text-blue-700",
    icon: "text-blue-600",
    chipBg: "bg-blue-100",
    chipText: "text-blue-700",
    chipHover: "hover:bg-blue-200",
    exampleBar: "bg-blue-300",
    exampleBg: "bg-blue-50/40",
  },
  sky: {
    border: "border-sky-300",
    bg: "bg-sky-50/40",
    ring: "ring-sky-100",
    headerBg: "bg-gradient-to-r from-sky-50/50 to-transparent",
    headerDivider: "border-sky-100",
    cardHoverBorder: "hover:border-sky-400",
    badgeBg: "bg-sky-500",
    badgeText: "text-white",
    dot: "bg-sky-500",
    text: "text-sky-700",
    icon: "text-sky-600",
    chipBg: "bg-sky-100",
    chipText: "text-sky-700",
    chipHover: "hover:bg-sky-200",
    exampleBar: "bg-sky-300",
    exampleBg: "bg-sky-50/40",
  },
  white: {
    border: "border-white-300",
    bg: "bg-white-50/40",
    ring: "ring-white-100",
    headerBg: "bg-gradient-to-r from-white-50/50 to-transparent",
    headerDivider: "border-white-100",
    cardHoverBorder: "hover:border-white-400",
    badgeBg: "bg-white-500",
    badgeText: "text-white",
    dot: "bg-white-500",
    text: "text-white-700",
    icon: "text-white-600",
    chipBg: "bg-white-100",
    chipText: "text-white-700",
    chipHover: "hover:bg-white-200",
    exampleBar: "bg-white-300",
    exampleBg: "bg-white-50/40",
  },
};

/* ------------------------------------------------------------------ */
/*  Color x Kind matrix — mỗi màu cần liệt kê class đầy đủ, tĩnh,       */
/*  để Tailwind JIT quét được (không dùng chuỗi động kiểu `bg-${c}`).  */
/* ------------------------------------------------------------------ */

export const colorStyles: Record<AccentColor, Record<ComponentKind, string>> = {
  rose: {
    solid:
      "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500",
    elevated:
      "bg-rose-600 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-700 hover:shadow-xl hover:shadow-rose-500/40 hover:-translate-y-0.5 focus-visible:ring-rose-500",
    soft: "bg-rose-100 text-rose-700 hover:bg-rose-200 focus-visible:ring-rose-500",
    outline:
      "border border-rose-300 text-rose-700 hover:shadow-md hover:-translate-y-0.5 hover:border-rose-300 focus-visible:ring-rose-500",
    ghost: "text-rose-700 hover:bg-rose-50 focus-visible:ring-rose-500",
    text: "text-rose-700 hover:text-rose-800 focus-visible:ring-rose-500",
  },
  red: {
    solid: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
    elevated:
      "bg-red-600 text-white shadow-lg shadow-red-500/30 hover:bg-red-700 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 focus-visible:ring-red-500",
    soft: "bg-red-100 text-red-700 hover:bg-red-200 focus-visible:ring-red-500",
    outline:
      "border border-red-300 text-red-700 hover:shadow-md hover:-translate-y-0.5 hover:border-red-300 focus-visible:ring-red-500",
    ghost: "text-red-700 hover:bg-red-50 focus-visible:ring-red-500",
    text: "text-red-700 hover:text-red-800 focus-visible:ring-red-500",
  },
  amber: {
    solid:
      "bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500",
    elevated:
      "bg-amber-500 text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 focus-visible:ring-amber-500",
    soft: "bg-amber-100 text-amber-700 hover:bg-amber-200 focus-visible:ring-amber-500",
    outline:
      "border border-amber-300 text-amber-700 hover:shadow-md hover:-translate-y-0.5 hover:border-amber-300 focus-visible:ring-amber-500",
    ghost: "text-amber-700 hover:bg-amber-50 focus-visible:ring-amber-500",
    text: "text-amber-700 hover:text-amber-800 focus-visible:ring-amber-500",
  },
  emerald: {
    solid:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
    elevated:
      "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 focus-visible:ring-emerald-500",
    soft: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 focus-visible:ring-emerald-500",
    outline:
      "border border-emerald-300 text-emerald-700 hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-300 focus-visible:ring-emerald-500",
    ghost:
      "text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500",
    text: "text-emerald-700 hover:text-emerald-800 focus-visible:ring-emerald-500",
  },
  teal: {
    solid:
      "bg-teal-600 text-white hover:bg-teal-700 focus-visible:ring-teal-500",
    elevated:
      "bg-teal-600 text-white shadow-lg shadow-teal-500/30 hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 focus-visible:ring-teal-500",
    soft: "bg-teal-100 text-teal-700 hover:bg-teal-200 focus-visible:ring-teal-500",
    outline:
      "border border-teal-300 text-teal-700 hover:shadow-md hover:-translate-y-0.5 hover:border-teal-300 focus-visible:ring-teal-500",
    ghost: "text-teal-700 hover:bg-teal-50 focus-visible:ring-teal-500",
    text: "text-teal-700 hover:text-teal-800 focus-visible:ring-teal-500",
  },
  blue: {
    solid:
      "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
    elevated:
      "bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 focus-visible:ring-blue-500",
    soft: "bg-blue-100 text-blue-700 hover:bg-blue-200 focus-visible:ring-blue-500",
    outline:
      "border border-blue-300 text-blue-700 hover:shadow-md hover:-translate-y-0.5 hover:border-blue-300 focus-visible:ring-blue-500",
    ghost: "text-blue-700 hover:bg-blue-50 focus-visible:ring-blue-500",
    text: "text-blue-700 hover:text-blue-800 focus-visible:ring-blue-500",
  },
  indigo: {
    solid:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500",
    elevated:
      "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 focus-visible:ring-indigo-500",
    soft: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 focus-visible:ring-indigo-500",
    outline:
      "border border-indigo-300 text-indigo-700 hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-300 focus-visible:ring-indigo-500",
    ghost: "text-indigo-700 hover:bg-indigo-50 focus-visible:ring-indigo-500",
    text: "text-indigo-700 hover:text-indigo-800 focus-visible:ring-indigo-500",
  },
  violet: {
    solid:
      "bg-violet-600 text-white hover:bg-violet-700 focus-visible:ring-violet-500",
    elevated:
      "bg-violet-600 text-white shadow-lg shadow-violet-500/30 hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-500/40 hover:-translate-y-0.5 focus-visible:ring-violet-500",
    soft: "bg-violet-100 text-violet-700 hover:bg-violet-200 focus-visible:ring-violet-500",
    outline:
      "border border-violet-300 text-violet-700 hover:shadow-md hover:-translate-y-0.5 hover:border-violet-300 focus-visible:ring-violet-500",
    ghost: "text-violet-700 hover:bg-violet-50 focus-visible:ring-violet-500",
    text: "text-violet-700 hover:text-violet-800 focus-visible:ring-violet-500",
  },
  sky: {
    solid:
      "bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-500",
    elevated:
      "bg-sky-600 text-white shadow-lg shadow-sky-500/30 hover:bg-sky-700 hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-0.5 focus-visible:ring-sky-500",
    soft: "bg-sky-100 text-sky-700 hover:bg-sky-200 focus-visible:ring-sky-500",
    outline:
      "border border-sky-300 text-sky-700 hover:shadow-md hover:-translate-y-0.5 hover:border-sky-300 focus-visible:ring-sky-500",
    ghost: "text-sky-700 hover:bg-sky-50 focus-visible:ring-sky-500",
    text: "text-sky-700 hover:text-sky-800 focus-visible:ring-sky-500",
  },
  slate: {
    solid:
      "bg-slate-800 text-white hover:bg-slate-900 focus-visible:ring-slate-500",
    elevated:
      "bg-white text-slate-800 shadow-sm border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 focus-visible:ring-slate-400",
    soft: "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400",
    outline:
      "border border-slate-200 text-slate-800 hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 focus-visible:ring-slate-400",
    ghost: "text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400",
    text: "text-slate-700 hover:text-slate-900 focus-visible:ring-slate-400",
  },
  white: {
    solid: "bg-white text-slate-800 hover:bg-slate-50 focus-visible:ring-white",
    elevated:
      "bg-white text-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus-visible:ring-white",
    soft: "bg-white/15 text-white hover:bg-white/25 focus-visible:ring-white",
    outline:
      "border border-white/40 text-white hover:shadow-md hover:-translate-y-0.5 hover:border-white-300 focus-visible:ring-white",
    ghost: "text-white hover:bg-white/10 focus-visible:ring-white",
    text: "text-white hover:text-white/80 focus-visible:ring-white",
  },
};

/**
 * Style áp dụng khi nút ở trạng thái "selected" (đang được chọn/active),
 * ví dụ trong nhóm toggle, tab dạng nút, hay filter chip.
 * Áp dụng cho MỌI `kind`, đè lên nền/màu chữ/viền mặc định — kể cả với
 * "ghost" và "text" (vốn không có nền), để trạng thái chọn luôn rõ ràng.
 */
export const selectedStyles: Record<AccentColor, string> = {
  rose: "bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-100 hover:text-rose-800",
  red: "bg-red-100 text-red-800 border-red-300 hover:bg-red-100 hover:text-red-800",
  amber:
    "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100 hover:text-amber-800",
  emerald:
    "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800",
  teal: "bg-teal-100 text-teal-800 border-teal-300 hover:bg-teal-100 hover:text-teal-800",
  blue: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100 hover:text-blue-800",
  indigo:
    "bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-100 hover:text-indigo-800",
  violet:
    "bg-violet-100 text-violet-800 border-violet-300 hover:bg-violet-100 hover:text-violet-800",
      sky:
    "bg-sky-100 text-sky-800 border-sky-300 hover:bg-sky-100 hover:text-sky-800",
  slate:
    "bg-slate-200 text-slate-900 border-slate-300 hover:bg-slate-200 hover:text-slate-900",
  white: "bg-white/25 text-white border-white/60 hover:bg-white/25 hover:text-white",
};

export const radiusStyles: Record<ComponentRadius, string> = {
  none: "rounded-none",
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  full: "rounded-full",
};

/** Chỉ còn text size + gap. Padding đã tách sang `spacing`. */
export const textStyles: Record<ComponentSize, string> = {
  sm: "text-xs gap-2",
  md: "text-sm gap-3",
  lg: "text-base gap-4",
  xl: "text-lg gap-5",
};

export const iconDimensionStyles: Record<ComponentSize, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  xl: "h-6 w-6",
};

/** Padding cho nút có text (px & py dùng chung 1 thang, từ ít → nhiều). */
export const paddingStyles: Record<ComponentSpacing, string> = {
  none: "p-0",
  xxs: "px-2.5 py-1",
  xs: "px-4 py-1",
  sm: "px-5 py-2",
  md: "px-8 py-3",
  lg: "px-10 py-4",
  xl: "px-12 py-5",
};

/** Padding vuông cho icon-only, cùng thang đo `spacing` để nhất quán với nút chữ. */
export const iconOnlyPaddingStyles: Record<ComponentSpacing, string> = {
  none: "p-0",
  xxs: "p-0.5",
  xs: "p-1",
  sm: "p-1.5",
  md: "p-2.5",
  lg: "p-3.5",
  xl: "p-5",
};

export const widthLayout = "w-full max-w-7xl px-4 sm:px-6 lg:px-8 grow mx-auto"

/**
 * Deterministically pick an accent color from a topic identifier
 * Uses hash function for strings and modulo for numbers
 * @param topic - Topic identifier (string or number)
 * @returns AccentColor - The assigned accent color
 */
export function accentFromTopic(topic: string | number): AccentColor {
  if (typeof topic === "number") {
    return accentCycle[Math.abs(topic) % accentCycle.length];
  }
  let hash = 0;
  for (let i = 0; i < topic.length; i++) {
    hash = (hash * 31 + topic.charCodeAt(i)) >>> 0;
  }
  return accentCycle[hash % accentCycle.length];
}

export function stripHoverClasses(className: string) {
  return className
    .split(" ")
    .filter((cls) => !cls.startsWith("hover:"))
    .join(" ");
}