import { useState, useEffect, useCallback, useRef, useMemo, type ReactNode } from "react";
import { Eye, EyeOff, X, Undo2, Redo2, Eraser } from "lucide-react";

import { loadKanjiIndex, useKanjiVG } from "../utils";
import { type PracticeBoardHandle, PracticeBoard } from "./PracticeBoard";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export type FlashcardSettings = {
  displayOrder: "word-first" | "meaning-first";
  strokeSpeed: "slow" | "fast" | "skip";
  enableWritingPractice: boolean;
};

export type FlashcardAccent = "rose" | "indigo";

export type FlashcardRenderFn<T> = (item: T, settings: FlashcardSettings, strokeDuration: number, charStartIndices: number[], isFlipped: boolean, animVersion: number) => {
  front: ReactNode;
  back: ReactNode;
};

export type FlashcardProps<T> = {
  item: T | null;
  accent: FlashcardAccent;
  renderFrontBack: FlashcardRenderFn<T>;
  getCharForStroke: (item: T) => string;
  settings: FlashcardSettings;
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
export const STROKE_DURATIONS = {
  slow: 1200,
  fast: 500,
  skip: 0,
};

const HINT_OFFSET_X = 14;
const HINT_OFFSET_Y = 14;
const HINT_SCALE = 1.6;

/* ------------------------------------------------------------------ */
/*  Hidden SVG for path measurement                                    */
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
const samplePathPoints = (d: string): number[] => {
  const svg = getHiddenSvg();
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", d);
  svg.appendChild(path);

  let len = path.getTotalLength();
  if (!len || len <= 0) len = 1;

  const pts: number[] = [];
  for (let i = 0; i <= SAMPLE_COUNT; i++) {
    const dist = (len * i) / SAMPLE_COUNT;
    const p = path.getPointAtLength(dist);
    pts.push(p.x, p.y);
  }

  svg.removeChild(path);
  return pts;
};

const pathPointsCache = new Map<string, number[]>();
const getPathPoints = (d: string): number[] => {
  let pts = pathPointsCache.get(d);
  if (!pts) {
    pts = samplePathPoints(d);
    pathPointsCache.set(d, pts);
  }
  return pts;
};

/* ------------------------------------------------------------------ */
/*  DrawPathEffect - animated stroke drawing                          */
/* ------------------------------------------------------------------ */
type DrawPathEffectProps = {
  d: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  strokeDurationMs: number;
  delayMs?: number;
};

const DrawPathEffect = ({ d, stroke, strokeWidth, opacity, strokeDurationMs, delayMs = 0 }: DrawPathEffectProps) => {
  const allPoints = getPathPoints(d);
  const totalSamples = allPoints.length / 2;
  const [visibleSamples, setVisibleSamples] = useState(1);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setVisibleSamples(1);
    if (strokeDurationMs === 0) {
      setVisibleSamples(totalSamples);
      return;
    }

    timerRef.current = setTimeout(() => {
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
    }, delayMs);

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [d, strokeDurationMs, totalSamples, delayMs]);

  const visiblePoints = allPoints.slice(0, visibleSamples * 2);

  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      className="absolute inset-0"
    >
      <polyline
        points={visiblePoints.map((p, i) => `${p * HINT_SCALE + HINT_OFFSET_X},${visiblePoints[i + 1] * HINT_SCALE + HINT_OFFSET_Y}`).filter((_, i) => i % 2 === 0).join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/*  InlineKanjiChar - renders a single char as animated kanji or text  */
/* ------------------------------------------------------------------ */
type InlineKanjiCharProps = {
  char: string;
  strokeDurationMs: number;
  className?: string;
  charStartIndex?: number;
};

const InlineKanjiChar = ({ char, strokeDurationMs, className = "", charStartIndex = 0 }: InlineKanjiCharProps) => {
  const hintPaths = useKanjiPathsForChar(char);
  const hasKanjiData = hintPaths.length > 0;

  if (!hasKanjiData) {
    return <span className={className}>{char}</span>;
  }

  return (
    <span className={`inline-block relative ${className}`} style={{ width: "1.5em", height: "2em" }}>
      <svg
        width="200%"
        height="100%"
        viewBox="0 0 200 200"
        className="absolute inset-0"
        style={{ overflow: "visible", left: "-50%" }}
      >
        {hintPaths.map((d, i) => (
          <DrawPathEffect
            key={i}
            d={d}
            stroke="currentColor"
            strokeWidth={12}
            opacity={1}
            strokeDurationMs={strokeDurationMs}
            delayMs={(charStartIndex + i) * strokeDurationMs}
          />
        ))}
      </svg>
    </span>
  );
};

/* ------------------------------------------------------------------ */
/*  Hook to load KanjiVG paths for a single character                  */
/* ------------------------------------------------------------------ */
const useKanjiPathsForChar = (char: string | undefined): string[] => {
  const codePoint = char?.codePointAt(0);
  const hex = codePoint !== undefined ? codePoint.toString(16).padStart(5, "0") : null;
  return useKanjiVG(hex ? `${hex}.svg` : null);
};

/* ------------------------------------------------------------------ */
/*  Hook to get stroke count for a single character                    */
/* ------------------------------------------------------------------ */
const useStrokeCountForChar = (char: string | undefined): number => {
  const paths = useKanjiPathsForChar(char);
  return paths.length;
};

/* ------------------------------------------------------------------ */
/*  Hook to determine which characters have KanjiVG data               */
/* ------------------------------------------------------------------ */
export const useKanjiIndexMap = () => {
  const [kanjiSet, setKanjiSet] = useState<Set<string> | null>(null);

  useEffect(() => {
    loadKanjiIndex()
      .then((index) => setKanjiSet(new Set(Object.keys(index))))
      .catch(() => setKanjiSet(new Set()));
  }, []);

  return kanjiSet;
};

/* ------------------------------------------------------------------ */
/*  Writing Practice Panel                                             */
/* ------------------------------------------------------------------ */
type WritingPracticePanelProps = {
  chars: string[];
  visible: boolean;
  onToggle: () => void;
};

const WritingPracticePanel = ({ chars, visible, onToggle }: WritingPracticePanelProps) => {
  const kanjiSet = useKanjiIndexMap();
  const [showHint, setShowHint] = useState(true);

  const practiceChars = chars.filter((c) => kanjiSet?.has(c) || false);

  // Refs for each PracticeBoard
  const boardRefs = useRef<(PracticeBoardHandle | null)[]>([]);

  // Reset when chars change
  useEffect(() => {
    setShowHint(true);
    boardRefs.current = [];
  }, [chars.join("")]);

  const toggleHint = () => {
    setShowHint((prev) => !prev);
  };

  const handleUndo = () => {
    for (const ref of boardRefs.current) {
      ref?.undo();
    }
  };

  const handleRedo = () => {
    for (const ref of boardRefs.current) {
      ref?.redo();
    }
  };

  const handleClear = () => {
    for (const ref of boardRefs.current) {
      ref?.clear();
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 w-[340px] bg-white rounded-3xl shadow-2xl border-2 border-rose-200 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-gray-800">Luyện viết</h4>
        <button
          onClick={onToggle}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {practiceChars.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap justify-center gap-3">
            {practiceChars.map((char, idx) => (
              <div key={`${char}-${idx}`}>
                <PracticeBoard
                  ref={(el) => { boardRefs.current[idx] = el; }}
                  char={char}
                  hintMode="all-at-once"
                  showHint={showHint}
                  width={200}
                  height={200}
                  strokeDurationMs={500}
                />
              </div>
            ))}
          </div>

          {/* Drawing toolbar */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={handleUndo}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border border-rose-200 text-rose-700 bg-white hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Undo2 size={14} />
              Undo
            </button>
            <button
              onClick={handleRedo}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border border-rose-200 text-rose-700 bg-white hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Redo2 size={14} />
              Redo
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-all"
            >
              <Eraser size={14} />
              Xoá
            </button>
            <button
              onClick={toggleHint}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all ${
                showHint
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
              }`}
            >
              {showHint ? <EyeOff size={14} /> : <Eye size={14} />}
              {showHint ? "Ẩn" : "Gợi ý"}
            </button>
          </div>
        </div>
      )}

      {practiceChars.length === 0 && (
        <p className="text-sm text-gray-400 text-center">Không có kanji để luyện viết</p>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Stroke Counter - calculates total strokes for a word               */
/*  Uses individual wrapper components to respect React hooks rules    */
/* ------------------------------------------------------------------ */
const SingleCharCounter = ({ char, onCount }: { char: string; onCount: (count: number) => void }) => {
  const count = useStrokeCountForChar(char);
  const hasReported = useRef(false);

  useEffect(() => {
    if (!hasReported.current) {
      hasReported.current = true;
      onCount(count);
    }
  }, [count, onCount]);

  return null;
};

const StrokeCounter = ({ word, onReady }: { word: string; onReady: (counts: number[]) => void }) => {
  const chars = Array.from(word || "");
  const countsRef = useRef<(number | undefined)[]>([]);
  const reportedCount = useRef(0);

  // Reset when word changes
  useEffect(() => {
    countsRef.current = [];
    reportedCount.current = 0;
  }, [word]);

  const handleCount = useCallback((index: number) => (count: number) => {
    countsRef.current[index] = count;
    reportedCount.current += 1;
    if (reportedCount.current >= chars.length) {
      onReady(countsRef.current.slice() as number[]);
    }
  }, [chars.length, onReady]);

  return (
    <>
      {chars.map((char, i) => (
        <SingleCharCounter key={i} char={char} onCount={handleCount(i)} />
      ))}
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Render a word string with animated kanji                           */
/* ------------------------------------------------------------------ */
export const renderWordWithKanji = (
  word: string | undefined,
  textClassName: string,
  strokeDuration: number,
  charStartIndices: number[],
  isFlipped: boolean,
  animVersion: number,
) => {
  if (!word) return null;
  const chars = Array.from(word);
  return (
    <div className={`text-center ${textClassName}`}>
      <div className="inline-flex flex-wrap justify-center gap-1">
        {chars.map((c, i) => (
          <InlineKanjiChar
            key={`${c}-${i}-${isFlipped}-${animVersion}`}
            char={c}
            strokeDurationMs={strokeDuration}
            className={textClassName}
            charStartIndex={charStartIndices[i] || 0}
          />
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Accent color helper                                               */
/* ------------------------------------------------------------------ */
const accentStyles: Record<FlashcardAccent, {
  border: string;
  bgGradient: string;
  text: string;
  btnGradient: string;
  border2: string;
}> = {
  rose: {
    border: "border-rose-100",
    bgGradient: "from-white via-rose-50/40 to-amber-50/30",
    text: "text-rose-500/80",
    btnGradient: "from-rose-500 to-rose-600",
    border2: "border-rose-200",
  },
  indigo: {
    border: "border-indigo-100",
    bgGradient: "from-white via-indigo-50/40 to-amber-50/30",
    text: "text-indigo-500/80",
    btnGradient: "from-indigo-500 to-indigo-600",
    border2: "border-indigo-200",
  },
};

/* ------------------------------------------------------------------ */
/*  Main Flashcard Component - chỉ nhận 1 item                        */
/* ------------------------------------------------------------------ */
export const Flashcard = <T,>({
  item,
  accent,
  renderFrontBack,
  getCharForStroke,
  settings,
}: FlashcardProps<T>) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showWritingPanel, setShowWritingPanel] = useState(true);
  const [strokeCounts, setStrokeCounts] = useState<number[]>([]);
  const [animVersion, setAnimVersion] = useState(0);

  // Reset flip and stroke animation when item changes
  useEffect(() => {
    setIsFlipped(false);
    setStrokeCounts([]);
    setAnimVersion((v) => v + 1);
  }, [item]);

  const handleStrokeCountsReady = useCallback((counts: number[]) => {
    setStrokeCounts(counts);
  }, []);

  const charStartIndices = useMemo(() => {
    const indices: number[] = [];
    let sum = 0;
    for (const count of strokeCounts) {
      indices.push(sum);
      sum += count;
    }
    return indices;
  }, [strokeCounts]);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const strokeDuration = STROKE_DURATIONS[settings.strokeSpeed];

  const { front: frontContent, back: backContent } = item
    ? renderFrontBack(item, settings, strokeDuration, charStartIndices, isFlipped, animVersion)
    : { front: null, back: null };

  const strokeWord = item ? getCharForStroke(item) : "";
  const practiceChars = strokeWord ? Array.from(strokeWord) : [];

  const a = accentStyles[accent];

  if (!item) return null;

  return (
    <div className="grow flex flex-col items-center justify-center gap-6 p-6 max-w-5xl mx-auto w-full">
      {strokeWord && (
        <StrokeCounter word={strokeWord} onReady={handleStrokeCountsReady} />
      )}
      <div
        onClick={handleFlip}
        className="relative w-full max-w-2xl aspect-[3/2] cursor-pointer perspective-1000"
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            className={`absolute inset-0 rounded-3xl border-2 ${a.border2} bg-gradient-to-br from-white to-rose-50/30 shadow-lg p-8 backface-hidden`}
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="h-full flex flex-col items-center justify-center">
              {frontContent}
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/40 to-white shadow-lg p-8 backface-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="h-full flex flex-col items-center justify-center">
              {backContent}
            </div>
          </div>
        </div>
      </div>

      {/* Hint */}
      <p className="text-sm text-gray-400">Nhấn vào thẻ để lật</p>

      {/* Writing Practice Panel */}
      {settings.enableWritingPractice && item && (
        <WritingPracticePanel
          chars={practiceChars}
          visible={showWritingPanel}
          onToggle={() => setShowWritingPanel((prev) => !prev)}
        />
      )}
    </div>
  );
};