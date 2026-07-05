/**
 * Style Constants - Centralized styling configuration for the application
 * This file contains color themes, accent styles, and related utilities
 */

// ─── Accent Color Type ───────────────────────────────────────────────
/**
 * Available accent color themes for UI components
 * Each color provides a consistent visual theme across borders, backgrounds, and text
 */
export type AccentColor =
  | "amber"
  | "indigo"
  | "rose"
  | "sky"
  | "emerald"
  | "violet"
  | "slate";

// ─── Accent Style Configuration ─────────────────────────────────────
/**
 * Style configuration for each accent color theme
 * Contains all CSS classes needed for consistent theming
 */
export interface AccentStyles {
  border: string;
  ring: string;
  headerBg: string;
  headerDivider: string;
  cardHoverBorder: string;
  badgeBg: string;
  badgeText: string;
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
    ring: "ring-amber-100",
    headerBg: "bg-gradient-to-r from-amber-50/50 to-transparent",
    headerDivider: "border-amber-100",
    cardHoverBorder: "hover:border-amber-400",
    badgeBg: "bg-amber-500",
    badgeText: "text-white",
    icon: "text-amber-600",
    chipBg: "bg-amber-100",
    chipText: "text-amber-700",
    chipHover: "hover:bg-amber-200",
    exampleBar: "bg-amber-300",
    exampleBg: "bg-amber-50/40",
  },
  indigo: {
    border: "border-indigo-300",
    ring: "ring-indigo-100",
    headerBg: "bg-gradient-to-r from-indigo-50/50 to-transparent",
    headerDivider: "border-indigo-100",
    cardHoverBorder: "hover:border-indigo-400",
    badgeBg: "bg-indigo-500",
    badgeText: "text-white",
    icon: "text-indigo-600",
    chipBg: "bg-indigo-100",
    chipText: "text-indigo-700",
    chipHover: "hover:bg-indigo-200",
    exampleBar: "bg-indigo-300",
    exampleBg: "bg-indigo-50/40",
  },
  rose: {
    border: "border-rose-300",
    ring: "ring-rose-100",
    headerBg: "bg-gradient-to-r from-rose-50/50 to-transparent",
    headerDivider: "border-rose-100",
    cardHoverBorder: "hover:border-rose-400",
    badgeBg: "bg-rose-500",
    badgeText: "text-white",
    icon: "text-rose-600",
    chipBg: "bg-rose-100",
    chipText: "text-rose-700",
    chipHover: "hover:bg-rose-200",
    exampleBar: "bg-rose-300",
    exampleBg: "bg-rose-50/40",
  },
  sky: {
    border: "border-sky-300",
    ring: "ring-sky-100",
    headerBg: "bg-gradient-to-r from-sky-50/50 to-transparent",
    headerDivider: "border-sky-100",
    cardHoverBorder: "hover:border-sky-400",
    badgeBg: "bg-sky-500",
    badgeText: "text-white",
    icon: "text-sky-600",
    chipBg: "bg-sky-100",
    chipText: "text-sky-700",
    chipHover: "hover:bg-sky-200",
    exampleBar: "bg-sky-300",
    exampleBg: "bg-sky-50/40",
  },
  emerald: {
    border: "border-emerald-300",
    ring: "ring-emerald-100",
    headerBg: "bg-gradient-to-r from-emerald-50/50 to-transparent",
    headerDivider: "border-emerald-100",
    cardHoverBorder: "hover:border-emerald-400",
    badgeBg: "bg-emerald-500",
    badgeText: "text-white",
    icon: "text-emerald-600",
    chipBg: "bg-emerald-100",
    chipText: "text-emerald-700",
    chipHover: "hover:bg-emerald-200",
    exampleBar: "bg-emerald-300",
    exampleBg: "bg-emerald-50/40",
  },
  violet: {
    border: "border-violet-300",
    ring: "ring-violet-100",
    headerBg: "bg-gradient-to-r from-violet-50/50 to-transparent",
    headerDivider: "border-violet-100",
    cardHoverBorder: "hover:border-violet-400",
    badgeBg: "bg-violet-500",
    badgeText: "text-white",
    icon: "text-violet-600",
    chipBg: "bg-violet-100",
    chipText: "text-violet-700",
    chipHover: "hover:bg-violet-200",
    exampleBar: "bg-violet-300",
    exampleBg: "bg-violet-50/40",
  },
  slate: {
    border: "border-slate-300",
    ring: "ring-slate-100",
    headerBg: "bg-gradient-to-r from-slate-50/50 to-transparent",
    headerDivider: "border-slate-100",
    cardHoverBorder: "hover:border-slate-400",
    badgeBg: "bg-slate-500",
    badgeText: "text-white",
    icon: "text-slate-600",
    chipBg: "bg-slate-100",
    chipText: "text-slate-700",
    chipHover: "hover:bg-slate-200",
    exampleBar: "bg-slate-300",
    exampleBg: "bg-slate-50/40",
  },
};

// ─── Topic Accent Cycle ─────────────────────────────────────────────
/**
 * Ordered cycle of accent colors for topic assignment
 * Topics are assigned colors in a deterministic, repeating pattern
 */
export const topicAccentCycle: AccentColor[] = [
  "amber",
  "indigo",
  "emerald",
  "rose",
  "sky",
  "violet",
  "slate",
];

/**
 * Deterministically pick an accent color from a topic identifier
 * Uses hash function for strings and modulo for numbers
 * @param topic - Topic identifier (string or number)
 * @returns AccentColor - The assigned accent color
 */
export function accentFromTopic(topic: string | number): AccentColor {
  if (typeof topic === "number") {
    return topicAccentCycle[Math.abs(topic) % topicAccentCycle.length];
  }
  let hash = 0;
  for (let i = 0; i < topic.length; i++) {
    hash = (hash * 31 + topic.charCodeAt(i)) >>> 0;
  }
  return topicAccentCycle[hash % topicAccentCycle.length];
}
