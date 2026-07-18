import { useState, useRef, useEffect, useImperativeHandle, forwardRef, useMemo } from "react";
import { Stage, Layer, Line, Circle } from "react-konva";
import { useKanjiVG } from "../utils";
/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type HintMode = "sequential" | "all-at-once";

export type PracticeBoardHandle = {
  /** Clear all drawn strokes */
  clear: () => void;
  /** Undo last stroke */
  undo: () => void;
  /** Redo last undone stroke */
  redo: () => void;
  /** Get all drawn strokes as flat point arrays */
  getStrokes: () => { points: number[] }[];
  /** Number of strokes drawn */
  getStrokeCount: () => number;
};

type Stroke = { points: number[] };

/** Score result type compatible with what PracticeWrite produces */
export type PracticeBoardScoreResult = {
  char: string;
  strokeCountExpected: number;
  strokeCountDrawn: number;
  strokeCountMatch: boolean;
  orderCorrect: boolean;
  strokes: {
    strokeIndex: number;
    passed: boolean;
    [key: string]: any;
  }[];
  overallScore: number;
  passed: boolean;
  feedback: string[];
  extraStrokes: number[];
};

type PracticeBoardProps = {
  /** The character to practice */
  char: string;
  /** How hint strokes are revealed: "sequential" (one by one animated) or "all-at-once" (show all at once) */
  hintMode: HintMode;
  /** Whether to show the hint overlay */
  showHint?: boolean;
  /** Canvas width (default 200) */
  width?: number;
  /** Canvas height (default 200) */
  height?: number;
  /** Duration in ms for each stroke's drawing animation (default 800) */
  strokeDurationMs?: number;
  /** External scoring result to display (color-coded overlay) */
  scoreResult?: PracticeBoardScoreResult | null;
  /** Called when the number of reference strokes is known */
  onStrokeCountChange?: (refStrokeCount: number) => void;
  /** Called when a stroke is added/removed */
  onStrokeChange?: (drawnCount: number) => void;
  /**
   * For sequential hint mode: auto-play stroke index (0-based).
   * When provided and showHint=true, hints will reveal based on this index
   * instead of user's drawn stroke count.
   * Set to -1 or undefined to disable auto-play.
   */
  autoPlayStrokeIndex?: number;
};

/* ------------------------------------------------------------------ */
/*  Hidden SVG path sampler (same logic as PracticeWrite)              */
/* ------------------------------------------------------------------ */
const SVG_NS = "http://www.w3.org/2000/svg";
let hiddenSvgEl: SVGSVGElement | null = null;
const getHiddenSvg = (): SVGSVGElement => {
  if (!hiddenSvgEl) {
    hiddenSvgEl = document.createElementNS(SVG_NS, "svg");
    hiddenSvgEl.style.position = "absolute";
    hiddenSvgEl.style.width = "0";
    hiddenSvgEl.style.height = "0";
    hiddenSvgEl.style.overflow = "hidden";
    document.body.appendChild(hiddenSvgEl);
  }
  return hiddenSvgEl;
};

const SAMPLE_COUNT = 80;
const pathPointsCache = new Map<string, number[]>();

const getPathPoints = (d: string): number[] => {
  let pts = pathPointsCache.get(d);
  if (!pts) {
    const svg = getHiddenSvg();
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", d);
    svg.appendChild(path);

    let len = path.getTotalLength();
    if (!len || len <= 0) len = 1;

    const result: number[] = [];
    for (let i = 0; i <= SAMPLE_COUNT; i++) {
      const dist = (len * i) / SAMPLE_COUNT;
      const p = path.getPointAtLength(dist);
      result.push(p.x, p.y);
    }

    svg.removeChild(path);
    pathPointsCache.set(d, result);
    pts = result;
  }
  return pts;
};

/* ------------------------------------------------------------------ */
/*  DrawPathEffect - animated stroke drawing                           */
/* ------------------------------------------------------------------ */
const KANJI_VG_SIZE = 109;
const BOARD_PADDING = 10;

/** Compute scale and offset so KanjiVG fits centered in a board of given width */
const getTransform = (boardWidth: number) => {
  const scale = (boardWidth - BOARD_PADDING * 2) / KANJI_VG_SIZE;
  const offset = (boardWidth - KANJI_VG_SIZE * scale) / 2;
  return { scale, offset };
};

type DrawPathEffectProps = {
  d: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  strokeDurationMs: number;
  boardWidth?: number;
};

const DrawPathEffect = ({ d, stroke, strokeWidth, opacity, strokeDurationMs, boardWidth = 200 }: DrawPathEffectProps) => {
  const { scale, offset } = getTransform(boardWidth);
  const style = {
    x: offset,
    y: offset,
    scaleX: scale,
    scaleY: scale,
  };
  const allPoints = getPathPoints(d);
  const totalSamples = allPoints.length / 2;
  const [visibleSamples, setVisibleSamples] = useState(1);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setVisibleSamples(1);
    if (strokeDurationMs <= 0) {
      setVisibleSamples(totalSamples);
      return;
    }
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / strokeDurationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const n = Math.max(1, Math.round(eased * totalSamples));
      setVisibleSamples(n);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [d, strokeDurationMs, totalSamples]);

  const visiblePoints = allPoints.slice(0, visibleSamples * 2);

    return (
      <Line
        points={visiblePoints}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
        lineCap="round"
        lineJoin="round"
        tension={0}
        x={style.x}
        y={style.y}
        scaleX={style.scaleX}
        scaleY={style.scaleY}
      />
    );
};

