import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import * as api from "../../api";
import { BookOpen, Undo2, Redo2, Eye, EyeOff, Check, ChevronLeft, ChevronRight, Play, Pause, Eraser } from "lucide-react";
import { loadKanjiIndex } from "../../utils/kanjiIndex";
import { PracticeBoard } from "../../components/PracticeBoard";
import type { PracticeBoardHandle, HintMode } from "../../components/PracticeBoard";
import type { Topic } from "../../model";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type PracticeChar = {
  char: string;
  hasKanjiVG: boolean;
};

type Stroke = {
  points: number[];
  charIndex: number;
};

/* ------------------------------------------------------------------ */
/*  Types cho kết quả chấm điểm (định nghĩa ở module level)            */
/* ------------------------------------------------------------------ */
type ReferenceStroke = {
  points: number[];
  pathD: string;
};

type StrokeCheckResult = {
  strokeIndex: number;
  matchedUserIndex: number | null;
  startOk: boolean;
  endOk: boolean;
  directionOk: boolean;
  startDistance: number;
  endDistance: number;
  passed: boolean;
  errors: string[];
};

type CharScoreResult = {
  char: string;
  strokeCountExpected: number;
  strokeCountDrawn: number;
  strokeCountMatch: boolean;
  orderCorrect: boolean;
  strokes: StrokeCheckResult[];
  overallScore: number;
  passed: boolean;
  feedback: string[];
  extraStrokes: number[];
};

/* ------------------------------------------------------------------ */
/*  Hook to determine which characters have KanjiVG data               */
/* ------------------------------------------------------------------ */
const useKanjiIndexMap = () => {
  const [kanjiSet, setKanjiSet] = useState<Set<string> | null>(null);

  useEffect(() => {
    loadKanjiIndex()
      .then((index) => setKanjiSet(new Set(Object.keys(index))))
      .catch(() => setKanjiSet(new Set()));
  }, []);

  return kanjiSet;
};

