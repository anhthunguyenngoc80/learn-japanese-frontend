import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components";
import {
  colorStyles,
  selectedStyles,
  radiusStyles,
  textStyles,
  paddingStyles,
  iconOnlyPaddingStyles,
  type AccentColor,
  type ComponentKind,
  type ComponentRadius,
  type ComponentSize,
  type ComponentSpacing,
  type ComponentBorderWidth,
  PATHS,
} from "../../constant";
import { twMerge } from "tailwind-merge";
import { Check, LockKeyhole, Plus } from "lucide-react";

/* =========================================================
 * LESSON TYPE
 * =======================================================*/
export type LessonStatus = "locked" | "current" | "completed" | "upcoming";
export type LessonType = "lesson" | "checkpoint" | "boss" | "review";

export interface Lesson {
  id: string;
  title: string;
  subtitle?: string;
  status: LessonStatus;
  type: LessonType;
  progress?: number;
}

/* =========================================================
 * ROADMAP PROPS – theo đúng bộ prop design-system của bạn
 * =======================================================*/
export interface LearningRoadmapProps {
  lessons?: Lesson[];
  title?: string;
  color?: AccentColor;
  kind?: ComponentKind;
  radius?: ComponentRadius;
  size?: ComponentSize;
  spacing?: ComponentSpacing;
  /** Chỉ có tác dụng với kind "outline"/"text"/"ghost". Mặc định "md". */
  borderWidth?: ComponentBorderWidth;
  /** true: roadmap chiếm full chiều rộng container thay vì canh giữa với width cố định. */
  fullWidth?: boolean;
  /** true: khoá toàn bộ roadmap (mọi node coi như locked), bất kể status thật. */
  disabled?: boolean;
  /** true: không hiển thị label card (title/subtitle) dưới mỗi node, chỉ hiện icon. */
  iconOnly?: boolean;
  /** true: node "current" được nhấn mạnh bằng selectedStyles[color] thay vì colorStyles thường. */
  selected?: boolean;
  /** Bật/tắt hiệu ứng hover (nâng node, đổi shadow...). Mặc định true. */
  isHover?: boolean;
  className?: string;
}

/* =========================================================
 * MAP KÍCH THƯỚC HÌNH HỌC THEO `size`
 * (không có token sẵn cho việc này nên tự quy ước tỉ lệ hợp lý,
 *  bạn chỉnh số theo ý thích)
 * =======================================================*/
const NODE_OUTER: Record<ComponentSize, number> = {
  sm: 48,
  md: 56,
  lg: 64,
  xl: 72,
  "2xl": 84,
  "4xl": 100,
};
const ROW_GAP: Record<ComponentSize, number> = {
  sm: 120,
  md: 140,
  lg: 160,
  xl: 180,
  "2xl": 200,
  "4xl": 220,
};
const COLUMN_AMP: Record<ComponentSize, number> = {
  sm: 90,
  md: 110,
  lg: 130,
  xl: 150,
  "2xl": 170,
  "4xl": 190,
};
const ICON_PX: Record<ComponentSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  "2xl": 32,
  "4xl": 40,
};
const LINE_WIDTH: Record<ComponentBorderWidth, number> = {
  none: 0,
  thin: 2,
  sm: 3,
  md: 4,
  lg: 6,
};

/** Stroke class cho đường đã đi qua (completed path) — viết đủ literal để Tailwind bắt được class. */
const accentStrokeClass: Record<AccentColor, string> = {
  rose: "stroke-rose-500",
  red: "stroke-red-500",
  amber: "stroke-amber-500",
  emerald: "stroke-emerald-500",
  teal: "stroke-teal-500",
  blue: "stroke-blue-500",
  indigo: "stroke-indigo-500",
  violet: "stroke-violet-500",
  sky: "stroke-sky-500",
  slate: "stroke-slate-500",
  white: "stroke-white",
  green: "stroke-green-500",
};