/* ------------------------------------------------------------------ */
/*  PracticeBoard component                                            */
/* ------------------------------------------------------------------ */

export const PracticeBoard = forwardRef<PracticeBoardHandle, PracticeBoardProps>(
  (
    {
      char,
      hintMode,
      showHint = false,
      width = 200,
      height = 200,
      strokeDurationMs = 800,
      scoreResult,
      onStrokeCountChange,
      onStrokeChange,
      autoPlayStrokeIndex = -1,
    }: PracticeBoardProps,
    ref,
  ) => {
    // Load KanjiVG paths for the character
    const codePoint = char?.codePointAt(0);
    const hex = codePoint !== undefined ? codePoint.toString(16).padStart(5, "0") : null;
    const hintPaths = useKanjiVG(hex ? `${hex}.svg` : null);

    // Notify parent of reference stroke count
    useEffect(() => {
      if (onStrokeCountChange && hintPaths.length > 0) {
        onStrokeCountChange(hintPaths.length);
      }
    }, [hintPaths.length, onStrokeCountChange]);

    // Drawing state
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [, setRedoStack] = useState<Stroke[]>([]);
    const isDrawing = useRef(false);
    const stageRef = useRef<any>(null);

    // Clear when char changes
    useEffect(() => {
      setStrokes([]);
      setRedoStack([]);
    }, [char]);

    // Expose imperative methods
    useImperativeHandle(
      ref,
      () => ({
        clear: () => {
          setStrokes([]);
          setRedoStack([]);
        },
        undo: () => {
          setStrokes((prev) => {
            if (prev.length === 0) return prev;
            const last = prev[prev.length - 1];
            setRedoStack((r) => [...r, last]);
            return prev.slice(0, -1);
          });
        },
        redo: () => {
          setRedoStack((prev) => {
            if (prev.length === 0) return prev;
            const last = prev[prev.length - 1];
            setStrokes((s) => [...s, last]);
            return prev.slice(0, -1);
          });
        },
        getStrokes: () => strokes,
        getStrokeCount: () => strokes.length,
      }),
      [strokes],
    );

    // Notify parent of drawn stroke count
    useEffect(() => {
      onStrokeChange?.(strokes.length);
    }, [strokes.length, onStrokeChange]);

    // Pointer handlers
    const getPos = (e: any) => e.target.getStage()?.getPointerPosition();

    const handlePointerDown = (e: any) => {
      const pos = getPos(e);
      if (!pos) return;
      isDrawing.current = true;
      setStrokes((prev) => [...prev, { points: [pos.x, pos.y] }]);
    };

    const handlePointerMove = (e: any) => {
      if (!isDrawing.current) return;
      const pos = getPos(e);
      if (!pos) return;
      setStrokes((prev) => {
        const last = prev[prev.length - 1];
        if (!last) return prev;
        const updated = { ...last, points: [...last.points, pos.x, pos.y] };
        return [...prev.slice(0, -1), updated];
      });
    };

    const handlePointerUp = () => {
      isDrawing.current = false;
    };

    // In sequential mode, determine how many hints to show:
    // - If autoPlayStrokeIndex >= 0, use that (auto-play mode, independent of user drawing)
    // - Otherwise, based on user's drawn strokes (strokes.length)
    const effectiveHintCount = useMemo(() => {
      if (!showHint) return 0;
      if (hintMode === "all-at-once") return hintPaths.length;
      // sequential mode
      if (autoPlayStrokeIndex >= 0) return autoPlayStrokeIndex + 1;
      return strokes.length + 1;
    }, [showHint, hintMode, autoPlayStrokeIndex, strokes.length, hintPaths.length]);


    // Scoring overlay: show all ref strokes color-coded
    const showScoringOverlay = !!scoreResult && scoreResult.strokeCountExpected > 0;

    // Start dot for the next stroke the user should draw.
    // Always visible (regardless of showHint) when there are still reference strokes to learn.
    // Based on strokes.length: dot shows where the (strokes.length)-th reference stroke starts.
    // When user draws the stroke, strokes.length increments, and the dot moves to the next stroke.
    const nextRefStrokeIndex = strokes.length;
    const showStartDot = !showScoringOverlay && nextRefStrokeIndex < hintPaths.length;
    const { scale: boardScale, offset: boardOffset } = getTransform(width);
    const startDotPos = showStartDot
      ? (() => {
          const pts = getPathPoints(hintPaths[nextRefStrokeIndex]);
          return { x: pts[0] * boardScale + boardOffset, y: pts[1] * boardScale + boardOffset };
        })()
      : null;

    // Color for scoring overlay
    const getStrokeColor = (refIndex: number): string => {
      if (!showScoringOverlay) return "#f4a3b7";
      const strokeResult = scoreResult!.strokes?.find((s: any) => s.strokeIndex === refIndex);
      if (!strokeResult) return "#f97316"; // orange - missing
      if (strokeResult.passed) return "#22c55e"; // green - correct
      return "#ef4444"; // red - wrong
    };

    // Determine if a user stroke is "extra" (scoring mode)
    const getUserStrokeColor = (userStrokeIndex: number): string | null => {
      if (!showScoringOverlay || !scoreResult?.extraStrokes) return null;
      if (scoreResult.extraStrokes.includes(userStrokeIndex)) return "#3b82f6"; // blue - extra
      return null;
    };

    // Determine which ref strokes to show in all-at-once hint mode
    // (shown as semi-transparent pink behind the user's strokes)
    const renderHintStrokes = () => {
      if (showScoringOverlay) {
        // In scoring mode, show all ref strokes color-coded (no animation)
        return hintPaths.map((d, refIdx) => (
          <DrawPathEffect
            key={`score-${refIdx}`}
            d={d}
            stroke={getStrokeColor(refIdx)}
            strokeWidth={3}
            opacity={0.85}
            strokeDurationMs={0}
            boardWidth={width}
          />
        ));
      }

      if (!showHint) return null;

      if (hintMode === "all-at-once") {
        // Show all hint paths simultaneously, no animation
        return hintPaths.map((d, idx) => (
          <DrawPathEffect
            key={`hint-${idx}`}
            d={d}
            stroke="#f4a3b7"
            strokeWidth={3}
            opacity={0.7}
            strokeDurationMs={0}
            boardWidth={width}
          />
        ));
      }

      // Sequential mode: show effectiveHintCount hints, with animation on the last one
      const lastIdx = effectiveHintCount - 1;
      return hintPaths.slice(0, effectiveHintCount).map((d, idx) => {
        const isAnimating = idx === lastIdx;
        return (
          <DrawPathEffect
            key={`hint-${idx}`}
            d={d}
            stroke="#f4a3b7"
            strokeWidth={3}
            opacity={0.7}
            strokeDurationMs={isAnimating ? strokeDurationMs : 0}
            boardWidth={width}
          />
        );
      });
    };

    return (
      <div className="flex flex-col items-center gap-1">
        <div className="relative bg-white rounded-2xl border-2 border-rose-200 shadow-inner overflow-hidden">
          <svg
            className="absolute inset-0 pointer-events-none w-full h-full"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
          >
            {/* Vertical center line (dashed) */}
            <line x1={width / 2} y1={0} x2={width / 2} y2={height} stroke="#d1d5db" strokeWidth={1} strokeDasharray="4 4" />
            {/* Horizontal center line (dashed) */}
            <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="#d1d5db" strokeWidth={1} strokeDasharray="4 4" />
            {/* Diagonal top-left to bottom-right (dashed) */}
            <line x1={0} y1={0} x2={width} y2={height} stroke="#d1d5db" strokeWidth={1} strokeDasharray="4 4" />
            {/* Diagonal top-right to bottom-left (dashed) */}
            <line x1={width} y1={0} x2={0} y2={height} stroke="#d1d5db" strokeWidth={1} strokeDasharray="4 4" />
          </svg>
          <Stage
            ref={stageRef}
            width={width}
            height={height}
            onMouseDown={handlePointerDown}
            onMousemove={handlePointerMove}
            onMouseup={handlePointerUp}
            onMouseleave={handlePointerUp}
            onTouchStart={(e: any) => {
              const pos = getPos(e);
              if (pos) {
                isDrawing.current = true;
                setStrokes((prev) => [...prev, { points: [pos.x, pos.y] }]);
              }
            }}
            onTouchMove={(e: any) => {
              e.evt.preventDefault();
              handlePointerMove(e);
            }}
            onTouchend={handlePointerUp}
            className="relative z-10 cursor-crosshair"
          >
            <Layer>
              {renderHintStrokes()}

              {/* User's drawn strokes */}
              {strokes.map((stroke, i) => {
                const extraColor = getUserStrokeColor(i);
                return (
                  <Line
                    key={`draw-${i}`}
                    points={stroke.points}
                    stroke={extraColor || "#333"}
                    strokeWidth={extraColor ? 5 : 4}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    globalCompositeOperation="source-over"
                  />
                );
              })}

              {/* Start dot for next stroke (sequential mode only) */}
              {startDotPos && (
                <Circle
                  x={startDotPos.x}
                  y={startDotPos.y}
                  radius={4}
                  fill="#ef4444"
                  opacity={0.4}
                  globalCompositeOperation="source-over"
                />
              )}
            </Layer>
          </Stage>
        </div>
      </div>
    );
  },
);

PracticeBoard.displayName = "PracticeBoard";

export default PracticeBoard;