const splitWordIntoChars = (word: string | undefined, kanjiSet: Set<string> | null): PracticeChar[] => {
  if (!word) return [];
  return Array.from(word).map((char) => ({
    char,
    hasKanjiVG: kanjiSet ? kanjiSet.has(char) : false,
  }));
};

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export const PracticeWritePage = () => {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const location = useLocation();
  const state = location.state as { topic?: Topic} | null;

  const [topic, setTopic] = useState<Topic | null>(null);

  useEffect(() => {
    if (!topicId) {
      setTopic(null);
      return;
    }

    // First priority: data passed via location.state
    if (state?.topic) {
      setTopic(state.topic);
      return;
    }

    // Fallback: call API to fetch topic by ID
    const fetchTopic = async () => {
      try {
        const response = await api.getTopicById(topicId);
        setTopic(response.data);
      } catch (error) {
        console.error("Failed to fetch topic:", error);
        setTopic(null);
      } 
    };
    fetchTopic();
  }, [topicId, state?.topic]);

  const kanjiSet = useKanjiIndexMap();

  const [wordIndex, setWordIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [scoreResults, setScoreResults] = useState<CharScoreResult[] | null>(null);
  const [hintMode] = useState<HintMode>("sequential");

  const currentWord = topic?.words[wordIndex];
  const totalWords = topic?.words.length || 0;

  const chars = splitWordIntoChars(currentWord?.text, kanjiSet);
  const practiceChars = chars.filter((c) => c.hasKanjiVG);
  const totalChars = practiceChars.length;

  // Refs to each PracticeBoard for undo/redo/clear
  const boardRefs = useRef<(PracticeBoardHandle | null)[]>([]);
  boardRefs.current = boardRefs.current.slice(0, totalChars);

  useEffect(() => {
    setScoreResults(null);
  }, [wordIndex, currentWord?.text]);

  const handleUndo = useCallback(() => {
    // Find the last non-empty board and undo on it
    for (let i = totalChars - 1; i >= 0; i--) {
      const board = boardRefs.current[i];
      if (board && board.getStrokeCount() > 0) {
        board.undo();
        return;
      }
    }
  }, [totalChars]);

  const handleRedo = useCallback(() => {
    // Redo on the first board that has strokes available (redo stack per board)
    // Since we can't access internal redo stacks, just call redo on the last board
    for (let i = totalChars - 1; i >= 0; i--) {
      const board = boardRefs.current[i];
      if (board) {
        board.redo();
        return;
      }
    }
  }, [totalChars]);

  const handleClear = useCallback(() => {
    boardRefs.current.forEach((board) => board?.clear());
    setScoreResults(null);
  }, []);

  // Collect strokes from all boards for scoring
  const collectStrokes = useCallback((): Stroke[] => {
    const allStrokes: Stroke[] = [];
    boardRefs.current.forEach((board, charIdx) => {
      if (board) {
        const boardStrokes = board.getStrokes();
        boardStrokes.forEach((stroke) => {
          allStrokes.push({ points: stroke.points, charIndex: charIdx });
        });
      }
    });
    return allStrokes;
  }, []);

  /* ---------- Sequential hint playback ---------- */
  const [charStrokeCounts, setCharStrokeCounts] = useState<number[]>([]);
  const [globalStrokeIndex, setGlobalStrokeIndex] = useState(0);
  const [playbackActive, setPlaybackActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalStrokes = charStrokeCounts.reduce((a, b) => a + b, 0);

  useEffect(() => {
    setCharStrokeCounts(Array(totalChars).fill(0));
    setGlobalStrokeIndex(0);
    setPlaybackActive(false);
  }, [wordIndex, currentWord?.text, totalChars]);

  // Duration for each stroke drawing animation (ms)
  const strokeDuration = 800;

  useEffect(() => {
    if (playbackActive && totalStrokes > 0) {
      timerRef.current = setInterval(() => {
        setGlobalStrokeIndex((prev) => {
          if (prev >= totalStrokes) {
            clearInterval(timerRef.current!);
            setPlaybackActive(false);
            return totalStrokes;
          }
          return prev + 1;
        });
      }, strokeDuration);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playbackActive, totalStrokes]);

  const toggleHint = () => {
    const newShow = !showHint;
    setShowHint(newShow);
    if (newShow) {
      setGlobalStrokeIndex(1);
      setPlaybackActive(true);
    } else {
      setPlaybackActive(false);
      setGlobalStrokeIndex(0);
    }
  };

  const goNext = () => {
    setWordIndex((i) => Math.min(i + 1, totalWords - 1));
    setShowHint(false);
    setPlaybackActive(false);
    setGlobalStrokeIndex(0);
    setScoreResults(null);
  };

  const goPrev = () => {
    setWordIndex((i) => Math.max(i - 1, 0));
    setShowHint(false);
    setPlaybackActive(false);
    setGlobalStrokeIndex(0);
    setScoreResults(null);
  };

  // Map charIndex -> scoreResult để truyền vào từng PracticeBoard
  const scoreResultByCharIndex = useMemo(() => {
    const map = new Map<number, CharScoreResult>();
    if (scoreResults) {
      practiceChars.forEach((_, idx) => {
        if (scoreResults[idx]) map.set(idx, scoreResults[idx]);
      });
    }
    return map;
  }, [scoreResults, practiceChars]);

  const handleStrokeCountChange = useCallback((charIndex: number, count: number) => {
    setCharStrokeCounts((prev) => {
      if (prev[charIndex] === count) return prev;
      const next = [...prev];
      next[charIndex] = count;
      return next;
    });
  }, []);

  /* ---------- Scoring / Check logic ---------- */
  /* ------------------------------------------------------------------ */
  /*  Hằng số phải khớp với transform dùng khi render hint (DrawPathEffect) */
  /* ------------------------------------------------------------------ */
  const HINT_OFFSET_X = 14;
  const HINT_OFFSET_Y = 14;
  const HINT_SCALE = 1.6;

  /* ------------------------------------------------------------------ */
  /*  Hidden SVG để đo path (tái dùng nếu bạn đã có getHiddenSvg ở trên) */
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

  /* ------------------------------------------------------------------ */
  /*  Cache SVG text theo file, tránh fetch lại mỗi lần bấm "Kiểm tra"   */
  /* ------------------------------------------------------------------ */
  const refSvgCache = new Map<string, string>();

  const fetchKanjiSvgText = async (fileName: string): Promise<string> => {
    const cached = refSvgCache.get(fileName);
    if (cached) return cached;
    const res = await fetch(`/kanjivg/kanji/${fileName}`);
    if (!res.ok) throw new Error("fetch failed");
    const text = await res.text();
    refSvgCache.set(fileName, text);
    return text;
  };

  /* ------------------------------------------------------------------ */
  /*  Parse + sample các nét chuẩn, transform sang canvas space          */
  /* ------------------------------------------------------------------ */
  const parseRefStrokes = (svgText: string): ReferenceStroke[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");
    const paths = doc.querySelectorAll("path");
    const svg = getHiddenSvg();
    const refStrokes: ReferenceStroke[] = [];
    const sampleCount = 80;

    paths.forEach((path) => {
      const d = path.getAttribute("d");
      if (!d) return;

      const pathEl = document.createElementNS(SVG_NS, "path");
      pathEl.setAttribute("d", d);
      svg.appendChild(pathEl);

      const len = pathEl.getTotalLength();
      if (!len || len <= 0) {
        svg.removeChild(pathEl);
        return;
      }

      const pts: number[] = [];
      for (let i = 0; i <= sampleCount; i++) {
        const p = pathEl.getPointAtLength((len * i) / sampleCount);
        // Transform về cùng hệ toạ độ với canvas (giống transform khi render hint)
        pts.push(p.x * HINT_SCALE + HINT_OFFSET_X, p.y * HINT_SCALE + HINT_OFFSET_Y);
      }

      svg.removeChild(pathEl);
      refStrokes.push({ points: pts, pathD: d });
    });

    return refStrokes;
  };

  /* ------------------------------------------------------------------ */
  /*  Helper hình học                                                    */
  /* ------------------------------------------------------------------ */
  const dist = (x1: number, y1: number, x2: number, y2: number) =>
    Math.hypot(x2 - x1, y2 - y1);

  const getEndpoints = (points: number[]) => {
    const n = points.length / 2;
    return {
      start: { x: points[0], y: points[1] },
      end: { x: points[(n - 1) * 2], y: points[(n - 1) * 2 + 1] },
    };
  };

  const directionVector = (points: number[]) => {
    const { start, end } = getEndpoints(points);
    return { x: end.x - start.x, y: end.y - start.y };
  };

  const normalize = (v: { x: number; y: number }) => {
    const len = Math.hypot(v.x, v.y) || 1;
    return { x: v.x / len, y: v.y / len };
  };

  /* ------------------------------------------------------------------ */
  /*  Ghép mỗi nét user vẽ với nét chuẩn gần nhất (chưa bị ghép)         */
  /* ------------------------------------------------------------------ */
  const matchUserStrokeToRef = (
    userPoints: number[],
    refStrokes: ReferenceStroke[],
    usedRefIndices: Set<number>,
  ): number => {
    const userEnds = getEndpoints(userPoints);
    let bestIdx = -1;
    let bestCost = Infinity;

    refStrokes.forEach((ref, idx) => {
      if (usedRefIndices.has(idx)) return;
      const refEnds = getEndpoints(ref.points);
      const cost =
        dist(userEnds.start.x, userEnds.start.y, refEnds.start.x, refEnds.start.y) +
        dist(userEnds.end.x, userEnds.end.y, refEnds.end.x, refEnds.end.y);
      if (cost < bestCost) {
        bestCost = cost;
        bestIdx = idx;
      }
    });

    return bestIdx;
  };

  /* ------------------------------------------------------------------ */
  /*  Chấm điểm một ký tự                                                 */
  /* ------------------------------------------------------------------ */
  const scoreCharacter = (
    userStrokesRaw: Stroke[],
    refStrokes: ReferenceStroke[],
    startEndThresholdPx: number = 45,
    directionCosThreshold: number = -0.2,
  ): CharScoreResult => {
    const userStrokes = userStrokesRaw.map((s) => s.points);
    const usedRefIndices = new Set<number>();
    const matches: { userIdx: number; refIdx: number }[] = [];

    // 1) Ghép từng nét user (theo thứ tự họ vẽ) với nét chuẩn gần nhất còn trống
    userStrokes.forEach((pts, userIdx) => {
      const refIdx = matchUserStrokeToRef(pts, refStrokes, usedRefIndices);
      if (refIdx !== -1) {
        usedRefIndices.add(refIdx);
        matches.push({ userIdx, refIdx });
      }
    });

    // 2) Chấm từng nét chuẩn dựa trên cặp ghép được (nếu có)
    const strokeResults: StrokeCheckResult[] = refStrokes.map((ref, refIdx) => {
      const match = matches.find((m) => m.refIdx === refIdx);

      if (!match) {
        return {
          strokeIndex: refIdx,
          matchedUserIndex: null,
          startOk: false,
          endOk: false,
          directionOk: false,
          startDistance: Infinity,
          endDistance: Infinity,
          passed: false,
          errors: [`Thiếu nét số ${refIdx + 1}`],
        };
      }

      const userPts = userStrokes[match.userIdx];
      const userEnds = getEndpoints(userPts);
      const refEnds = getEndpoints(ref.points);

      const startDistance = dist(userEnds.start.x, userEnds.start.y, refEnds.start.x, refEnds.start.y);
      const endDistance = dist(userEnds.end.x, userEnds.end.y, refEnds.end.x, refEnds.end.y);
      const startOk = startDistance <= startEndThresholdPx;
      const endOk = endDistance <= startEndThresholdPx;

      const userDir = normalize(directionVector(userPts));
      const refDir = normalize(directionVector(ref.points));
      const dot = userDir.x * refDir.x + userDir.y * refDir.y;
      const directionOk = dot >= directionCosThreshold;

      const errors: string[] = [];
      if (!startOk) errors.push(`Nét ${refIdx + 1}: điểm bắt đầu lệch ${Math.round(startDistance)}px so với chuẩn`);
      if (!endOk) errors.push(`Nét ${refIdx + 1}: điểm kết thúc lệch ${Math.round(endDistance)}px so với chuẩn`);
      if (!directionOk) errors.push(`Nét ${refIdx + 1}: viết ngược chiều`);

      return {
        strokeIndex: refIdx,
        matchedUserIndex: match.userIdx,
        startOk,
        endOk,
        directionOk,
        startDistance,
        endDistance,
        passed: startOk && endOk && directionOk,
        errors,
      };
    });

    // 3) Check thứ tự
    const sortedByUserIdx = [...matches].sort((a, b) => a.userIdx - b.userIdx);
    let orderCorrect = true;
    for (let i = 1; i < sortedByUserIdx.length; i++) {
      if (sortedByUserIdx[i].refIdx < sortedByUserIdx[i - 1].refIdx) {
        orderCorrect = false;
        break;
      }
    }

    const strokeCountExpected = refStrokes.length;
    const strokeCountDrawn = userStrokes.length;
    const strokeCountMatch = strokeCountExpected === strokeCountDrawn;

    const passedStrokes = strokeResults.filter((s) => s.passed).length;
    const baseScore = strokeCountExpected > 0 ? (passedStrokes / strokeCountExpected) * 100 : 0;
    const overallScore = Math.max(
      0,
      Math.round(baseScore - (orderCorrect ? 0 : 20) - (strokeCountMatch ? 0 : 10)),
    );

    const feedback: string[] = [];
    if (!strokeCountMatch) {
      feedback.push(
        strokeCountDrawn < strokeCountExpected
          ? `Thiếu nét: cần ${strokeCountExpected} nét, mới viết ${strokeCountDrawn} nét`
          : `Dư nét: cần ${strokeCountExpected} nét, đã viết ${strokeCountDrawn} nét`,
      );
    }
    if (!orderCorrect) feedback.push("Sai thứ tự nét");
    strokeResults.forEach((s) => feedback.push(...s.errors));

    const passed = strokeCountMatch && orderCorrect && strokeResults.every((s) => s.passed);

    return {
      char: "",
      strokeCountExpected,
      strokeCountDrawn,
      strokeCountMatch,
      orderCorrect,
      strokes: strokeResults,
      overallScore,
      passed,
      feedback,
      extraStrokes: [],
    };
  };

  /* ------------------------------------------------------------------ */
  /*  handleCheck                                                        */
  /* ------------------------------------------------------------------ */
  const handleCheck = useCallback(async () => {
    if (practiceChars.length === 0) return;

    const allStrokes = collectStrokes();

    const strokesByChar: Stroke[][] = Array.from({ length: practiceChars.length }, () => []);
    for (const s of allStrokes) {
      if (s.charIndex < strokesByChar.length) {
        strokesByChar[s.charIndex].push(s);
      }
    }

    const results = await Promise.all(
      practiceChars.map(async (pc, idx): Promise<CharScoreResult> => {
        const codePoint = pc.char.codePointAt(0);
        const hex = codePoint !== undefined ? codePoint.toString(16).padStart(5, "0") : null;

        if (!hex) {
          return {
            char: pc.char,
            strokeCountExpected: 0,
            strokeCountDrawn: strokesByChar[idx].length,
            strokeCountMatch: false,
            orderCorrect: false,
            strokes: [],
            overallScore: 0,
            passed: false,
            feedback: ["Không tìm thấy dữ liệu KanjiVG"],
            extraStrokes: [],
          };
        }

        try {
          const svgText = await fetchKanjiSvgText(`${hex}.svg`);
          const refStrokes = parseRefStrokes(svgText);
          const result = scoreCharacter(strokesByChar[idx], refStrokes, 30, 0);
          result.char = pc.char;
          return result;
        } catch {
          return {
            char: pc.char,
            strokeCountExpected: 0,
            strokeCountDrawn: strokesByChar[idx].length,
            strokeCountMatch: false,
            orderCorrect: false,
            strokes: [],
            overallScore: 0,
            passed: false,
            feedback: ["Lỗi khi tải dữ liệu KanjiVG"],
            extraStrokes: [],
          };
        }
      }),
    );

    setScoreResults(results);
  }, [practiceChars, collectStrokes]);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full px-4">
      {/* Header */}
      <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white via-rose-50/30 to-amber-50/20 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-rose-500/80 font-medium">
              Luyện viết · Practice Writing
            </span>
            <h2 className="text-3xl md:text-4xl font-display text-start">
              Luyện viết Kanji
            </h2>
            {topic?.name && (
              <p className="text-sm text-rose-500 font-medium">
                Bộ từ vựng: {topic?.name}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-xs uppercase tracking-wider text-rose-600 hover:text-rose-700 font-medium px-3 py-2 rounded-full border border-rose-200 hover:bg-rose-50 transition-colors"
          >
            ← Quay lại
          </button>
        </div>
      </div>

      {totalWords === 0 ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-8 text-center">
          <BookOpen size={40} className="text-rose-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Không có từ vựng để luyện viết</p>
          <p className="text-sm text-gray-400 mt-1">
            Vui lòng chọn một bộ từ vựng từ danh sách từ vựng.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md hover:shadow-lg transition-all"
          >
            ← Quay lại
          </button>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 grid place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white text-sm font-bold shadow-sm">
                {String(wordIndex + 1).padStart(2, "0")}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-wider">
                  Tiến độ
                </span>
                <span className="text-sm font-semibold text-gray-700">
                  Đang luyện tới từ thứ {wordIndex + 1} / {totalWords}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={goPrev}
                disabled={wordIndex === 0}
                className="p-2 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goNext}
                disabled={wordIndex === totalWords - 1}
                className="p-2 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Meaning */}
          <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/30 p-5 shadow-sm text-center">
            <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
              Nghĩa tiếng Việt
            </span>
            <span className="text-2xl font-semibold text-gray-800">
              {currentWord?.meaning}
            </span>
          </div>

          {/* Drawing area */}
          {practiceChars.length > 0 && (
            <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col items-center gap-4">
                <span className="text-xs text-gray-400 uppercase tracking-wider">
                  Viết từng chữ
                </span>
                <div className="flex flex-wrap justify-center gap-4">
                  {practiceChars.map((pc, idx) => {
                    // Compute auto-play stroke index for this char based on globalStrokeIndex
                    let strokesBefore = 0;
                    for (let i = 0; i < idx; i++) {
                      strokesBefore += charStrokeCounts[i] || 0;
                    }
                    const autoPlayIdx = showHint && hintMode === "sequential" && globalStrokeIndex > strokesBefore
                      ? globalStrokeIndex - strokesBefore - 1
                      : -1;
                    return (
                      <PracticeBoard
                        key={idx}
                        ref={(el) => { boardRefs.current[idx] = el; }}
                        char={pc.char}
                        hintMode={hintMode}
                        showHint={showHint}
                        width={200}
                        height={200}
                        strokeDurationMs={strokeDuration}
                        scoreResult={scoreResultByCharIndex.get(idx) || null}
                        onStrokeCountChange={(count) => handleStrokeCountChange(idx, count)}
                        autoPlayStrokeIndex={autoPlayIdx}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={handleUndo}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-rose-200 text-rose-700 bg-white hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <Undo2 size={15} />
                    Undo
                  </button>
                  <button
                    onClick={handleRedo}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-rose-200 text-rose-700 bg-white hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <Redo2 size={15} />
                    Redo
                  </button>
                  <button
                    onClick={handleClear}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-all"
                  >
                    <Eraser size={15} />
                    Xoá
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Shared toolbar */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={toggleHint}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border transition-all ${showHint
                ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                }`}
            >
              {showHint ? <EyeOff size={17} /> : <Eye size={17} />}
              {showHint ? "Ẩn gợi ý" : "Gợi ý nét"}
            </button>
            {showHint && hintMode === "sequential" && totalStrokes > 0 && globalStrokeIndex < totalStrokes && (
              <button
                onClick={() => setPlaybackActive((p) => !p)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border border-amber-200 bg-white text-amber-700 hover:bg-amber-50 transition-all"
              >
                {playbackActive ? <Pause size={17} /> : <Play size={17} />}
                {playbackActive ? "Tạm dừng" : "Tự động"}
              </button>
            )}
            <button
              onClick={handleCheck}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md hover:shadow-lg transition-all"
            >
              <Check size={17} />
              Kiểm tra
            </button>
          </div>
          {/* Score results */}
          {scoreResults && scoreResults.length > 0 && (
            <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm space-y-3">
              {scoreResults.map((r, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 ${r.passed ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">{r.char}</span>
                    <span
                      className={`text-sm font-bold ${r.passed ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {r.passed ? "✓ Đúng" : "✗ Sai"} 
                    </span>
                  </div>
                  {!r.passed && r.feedback.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-0.5">
                      {r.feedback.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};