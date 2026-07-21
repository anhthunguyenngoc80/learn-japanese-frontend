import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Sparkles, RotateCcw, Shuffle } from "lucide-react";
import { getPracticeWords } from "../../api";
import { Button } from "../../components/Button";
import { ALL_HIRAGANA, PATHS } from "../../constant";
import type { Word } from "../../model";

/* ────────────────────────────────────────────────────────────────── */
/*  Types                                                             */
/* ────────────────────────────────────────────────────────────────── */

/** Direction deltas [row, col] for the 8 possible directions */
const DIRECTIONS: [number, number][] = [
  [0, 1], // trái → phải
  [0, -1], // phải → trái
  [1, 0], // trên → dưới
  [-1, 0], // dưới → trên
  [1, 1], // chéo xuống phải
  [1, -1], // chéo xuống trái
  [-1, 1], // chéo lên phải
  [-1, -1], // chéo lên trái
];

interface PlacedWord {
  wordId: string;
  reading: string; // hiragana only
  meaning: string;
  text: string; // original kanji
  startRow: number;
  startCol: number;
  dirIdx: number;
  cells: [number, number][]; // all occupied cells
}

interface CellData {
  char: string;
  occupiedBy: string | null; // wordId if part of a word
  found: boolean; // true once the word is found
}

/* ────────────────────────────────────────────────────────────────── */
/*  Helpers                                                           */
/* ────────────────────────────────────────────────────────────────── */

function extractHiragana(s: string): string {
  return Array.from(s)
    .filter((ch) => /[\u3040-\u309F]/.test(ch))
    .join("");
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}


function randomHiragana(): string {
  return ALL_HIRAGANA[Math.floor(Math.random() * ALL_HIRAGANA.length)];
}

/**
 * Generate the search grid and place words.
 * Grid size is determined dynamically based on longest word + extra.
 */
function generateGrid(
  words: Word[],
  gridSize: number,
): {
  grid: CellData[][];
  placedWords: PlacedWord[];
} {
  // Build playable words (hiragana reading)
  const playable: { word: Word; reading: string }[] = [];
  for (const w of words) {
    const r = extractHiragana(w.reading || w.text || "");
    if (r.length >= 2 && r.length <= gridSize) {
      playable.push({ word: w, reading: r });
    }
  }

  if (playable.length === 0) {
    // Empty grid
    const empty: CellData[][] = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => ({
        char: randomHiragana(),
        occupiedBy: null,
        found: false,
      })),
    );
    return { grid: empty, placedWords: [] };
  }

  // Limit words to fit roughly 60-70% of grid cells to make it playable
  const maxWords = Math.min(
    playable.length,
    Math.floor((gridSize * gridSize) / 6),
  );
  const selected = shuffle(playable).slice(0, maxWords);

  const placed: PlacedWord[] = [];
  // Initialize empty grid
  const grid: (CellData | null)[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => null),
  );

  const canPlace = (
    reading: string,
    startRow: number,
    startCol: number,
    dirIdx: number,
  ): boolean => {
    const chars = Array.from(reading);
    for (let i = 0; i < chars.length; i++) {
      const r = startRow + DIRECTIONS[dirIdx][0] * i;
      const c = startCol + DIRECTIONS[dirIdx][1] * i;
      if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return false;
      if (grid[r][c] !== null) return false;
    }
    return true;
  };

  const place = (
    reading: string,
    wordId: string,
    startRow: number,
    startCol: number,
    dirIdx: number,
  ): PlacedWord => {
    const chars = Array.from(reading);
    const cells: [number, number][] = [];
    chars.forEach((ch, i) => {
      const r = startRow + DIRECTIONS[dirIdx][0] * i;
      const c = startCol + DIRECTIONS[dirIdx][1] * i;
      grid[r][c] = { char: ch, occupiedBy: wordId, found: false };
      cells.push([r, c]);
    });
    return {
      wordId,
      reading,
      meaning: "",
      text: "",
      startRow,
      startCol,
      dirIdx,
      cells,
    };
  };

  // Place each word
  for (const item of selected) {
    // Try random positions & directions up to 100 times
    let placedSuccess = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      const dirIdx = Math.floor(Math.random() * DIRECTIONS.length);
      const startRow = Math.floor(Math.random() * gridSize);
      const startCol = Math.floor(Math.random() * gridSize);
      if (canPlace(item.reading, startRow, startCol, dirIdx)) {
        const pw = place(
          item.reading,
          item.word.word_id,
          startRow,
          startCol,
          dirIdx,
        );
        pw.meaning = item.word.meaning;
        pw.text = item.word.text;
        placed.push(pw);
        placedSuccess = true;
        break;
      }
    }
    // If can't place after attempts, skip
    if (!placedSuccess) continue;
  }

  // Fill empty cells with random hiragana
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = { char: randomHiragana(), occupiedBy: null, found: false };
      }
    }
  }

  return { grid: grid as CellData[][], placedWords: placed };
}

/* ────────────────────────────────────────────────────────────────── */
/*  Page component                                                    */
/* ────────────────────────────────────────────────────────────────── */

