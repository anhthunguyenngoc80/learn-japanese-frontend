import React, { useState, useId, type CSSProperties } from "react";

/* ============================================================================
 * LevelBadge — phong cách "huy hiệu rosette" (dựa theo file SVG tham khảo)
 * ----------------------------------------------------------------------------
 * File SVG gốc người dùng cung cấp là một huy hiệu (medal) dạng "rosette":
 *   - Cánh hoa toả tia (sunburst) màu cam - đỏ bao quanh ngoài cùng.
 *   - Vòng nguyệt quế (laurel wreath) ôm quanh vòng tròn trung tâm.
 *   - Vòng tròn trung tâm chứa SỐ (ví dụ "01") và bên dưới là 3 NGÔI SAO.
 *   - Ribbon (dải băng) bên dưới ghi chữ "LEVEL".
 *
 * Theo yêu cầu, component này:
 *   1) Cho phép đổi ĐIỂM SỐ tự do qua prop `score`.
 *   2) Thay hàng "sao" (rating stars) bằng CHỮ thể hiện TRÌNH ĐỘ
 *      (New / Learning / Reviewing / Mastered) ngay dưới điểm số.
 *   3) Giữ tinh thần thiết kế gốc: sunburst + vòng nguyệt quế + ribbon,
 *      độ hoành tráng (số cánh hoa, có/không vòng nguyệt quế) tăng dần theo
 *      trình độ, màu sắc đậm/rực rỡ hơn khi lên cấp cao (giống bản gốc
 *      màu cam - đỏ cho cấp cao nhất).
 *
 * - 100% vector (SVG dựng trong JSX), không dùng thư viện icon ngoài.
 * - Toàn bộ màu sắc / kích thước / font nằm trong một object THEME duy nhất
 *   (DEFAULT_THEME) -> chỉ cần sửa 1 chỗ để đổi toàn bộ giao diện.
 * - Có thể override theme cục bộ qua prop `theme` (deep-merge nông theo level).
 * ==========================================================================*/

/* -------------------------------------------------------------------------- */
/* 1. TYPES                                                                    */
/* -------------------------------------------------------------------------- */

export type LevelKey = "new" | "learning" | "reviewing" | "mastered";

/** Cấu hình màu sắc + nhãn cho từng level. */
export interface LevelColorConfig {
  /** Điểm đầu gradient của vòng tròn trung tâm (sáng hơn, gần tâm) */
  circleGradientFrom: string;
  /** Điểm cuối gradient của vòng tròn trung tâm (đậm hơn, ngoài rìa) */
  circleGradientTo: string;
  /** Màu viền vòng tròn trung tâm */
  circleBorder: string;
  /** Màu các cánh hoa toả tia (sunburst) phía ngoài cùng */
  sunburstColor: string;
  /** Màu viền/đường nét của cánh hoa toả tia (đậm hơn 1 chút để tạo khối) */
  sunburstShade: string;
  /** Màu vòng nguyệt quế (laurel wreath) */
  laurelColor: string;
  /** Màu chữ điểm số (giữa vòng tròn) */
  scoreColor: string;
  /** Màu chữ trình độ (thay cho hàng sao, nằm ngay dưới điểm số) */
  levelTextColor: string;
  /** Điểm đầu gradient của ribbon (dải băng dưới cùng) */
  ribbonGradientFrom: string;
  /** Điểm cuối gradient của ribbon */
  ribbonGradientTo: string;
  /** Màu chữ trong ribbon */
  ribbonTextColor: string;
  /** Nhãn hiển thị trình độ (tiếng Anh, có thể tuỳ biến) */
  label: string;
}

/** Toàn bộ token thiết kế có thể tuỳ chỉnh của component. */
export interface LevelBadgeTheme {
  levelColors: Record<LevelKey, LevelColorConfig>;
  fontFamily: string;
  /** Độ dày viền vòng tròn trung tâm */
  borderWidth: number;
  /** Khoảng cách giữa các badge khi xếp hàng (dùng ở Demo) */
  gap: number;
  /** Bo góc dùng cho ribbon (0 = nhọn, 1 = rất mềm) */
  cornerSoftness: number;
  /** Kích thước mặc định nếu không truyền prop size */
  defaultSize: number;
  /** Bật/tắt hiệu ứng hover mặc định */
  enableHover: boolean;
  /** Độ phóng to khi hover (1 = không đổi) */
  hoverScale: number;
  /** Thời gian transition hover (ms) */
  hoverTransitionMs: number;
  /** Chữ tĩnh hiển thị trên ribbon (mặc định "LEVEL") */
  ribbonTitle: string;
}