const MOCK_LESSONS: Lesson[] = [
  { id: "1", title: "Bài 1", status: "completed", type: "lesson" },
  { id: "2", title: "Bài 2", status: "completed", type: "lesson" },
  { id: "3", title: "Ôn tập", status: "current", type: "review", progress: 40 },
  { id: "4", title: "Bài 4", status: "upcoming", type: "lesson" },
  { id: "5", title: "Boss", status: "locked", type: "boss" },
];

/* =========================================================
 * ICON
 * =======================================================*/
function Icon({ lesson, size = 20 }: { lesson: Lesson; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (lesson.status === "locked") {
    return <LockKeyhole />;
  }
  if (lesson.status === "completed") {
    return <Check />;
  }
  if (lesson.type === "boss") {
    return (
      <svg {...common}>
        <path d="M4 6l3 12h10l3-12-5 4-3-6-3 6-5-4z" />
      </svg>
    );
  }
  if (lesson.type === "checkpoint") {
    return (
      <svg {...common}>
        <path d="M5 21V4h10l-1 3 1 3H5" />
      </svg>
    );
  }
  if (lesson.type === "review") {
    return (
      <svg {...common}>
        <path d="M20 12a8 8 0 1 1-2.34-5.66" />
        <path d="M20 4v5h-5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9z" />
    </svg>
  );
}

/* =========================================================
 * NODE
 * =======================================================*/
interface LessonNodeProps {
  lesson: Lesson;
  x: number;
  y: number;
  color: AccentColor;
  kind: ComponentKind;
  radius: ComponentRadius;
  size: ComponentSize;
  spacing: ComponentSpacing;
  disabled?: boolean;
  iconOnly?: boolean;
  selected?: boolean;
  isHover: boolean;
}

function LessonNode({
  lesson,
  x,
  y,
  color,
  kind,
  radius,
  size,
  spacing,
  disabled,
  iconOnly,
  selected,
  isHover,
}: LessonNodeProps) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);

  const isLocked = !!disabled || lesson.status === "locked";
  const isCurrent = lesson.status === "current";
  const isCompleted = lesson.status === "completed";

  // Quy tắc: bỏ statusColor, chỉ đổi `kind` theo trạng thái, giữ nguyên `color` truyền vào.
  const resolvedKind: ComponentKind = isLocked
    ? "soft"
    : isCompleted
      ? "solid"
      : isCurrent
        ? "elevated"
        : kind;

  const nodeColorClass = isLocked
    ? colorStyles.slate.soft
    : colorStyles.slate.soft;
  const useSelectedEmphasis = isCurrent && selected;
  const nodeClass = useSelectedEmphasis
    ? selectedStyles[color]
    : nodeColorClass;

  // Màu icon: nền đậm (solid/elevated) -> icon trắng, nền nhạt (soft/outline/ghost/text) -> icon theo tông màu.
  const solidLikeKind = resolvedKind === "solid" || resolvedKind === "elevated";
  const iconToneClass = isLocked
    ? "text-slate-400"
    : solidLikeKind
      ? "text-white"
      : colorStyles[color].text.split(" ")[0]; // lấy token màu chữ đầu tiên, vd "text-rose-700"

  const outer = NODE_OUTER[size];

  // Progress ring config
  const ringGap = 5;
  const ringStrokeWidth = 3;
  const ringRadius = outer / 2 + ringGap;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const progress = lesson.progress ?? 0;
  const progressOffset =
    ringCircumference - (progress / 100) * ringCircumference;

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        width: 200,
      }}
    >
      <div
        className="relative transition-all duration-200"
        style={{
          transform: pressed
            ? "translateY(4px) scale(0.97)"
            : hover && !isLocked
              ? "translateY(-4px) scale(1.06)"
              : "translateY(0) scale(1)",
        }}
      >
        {/* Outer progress ring — fills clockwise from top */}
        {isCurrent && !isLocked && (
          <svg
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              width: outer + ringGap * 2 + ringStrokeWidth * 2,
              height: outer + ringGap * 2 + ringStrokeWidth * 2,
              transform: "translate(-50%, -50%) rotate(-90deg)",
            }}
          >
            {/* Background track */}
            <circle
              cx={(outer + ringGap * 2 + ringStrokeWidth * 2) / 2}
              cy={(outer + ringGap * 2 + ringStrokeWidth * 2) / 2}
              r={outer / 2 + ringGap}
              fill="none"
              className="stroke-slate-200 dark:stroke-slate-700"
              strokeWidth={ringStrokeWidth}
            />
            {/* Progress arc — fills clockwise as progress increases */}
            <circle
              cx={(outer + ringGap * 2 + ringStrokeWidth * 2) / 2}
              cy={(outer + ringGap * 2 + ringStrokeWidth * 2) / 2}
              r={outer / 2 + ringGap}
              fill="none"
              className={accentStrokeClass[color]}
              strokeWidth={ringStrokeWidth}
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringCircumference}
              style={{
                strokeDashoffset: progressOffset,
                transition: "stroke-dashoffset 0.6s ease",
              }}
            />
          </svg>
        )}
        <button
          type="button"
          disabled={isLocked}
          aria-label={lesson.title}
          onMouseEnter={() => isHover && setHover(true)}
          onMouseLeave={() => {
            setHover(false);
            setPressed(false);
          }}
          onMouseDown={() => isHover && setPressed(true)}
          onMouseUp={() => setPressed(false)}
          className={twMerge(
            "relative flex items-center justify-center rounded-full transition-none",
            nodeClass,
            iconOnlyPaddingStyles[spacing],
            isLocked
              ? "cursor-not-allowed grayscale opacity-60"
              : "cursor-pointer",
          )}
          style={{
            width: outer,
            height: outer,
          }}
        >
          {isCurrent && !isLocked && (
            <span
              aria-hidden
              className={twMerge(
                "absolute inset-0 rounded-full opacity-40",
                colorStyles[color].solid,
              )}
            />
          )}
          <span
            className={twMerge(
              "relative flex items-center justify-center",
              iconToneClass,
            )}
          >
            <Icon lesson={lesson} size={ICON_PX[size]} />
          </span>
        </button>
      </div>

      {/* Label card — ẩn hoàn toàn khi iconOnly=true */}
      {!iconOnly && (
        <div
          className={twMerge(
            "mt-4 w-[180px] text-center",
            radiusStyles[radius],
            paddingStyles[spacing],
            isCurrent && selected
              ? colorStyles[color].outline
              : "border-transparent",
            isLocked && "opacity-60",
            // Nền surface của card — thay bằng token surface thật của bạn nếu có.
            "bg-white shadow-sm dark:bg-slate-900",
          )}
          style={{
            transform:
              hover && !isLocked && isHover
                ? "translateY(-2px)"
                : "translateY(0)",
            transition: "transform 200ms ease, opacity 200ms ease",
          }}
        >
          <div
            className={twMerge(
              "font-extrabold leading-tight",
              textStyles[size],
            )}
          >
            {lesson.title}
          </div>
          {lesson.subtitle && (
            <div className="mt-0.5 text-slate-500 dark:text-slate-400 text-xs">
              {lesson.subtitle}
            </div>
          )}
          {isCurrent && (
            <div className="mt-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className={twMerge(
                    "h-full rounded-full transition-all duration-500",
                    colorStyles[color].solid,
                  )}
                  style={{ width: `${lesson.progress ?? 0}%` }}
                />
              </div>
              <div
                className={twMerge(
                  "mt-1 text-[10px] font-bold tracking-wide",
                  colorStyles[color].text.split(" ")[0],
                )}
              >
                {lesson.progress ?? 0}% IN PROGRESS
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
 * ROADMAP
 * =======================================================*/
export function LearningRoadmap({
  lessons = MOCK_LESSONS,
  title = "Learning Roadmap",
  color = "rose",
  kind = "solid",
  radius = "lg",
  size = "lg",
  spacing = "lg",
  borderWidth = "lg",
  fullWidth = false,
  disabled = false,
  iconOnly = false,
  selected = false,
  isHover = true,
  className,
}: LearningRoadmapProps) {
  const navigate = useNavigate();
  const positions = useMemo(() => {
    const amp = COLUMN_AMP[size];
    const centerX = amp + 100;
    return lessons.map((_, i) => ({
      x: centerX + Math.sin(i * 0.9) * amp,
      y: 90 + i * ROW_GAP[size],
    }));
  }, [lessons, size]);

  const totalHeight = positions.length * ROW_GAP[size] + 120;
  const totalWidth = COLUMN_AMP[size] * 2 + 220;

  const completed = lessons.filter((l) => l.status === "completed").length;
  const total = lessons.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  const pathD = useMemo(() => {
    if (positions.length < 2) return "";
    let d = `M ${positions[0].x} ${positions[0].y}`;
    for (let i = 1; i < positions.length; i++) {
      const p0 = positions[i - 1];
      const p1 = positions[i];
      const mx = (p0.x + p1.x) / 2;
      const cy = p0.y + (p1.y - p0.y) * 0.5;
      d += ` C ${p0.x} ${cy}, ${mx} ${cy}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [positions]);

  const lastDoneIdx = (() => {
    let idx = -1;
    lessons.forEach((l, i) => {
      if (l.status === "completed") idx = i;
    });
    return idx;
  })();

  const completedPathD = useMemo(() => {
    if (lastDoneIdx <= 0) return "";
    const pts = positions.slice(0, lastDoneIdx + 1);
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const mx = (p0.x + p1.x) / 2;
      const cy = p0.y + (p1.y - p0.y) * 0.5;
      d += ` C ${p0.x} ${cy}, ${mx} ${cy}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [positions, lastDoneIdx]);

  const lineWidth = LINE_WIDTH[borderWidth];

  return (
    <div className={twMerge(className)}>
      <Card
        item={{
          id: "roadmap",
          title,
          subtitle: `Đã hoàn thành ${completed}/${total}`,
          progress: pct,
        }}
        hoverEffect={false}
        kind={kind}
        color={color}
      />

      <div className="mt-5 flex justify-end">
        <button
          onClick={() => navigate(PATHS.createRoadmap)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
        >
          <Plus size={18} />
          Tạo lộ trình
        </button>
      </div>

      <div
        className={twMerge(
          "flex justify-center px-4 pb-24 pt-10",
          fullWidth ? "w-full" : "mx-auto",
        )}
      >
        <div
          className="relative"
          style={{
            width: fullWidth ? "100%" : totalWidth,
            height: totalHeight,
          }}
        >
          <svg
            className="pointer-events-none absolute inset-0"
            width="100%"
            height={totalHeight}
          >
            <path
              d={pathD}
              fill="none"
              className="stroke-slate-300 dark:stroke-slate-700"
              strokeWidth={lineWidth}
              strokeLinecap="round"
              strokeDasharray="2 14"
            />
            {lastDoneIdx > 0 && (
              <path
                d={completedPathD}
                fill="none"
                className={accentStrokeClass[disabled ? "slate" : color]}
                strokeWidth={lineWidth}
                strokeLinecap="round"
              />
            )}
          </svg>

          {lessons.map((lesson, i) => (
            <LessonNode
              key={lesson.id}
              lesson={lesson}
              x={positions[i].x}
              y={positions[i].y}
              color={color}
              kind={kind}
              radius={radius}
              size={size}
              spacing={spacing}
              disabled={disabled}
              iconOnly={iconOnly}
              selected={selected}
              isHover={isHover}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