const GRID_SIZE = 10; // 10x10 grid — good balance for word search

export const WordSearchGridPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState<{
    name: string;
    topic_id: string;
    words: Word[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Game state
  const [grid, setGrid] = useState<CellData[][] | null>(null);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
  const [foundWordIds, setFoundWordIds] = useState<Set<string>>(new Set());
  const [selectionStart, setSelectionStart] = useState<[number, number] | null>(
    null,
  );
  const [selectionEnd, setSelectionEnd] = useState<[number, number] | null>(
    null,
  );
  const [isSelecting, setIsSelecting] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [gridKey, setGridKey] = useState(0); // force re-mount

  const gridRef = useRef<HTMLDivElement>(null);

  /* ── Load topic data ── */
  useEffect(() => {
    if (!topicId) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getPracticeWords(topicId);
        if (!cancelled) {
          const data = response.data;
          const words = (data.words || []) as Word[];
          setTopic(data);

          // Generate grid
          const { grid: newGrid, placedWords: newPlaced } = generateGrid(
            words,
            GRID_SIZE,
          );
          setGrid(newGrid);
          setPlacedWords(newPlaced);
          setFoundWordIds(new Set());
          setSelectionStart(null);
          setSelectionEnd(null);
          setIsSelecting(false);
          setShowWinModal(false);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [topicId, gridKey]);

  /* ── Check if selection matches any word (in either direction) ── */
  const checkSelection = useCallback(() => {
    if (!selectionStart || !selectionEnd || !grid) return;

    const [r1, c1] = selectionStart;
    const [r2, c2] = selectionEnd;

    // Determine the cells in the selection line
    const dr = r2 - r1;
    const dc = c2 - c1;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));
    if (steps === 0) {
      // Single cell — not valid for a word
      setSelectionStart(null);
      setSelectionEnd(null);
      return;
    }

    // Must be a straight line (dr === 0, dc === 0, or |dr| === |dc|)
    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) {
      setSelectionStart(null);
      setSelectionEnd(null);
      return;
    }

    const sRow = dr / steps;
    const sCol = dc / steps;

    const selectedChars: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const r = r1 + sRow * i;
      const c = c1 + sCol * i;
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
        setSelectionStart(null);
        setSelectionEnd(null);
        return;
      }
      selectedChars.push(grid[r][c].char);
    }

    const selectedStr = selectedChars.join("");
    const selectedReversed = [...selectedChars].reverse().join("");

    // Check against all unfound placed words
    let matched: PlacedWord | null = null;
    for (const pw of placedWords) {
      if (foundWordIds.has(pw.wordId)) continue;
      if (pw.reading === selectedStr || pw.reading === selectedReversed) {
        matched = pw;
        break;
      }
    }

    if (matched) {
      // Correct! Mark cells as found
      const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
      for (const [r, c] of matched.cells) {
        newGrid[r][c].found = true;
      }
      setGrid(newGrid);
      const newFound = new Set(foundWordIds);
      newFound.add(matched.wordId);
      setFoundWordIds(newFound);

      // Check win
      if (newFound.size === placedWords.length) {
        setTimeout(() => setShowWinModal(true), 300);
      }
    }

    // Clear selection
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [selectionStart, selectionEnd, grid, placedWords, foundWordIds]);

  /* ── Mouse/Touch handlers for interactive selection ── */
  const handleCellMouseDown = useCallback((row: number, col: number) => {
    setSelectionStart([row, col]);
    setSelectionEnd([row, col]);
    setIsSelecting(true);
  }, []);

  const handleCellMouseEnter = useCallback(
    (row: number, col: number) => {
      if (!isSelecting) return;
      setSelectionEnd([row, col]);
    },
    [isSelecting],
  );

  const handleMouseUp = useCallback(() => {
    if (!isSelecting) return;
    setIsSelecting(false);
    checkSelection();
  }, [isSelecting, checkSelection]);

  // Touch handlers for mobile
  const handleTouchStart = useCallback(
    (row: number, col: number) => (e: React.TouchEvent) => {
      e.preventDefault();
      setSelectionStart([row, col]);
      setSelectionEnd([row, col]);
      setIsSelecting(true);
    },
    [],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (!isSelecting || !gridRef.current) return;

      const touch = e.touches[0];
      const rect = gridRef.current.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const cellSize = rect.width / GRID_SIZE;
      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);

      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        setSelectionEnd([row, col]);
      }
    },
    [isSelecting],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (!isSelecting) return;
      setIsSelecting(false);
      checkSelection();
    },
    [isSelecting, checkSelection],
  );

  /* ── Compute highlighted cells ── */
  const highlightedCells = useMemo(() => {
    if (!selectionStart || !selectionEnd) return new Set<string>();
    const [r1, c1] = selectionStart;
    const [r2, c2] = selectionEnd;
    const dr = r2 - r1;
    const dc = c2 - c1;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));
    if (steps === 0) return new Set([`${r1},${c1}`]);
    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return new Set();
    const sRow = dr / steps;
    const sCol = dc / steps;
    const cells = new Set<string>();
    for (let i = 0; i <= steps; i++) {
      const r = r1 + sRow * i;
      const c = c1 + sCol * i;
      cells.add(`${Math.round(r)},${Math.round(c)}`);
    }
    return cells;
  }, [selectionStart, selectionEnd]);

  /* ── New game ── */
  const handleNewGame = useCallback(() => {
    setGridKey((k) => k + 1);
  }, []);

  /* ── Render ── */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto" />
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <Button
            kind="text"
            color="violet"
            size="lg"
            icon={ChevronLeft}
            iconPosition="left"
            onClick={() => navigate(PATHS.topic(topicId))}
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const words = topic?.words || [];

  if (words.length === 0 || (placedWords.length === 0 && !loading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-gray-500">
            {words.length === 0
              ? "Chưa có từ vựng để chơi."
              : "Không đủ từ để tạo bảng. Cần ít nhất 1 từ có 2 ký tự hiragana trở lên."}
          </p>
          <Button
            kind="text"
            color="violet"
            size="lg"
            icon={ChevronLeft}
            iconPosition="left"
            onClick={() => navigate(PATHS.topic(topicId))}
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grow flex flex-col">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-6">
        <Button
          kind="text"
          color="violet"
          size="lg"
          icon={ChevronLeft}
          iconPosition="left"
          onClick={() => navigate(PATHS.topic(topic?.topic_id))}
          spacing="none"
        >
          Quay lại
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-medium">
            Tìm thấy: {foundWordIds.size}/{placedWords.length}
          </span>
          <Button
            kind="outline"
            color="violet"
            size="sm"
            spacing="xs"
            icon={Shuffle}
            onClick={handleNewGame}
          >
            Tạo bảng mới
          </Button>
        </div>
      </div>

      {/* Topic title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{topic?.name}</h1>
        <p className="text-sm text-gray-400">
          Tìm các từ trong bảng chữ cái. Kéo chuột để chọn.
        </p>
      </div>

      {/* Main layout: left grid + right word list */}
      <div className="grow flex flex-col lg:flex-row gap-8">
        {/* ── Left: Grid ── */}
        {grid && (
          <div className="flex-1 flex justify-center">
            <div
              ref={gridRef}
              className="inline-grid select-none touch-none"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                gap: "2px",
                width: "100%",
                maxWidth: "500px",
                height: "fit-content",
              }}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const key = `${r},${c}`;
                  const isHighlighted = highlightedCells.has(key);
                  const isFound = cell.found;
                  const bgClass = isFound
                    ? "bg-emerald-400 text-white"
                    : isHighlighted
                      ? "bg-violet-400 text-white"
                      : "bg-violet-50 text-violet-800 hover:bg-violet-100";

                  return (
                    <div
                      key={key}
                      className={`aspect-square flex items-center justify-center text-lg font-bold rounded cursor-pointer transition-colors select-none ${bgClass}`}
                      onMouseDown={() => handleCellMouseDown(r, c)}
                      onMouseEnter={() => handleCellMouseEnter(r, c)}
                      onTouchStart={handleTouchStart(r, c)}
                    >
                      {cell.char}
                    </div>
                  );
                }),
              )}
            </div>
          </div>
        )}

        {/* ── Right: Word list ── */}
        <div className="w-full lg:w-72 shrink-0">
          <h3 className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-4">
            Danh sách từ cần tìm
          </h3>
          <div className="space-y-2">
            {placedWords.map((pw) => {
              const isFound = foundWordIds.has(pw.wordId);
              return (
                <div
                  key={pw.wordId}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    isFound
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      isFound
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      {isFound ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      ) : (
                        <circle cx="12" cy="12" r="4" />
                      )}
                    </svg>
                  </span>
                  <div>
                    <p
                      className={`font-semibold ${
                        isFound
                          ? "text-emerald-700 line-through"
                          : "text-gray-800"
                      }`}
                    >
                      {pw.meaning}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Win Modal ── */}
      {showWinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="rounded-3xl border border-violet-100 bg-white p-8 shadow-2xl max-w-md w-full text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-violet-100 mx-auto">
              <Sparkles className="w-10 h-10 text-violet-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Chúc mừng! 🎉
              </h2>
              <p className="text-gray-500">
                Bạn đã hoàn thành tìm tất cả {placedWords.length} từ trong bảng!
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                kind="solid"
                color="violet"
                size="xl"
                spacing="lg"
                icon={RotateCcw}
                iconPosition="left"
                onClick={() => {
                  setShowWinModal(false);
                  const newGrid = grid!.map((row) =>
                    row.map((cell) => ({ ...cell, found: false })),
                  );
                  setGrid(newGrid);
                  setFoundWordIds(new Set());
                }}
              >
                Chơi lại
              </Button>
              <Button
                kind="outline"
                color="violet"
                size="xl"
                spacing="lg"
                icon={Shuffle}
                iconPosition="left"
                onClick={() => {
                  setShowWinModal(false);
                  handleNewGame();
                }}
              >
                Tạo bảng mới
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