export interface LevelBadgeProps {
  /** Trạng thái học: new | learning | reviewing | mastered */
  level: LevelKey;
  /** Điểm số hiển thị giữa vòng tròn (0 - 100, có thể tuỳ biến khoảng qua scoreMax) */
  score: number;
  /** Giá trị tối đa của điểm số, dùng để format hiển thị (mặc định 100) */
  scoreMax?: number;
  /** Kích thước tổng thể của badge (px) */
  size?: number;
  /** Class CSS bổ sung cho container ngoài cùng */
  className?: string;
  /** Style bổ sung cho container ngoài cùng */
  style?: CSSProperties;
  /** Ghi đè theme (deep-merge nông với DEFAULT_THEME) */
  theme?: Partial<LevelBadgeTheme> & {
    levelColors?: Partial<Record<LevelKey, Partial<LevelColorConfig>>>;
  };
  /** Ẩn/hiện ribbon bên dưới (mặc định: hiện) */
  showRibbon?: boolean;
  /** Ẩn/hiện điểm số giữa vòng tròn (mặc định: hiện) */
  showScore?: boolean;
  /** Ghi đè nhãn trình độ hiển thị thay cho hàng sao (vd đổi sang tiếng Việt) */
  labelOverride?: string;
  /** Ghi đè chữ tĩnh trên ribbon (mặc định lấy theo theme.ribbonTitle = "LEVEL") */
  ribbonTextOverride?: string;
  /** onClick tuỳ chọn, giúp badge có thể dùng như 1 nút bấm */
  onClick?: () => void;
}

/* -------------------------------------------------------------------------- */
/* 2. DEFAULT THEME - NGUỒN DUY NHẤT CHO TOÀN BỘ MÀU SẮC / KÍCH THƯỚC          */
/* -------------------------------------------------------------------------- */

export const DEFAULT_THEME: LevelBadgeTheme = {
  levelColors: {
    // ---- New: gần như trơn, tông xám lạnh - "chưa bắt đầu" ----
    new: {
      circleGradientFrom: "#F4F4F6",
      circleGradientTo: "#D6D8DE",
      circleBorder: "#B7BAC3",
      sunburstColor: "#E4E5EA",
      sunburstShade: "#C7C9D1",
      laurelColor: "#C7C9D1",
      scoreColor: "#5B5E67",
      levelTextColor: "#8A8D96",
      ribbonGradientFrom: "#9CA0AC",
      ribbonGradientTo: "#7A7E89",
      ribbonTextColor: "#FFFFFF",
      label: "New",
    },
    // ---- Learning: tông xanh dương, bắt đầu có cánh hoa nhẹ ----
    learning: {
      circleGradientFrom: "#EAF4FF",
      circleGradientTo: "#8FC4F5",
      circleBorder: "#4C9BDE",
      sunburstColor: "#BFE0FA",
      sunburstShade: "#8FC4F5",
      laurelColor: "#9AD1B0",
      scoreColor: "#1D5C8A",
      levelTextColor: "#2B7FB8",
      ribbonGradientFrom: "#5CADEB",
      ribbonGradientTo: "#2E86C9",
      ribbonTextColor: "#FFFFFF",
      label: "Learning",
    },
    // ---- Reviewing: tông cam vàng, cánh hoa rõ hơn + nguyệt quế 1 phần ----
    reviewing: {
      circleGradientFrom: "#FFF3DF",
      circleGradientTo: "#FBC471",
      circleBorder: "#EE9B2E",
      sunburstColor: "#FBD08C",
      sunburstShade: "#F5B25A",
      laurelColor: "#8FCB8A",
      scoreColor: "#9A5B0A",
      levelTextColor: "#C97E14",
      ribbonGradientFrom: "#FDAE4C",
      ribbonGradientTo: "#E9861A",
      ribbonTextColor: "#FFFFFF",
      label: "Reviewing",
    },
    // ---- Mastered: cam - đỏ rực (giống màu bản gốc), sunburst đầy đủ + nguyệt quế trọn vẹn ----
    mastered: {
      circleGradientFrom: "#FFE4D6",
      circleGradientTo: "#FA6A4B",
      circleBorder: "#D8402A",
      sunburstColor: "#FAAB6B",
      sunburstShade: "#F26B3F",
      laurelColor: "#7FC97E",
      scoreColor: "#FFFFFF",
      levelTextColor: "#FFE9C9",
      ribbonGradientFrom: "#FB6A4C",
      ribbonGradientTo: "#D8402A",
      ribbonTextColor: "#FFFFFF",
      label: "Mastered",
    },
  },
  fontFamily:
    "'Baloo 2', 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', sans-serif",
  borderWidth: 3,
  gap: 36,
  cornerSoftness: 0.4,
  defaultSize: 140,
  enableHover: true,
  hoverScale: 1.07,
  hoverTransitionMs: 180,
  ribbonTitle: "LEVEL",
};

