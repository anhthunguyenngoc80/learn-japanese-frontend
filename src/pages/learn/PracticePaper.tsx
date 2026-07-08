import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import * as api from "../../api";
import type { Topic } from "../../model";
import { ChevronLeft, Printer, Undo2, Redo2, Eraser } from "lucide-react";
import { loadKanjiIndex } from "../../utils/kanjiIndex";
import { PracticeBoard } from "../../components/PracticeBoard";
import type { PracticeBoardHandle } from "../../components/PracticeBoard";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type PracticeChar = {
  char: string;
  hasKanjiVG: boolean;
};

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
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
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const BOARDS_PER_CHAR = 10;
const HINT_COUNT = 3;
const BOARD_SIZE = 120;

/* ------------------------------------------------------------------ */
/*  BoardCell - self-contained board with its own ref and toolbar      */
/* ------------------------------------------------------------------ */
type BoardCellProps = {
  char: string;
  showHint: boolean;
  boardIndex: number;
};

const BoardCell = ({ char, showHint, boardIndex }: BoardCellProps) => {
  const boardRef = useRef<PracticeBoardHandle | null>(null);

  return (
    <div className="shrink-0 flex flex-col items-center">
      <PracticeBoard
        ref={boardRef}
        char={char}
        hintMode="all-at-once"
        showHint={showHint}
        width={BOARD_SIZE}
        height={BOARD_SIZE}
        strokeDurationMs={0}
      />
      <span className="text-[10px] text-gray-400 mt-0.5">
        {boardIndex + 1}
      </span>
      <div className="flex items-center justify-center gap-0.5 mt-0.5 print:hidden">
        <button
          onClick={() => boardRef.current?.undo()}
          className="w-5 h-5 rounded grid place-items-center hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition"
          title="Undo"
        >
          <Undo2 size={10} />
        </button>
        <button
          onClick={() => boardRef.current?.redo()}
          className="w-5 h-5 rounded grid place-items-center hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition"
          title="Redo"
        >
          <Redo2 size={10} />
        </button>
        <button
          onClick={() => boardRef.current?.clear()}
          className="w-5 h-5 rounded grid place-items-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
          title="Xoá"
        >
          <Eraser size={10} />
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export const PracticePaperPage = () => {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const location = useLocation();
  const state = location.state as { topic?: Topic } | null;

  const [topic, setTopic] = useState<Topic | null>(null);
  const kanjiSet = useKanjiIndexMap();

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

  // Parse all characters for all words
  const wordCharEntries = topic?.words.map((word, wordIdx) => ({
    word,
    wordIndex: wordIdx,
    chars: splitWordIntoChars(word.text, kanjiSet).filter((c) => c.hasKanjiVG),
  }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grow flex flex-col px-4 py-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 w-fit"
        >
          <ChevronLeft size={16} /> Quay lại
        </button>
        <div className="flex items-center gap-3">
          {topic?.name && (
            <span className="text-sm text-gray-500 font-medium">
              {topic?.name}
            </span>
          )}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
          >
            <Printer size={16} />
            In
          </button>
        </div>
      </div>

      {/* Title - visible on print */}
      <div className="text-center mb-8 print:mb-6 hidden print:block">
        <h1 className="text-xl font-bold text-gray-800">Giấy luyện viết</h1>
        {topic?.name && (
          <p className="text-sm text-gray-500 mt-1">{topic?.name}</p>
        )}
      </div>

      {/* Content */}
      {!wordCharEntries || wordCharEntries.length === 0 ? (
        <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-8 text-center">
          <p className="text-gray-600 font-medium">Không có từ vựng để luyện viết</p>
          <p className="text-sm text-gray-400 mt-1">
            Vui lòng chọn một bộ từ vựng từ danh sách từ vựng.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {wordCharEntries.map(({ word, wordIndex, chars }) => (
            <div key={wordIndex} className="border-b border-gray-200 pb-8 last:border-b-0">
              {/* Word header */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-xs text-gray-400 font-medium">
                  {wordIndex + 1}.
                </span>
                <span className="font-jp font-semibold text-lg text-gray-800">
                  {word.text}
                </span>
                <span className="text-sm text-gray-500">
                  {word.meaning}
                </span>
                {word.reading && (
                  <span className="text-sm text-gray-400 italic">
                    ({word.reading})
                  </span>
                )}
              </div>

              {/* Characters */}
              {chars.length === 0 ? (
                <p className="text-sm text-gray-400 italic pl-6">
                  Không có chữ Hán trong từ này
                </p>
              ) : (
                <div className="space-y-4">
                  {chars.map((pc, charIdx) => (
                    <div key={charIdx} className="flex items-center gap-3">
                      {/* Character label */}
                      <div className="w-8 h-8 rounded-lg bg-amber-100 grid place-items-center shrink-0">
                        <span className="font-jp font-bold text-base text-amber-700">
                          {pc.char}
                        </span>
                      </div>

                      {/* Boards row */}
                      <div className="flex gap-1.5 overflow-x-auto pb-2">
                        {Array.from({ length: BOARDS_PER_CHAR }).map((_, boardIdx) => (
                          <BoardCell
                            key={boardIdx}
                            char={pc.char}
                            showHint={boardIdx < HINT_COUNT}
                            boardIndex={boardIdx}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};