/** Deep-merge nông: ghi đè theme.levelColors[level].{field} mà không mất field khác */
function mergeTheme(
  base: LevelBadgeTheme,
  override?: LevelBadgeProps["theme"]
): LevelBadgeTheme {
  if (!override) return base;
  const mergedLevelColors = { ...base.levelColors };
  if (override.levelColors) {
    (Object.keys(override.levelColors) as LevelKey[]).forEach((key) => {
      mergedLevelColors[key] = {
        ...base.levelColors[key],
        ...override.levelColors![key],
      };
    });
  }
  return {
    ...base,
    ...override,
    levelColors: mergedLevelColors,
  };
}

/* -------------------------------------------------------------------------- */
/* 3. HÌNH HỌC DÙNG CHUNG                                                      */
/* -------------------------------------------------------------------------- */
/*
 * Toạ độ chuẩn hoá trên viewBox "0 0 140 162" (dư chiều cao cho ribbon nhô
 * xuống dưới vòng tròn). Tâm vòng tròn: (70, 66). Bán kính vòng tròn: 34.
 */

const CX = 70;
const CY = 66;
const R = 34;

/** Sinh chuỗi điểm cho hình "cánh hoa toả tia" (rosette) bằng cách xen kẽ 2 bán kính */
function buildSunburstPoints(
  points: number,
  outerR: number,
  innerR: number
): string {
  const coords: string[] = [];
  const step = 360 / (points * 2);
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * step - 90) * (Math.PI / 180);
    const r = i % 2 === 0 ? outerR : innerR;
    coords.push(`${CX + r * Math.cos(angle)},${CY + r * Math.sin(angle)}`);
  }
  return coords.join(" ");
}

/** Một chiếc lá nhỏ, dùng để dựng vòng nguyệt quế */
function Leaf({
  cx,
  cy,
  size,
  fill,
  rotation,
}: {
  cx: number;
  cy: number;
  size: number;
  fill: string;
  rotation: number;
}) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={size}
      ry={size * 0.42}
      fill={fill}
      transform={`rotate(${rotation} ${cx} ${cy})`}
    />
  );
}

/** Một nhánh nguyệt quế (chuỗi lá dọc theo cung tròn), trái hoặc phải */
function LaurelBranch({
  side,
  color,
  leafCount,
  radius,
}: {
  side: "left" | "right";
  color: string;
  leafCount: number;
  radius: number;
}) {
  const startAngle = side === "left" ? 165 : 15;
  const endAngle = side === "left" ? 95 : 85;
  const leaves = [];
  for (let i = 0; i < leafCount; i++) {
    const t = leafCount === 1 ? 0 : i / (leafCount - 1);
    const angle = startAngle + (endAngle - startAngle) * t;
    const rad = (angle * Math.PI) / 180;
    const x = CX + radius * Math.cos(rad);
    const y = CY + radius * Math.sin(rad);
    const rotation = side === "left" ? angle + 25 : angle - 25;
    leaves.push(
      <Leaf key={`${side}-${i}`} cx={x} cy={y} size={4.6} fill={color} rotation={rotation} />
    );
  }
  return <>{leaves}</>;
}

/* -------------------------------------------------------------------------- */
/* 4. RIBBON — dải băng dưới cùng                                             */
/* -------------------------------------------------------------------------- */

function Ribbon({
  colors,
  title,
  fontFamily,
  cornerSoftness,
  uid,
}: {
  colors: LevelColorConfig;
  title: string;
  fontFamily: string;
  cornerSoftness: number;
  uid: string;
}) {
  const ribbonY = CY + R + 8;
  const ribbonH = 22;
  const bodyW = 84;
  const tailW = 12;
  const rx = 3 + cornerSoftness * 4;

  return (
    <g>
      {/* đuôi ribbon trái */}
      <path
        d={`M ${CX - bodyW / 2 - tailW} ${ribbonY + 3}
            L ${CX - bodyW / 2 + 2} ${ribbonY + 3}
            L ${CX - bodyW / 2 + 2} ${ribbonY + ribbonH - 3}
            L ${CX - bodyW / 2 - tailW} ${ribbonY + ribbonH}
            L ${CX - bodyW / 2 - tailW + 5} ${ribbonY + ribbonH / 2}
            Z`}
        fill={colors.ribbonGradientTo}
      />
      {/* đuôi ribbon phải */}
      <path
        d={`M ${CX + bodyW / 2 + tailW} ${ribbonY + 3}
            L ${CX + bodyW / 2 - 2} ${ribbonY + 3}
            L ${CX + bodyW / 2 - 2} ${ribbonY + ribbonH - 3}
            L ${CX + bodyW / 2 + tailW} ${ribbonY + ribbonH}
            L ${CX + bodyW / 2 + tailW - 5} ${ribbonY + ribbonH / 2}
            Z`}
        fill={colors.ribbonGradientTo}
      />
      {/* thân ribbon */}
      <rect
        x={CX - bodyW / 2}
        y={ribbonY}
        width={bodyW}
        height={ribbonH}
        rx={rx}
        fill={`url(#ribbonGrad-${uid})`}
        stroke={colors.ribbonGradientTo}
        strokeWidth={1}
      />
      <text
        x={CX}
        y={ribbonY + ribbonH / 2 + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.ribbonTextColor}
        fontFamily={fontFamily}
        fontSize={10.5}
        fontWeight={800}
        letterSpacing={1.2}
      >
        {title}
      </text>
    </g>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. TRANG TRÍ THEO LEVEL (số cánh hoa & vòng nguyệt quế tăng dần)           */
/* -------------------------------------------------------------------------- */

interface DecorationSpec {
  /** Số cánh hoa toả tia; 0 = không có sunburst */
  sunburstPoints: number;
  sunburstOuterR: number;
  sunburstInnerR: number;
  /** Có vẽ vòng nguyệt quế hay không, và mỗi nhánh bao nhiêu lá */
  laurelLeafCount: number;
}

const DECORATION_BY_LEVEL: Record<LevelKey, DecorationSpec> = {
  new: { sunburstPoints: 0, sunburstOuterR: 0, sunburstInnerR: 0, laurelLeafCount: 0 },
  learning: { sunburstPoints: 10, sunburstOuterR: 42, sunburstInnerR: 37, laurelLeafCount: 0 },
  reviewing: { sunburstPoints: 14, sunburstOuterR: 45, sunburstInnerR: 38, laurelLeafCount: 4 },
  mastered: { sunburstPoints: 20, sunburstOuterR: 48, sunburstInnerR: 39, laurelLeafCount: 6 },
};

/* -------------------------------------------------------------------------- */
/* 6. COMPONENT CHÍNH: LevelBadge                                             */
/* -------------------------------------------------------------------------- */

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  score,
  scoreMax = 100,
  size,
  className,
  style,
  theme,
  showRibbon = true,
  showScore = true,
  labelOverride,
  ribbonTextOverride,
  onClick,
}) => {
  const mergedTheme = mergeTheme(DEFAULT_THEME, theme);
  const colors = mergedTheme.levelColors[level];
  const decoration = DECORATION_BY_LEVEL[level];
  const finalSize = size ?? mergedTheme.defaultSize;
  const clampedScore = Math.max(0, Math.min(scoreMax, Math.round(score)));
  const rawId = useId().replace(/[:]/g, "");
  const uid = `${level}-${rawId}`;
  const [isHovered, setIsHovered] = useState(false);

  const isInteractive = mergedTheme.enableHover || typeof onClick === "function";
  const scoreFontSize = 22;
  const levelLabelFontSize = 9;

  const containerStyle: CSSProperties = {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: mergedTheme.fontFamily,
    cursor: onClick ? "pointer" : "default",
    userSelect: "none",
    transform:
      isInteractive && isHovered ? `scale(${mergedTheme.hoverScale})` : "scale(1)",
    transition: `transform ${mergedTheme.hoverTransitionMs}ms ease`,
    ...style,
  };

  return (
    <div
      className={className}
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      role={onClick ? "button" : "img"}
      aria-label={`${labelOverride ?? colors.label} - ${clampedScore}/${scoreMax} điểm`}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
    >
      <svg
        width={finalSize}
        height={(finalSize * 162) / 140}
        viewBox="0 0 140 162"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`circleGrad-${uid}`} cx="38%" cy="30%" r="75%">
            <stop offset="0%" stopColor={colors.circleGradientFrom} />
            <stop offset="100%" stopColor={colors.circleGradientTo} />
          </radialGradient>
          <linearGradient id={`ribbonGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.ribbonGradientFrom} />
            <stop offset="100%" stopColor={colors.ribbonGradientTo} />
          </linearGradient>
        </defs>

        {/* Cánh hoa toả tia (sunburst) - số cánh tăng dần theo level, level "new" không có */}
        {decoration.sunburstPoints > 0 && (
          <polygon
            points={buildSunburstPoints(
              decoration.sunburstPoints,
              decoration.sunburstOuterR,
              decoration.sunburstInnerR
            )}
            fill={colors.sunburstColor}
            stroke={colors.sunburstShade}
            strokeWidth={1}
            strokeLinejoin="round"
          />
        )}

        {/* Vòng nguyệt quế - chỉ xuất hiện từ level "reviewing" trở lên */}
        {decoration.laurelLeafCount > 0 && (
          <>
            <LaurelBranch
              side="left"
              color={colors.laurelColor}
              leafCount={decoration.laurelLeafCount}
              radius={R + 8}
            />
            <LaurelBranch
              side="right"
              color={colors.laurelColor}
              leafCount={decoration.laurelLeafCount}
              radius={R + 8}
            />
          </>
        )}

        {/* Vòng tròn trung tâm */}
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill={`url(#circleGrad-${uid})`}
          stroke={colors.circleBorder}
          strokeWidth={mergedTheme.borderWidth}
        />
        {/* Highlight nhẹ tạo chiều sâu, vẫn giữ phong cách flat */}
        <ellipse
          cx={CX - 11}
          cy={CY - 13}
          rx={12}
          ry={7}
          fill="#FFFFFF"
          opacity={0.3}
          transform={`rotate(-25 ${CX - 11} ${CY - 13})`}
        />

        {/* Điểm số ở giữa */}
        {showScore && (
          <text
            x={CX}
            y={CY - 6}
            textAnchor="middle"
            dominantBaseline="central"
            fill={colors.scoreColor}
            fontFamily={mergedTheme.fontFamily}
            fontSize={scoreFontSize}
            fontWeight={800}
          >
            {clampedScore}
          </text>
        )}

        {/* Chữ trình độ - THAY CHO HÀNG SAO trong bản gốc, nằm ngay dưới điểm số */}
        <text
          x={CX}
          y={CY + 16}
          textAnchor="middle"
          dominantBaseline="central"
          fill={colors.levelTextColor}
          fontFamily={mergedTheme.fontFamily}
          fontSize={levelLabelFontSize}
          fontWeight={700}
          letterSpacing={0.6}
        >
          {(labelOverride ?? colors.label).toUpperCase()}
        </text>

        {/* Ribbon dưới cùng */}
        {showRibbon && (
          <Ribbon
            colors={colors}
            title={ribbonTextOverride ?? mergedTheme.ribbonTitle}
            fontFamily={mergedTheme.fontFamily}
            cornerSoftness={mergedTheme.cornerSoftness}
            uid={uid}
          />
        )}
      </svg>
    </div>
  );
};

export default LevelBadge;

/* -------------------------------------------------------------------------- */
/* 7. DEMO (tuỳ chọn) - hiển thị 4 trạng thái cạnh nhau                       */
/* -------------------------------------------------------------------------- */
/*
 * Có thể xoá phần Demo này nếu chỉ cần import { LevelBadge } vào dự án khác.
 */

export const LevelBadgeDemo: React.FC = () => {
  const items: { level: LevelKey; score: number }[] = [
    { level: "new", score: 0 },
    { level: "learning", score: 35 },
    { level: "reviewing", score: 72 },
    { level: "mastered", score: 100 },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: DEFAULT_THEME.gap,
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: 48,
        backgroundColor: "#101334",
      }}
    >
      {items.map((item) => (
        <LevelBadge key={item.level} level={item.level} score={item.score} size={140} />
      ))}
    </div>
  );
};