// import { useNavigate, useParams } from "react-router-dom";
// import { createContext, useContext, useMemo, useState } from "react";
// import {
//   PencilLine,
//   Lightbulb,
//   List,
//   Plus,
//   ChevronLeft,
//   ChevronRight,
//   CheckCircle2,
//   Sparkles,
//   BookOpen,
//   RotateCcw,
//   Trophy,
//   Check,
//   Star,
//   ListOrdered,
//   Loader2,
//   ArrowLeft,
//   X,
// } from "lucide-react";

// import * as components from "../../components";
// import * as constant from "../../constant";
// import { motion } from "framer-motion";

// interface PracticeContextType {
//   checkRes: Record<string, boolean>;
//   practices: Record<string, any>;
//   themeId: string | undefined;
//   userAnswer: Record<string, any>;
//   setUserAnswer: React.Dispatch<React.SetStateAction<Record<string, any>>>;
//   displayAnswer: boolean;
//   page: number;
//   setPage: React.Dispatch<React.SetStateAction<number>>;
//   setCheckRes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
//   setDisplayAnswer: React.Dispatch<React.SetStateAction<boolean>>;
//   finishedPages: Record<number, { correct: number; total: number; points: number }>;
// }

// const PracticeContext = createContext<PracticeContextType>(null as unknown as PracticeContextType);

// interface QuizQuestion {
//   id: string;
//   question: string;
//   answers: string[];
//   correctAnswer: string;
//   point: number;
// }

// interface QuizGroup {
//   id: string;
//   title: string;
//   questions: QuizQuestion[];
// }

// interface PracticeModeItem {
//   title: string;
//   subtitle: string;
//   modeKey: string;
//   content: React.ReactElement;
//   icon: React.ComponentType<any>;
// }

// export const PracticePage = () => {
//   const { themeId } = useParams<{ themeId: string }>();
//   const [page, setPage] = useState(0);
//   const [mode, setMode] = useState<number | null>(null);
//   const [checkRes, setCheckRes] = useState<Record<string, boolean>>({});
//   const [userAnswer, setUserAnswer] = useState<Record<string, any>>({});
//   const [displayAnswer, setDisplayAnswer] = useState(false);
//   const [finishedPages, setFinishedPages] = useState<Record<number, { correct: number; total: number; points: number }>>({});
//   const [showSummary, setShowSummary] = useState(false);

//   const quizList = practices?.multipleChoice?.questions || {};
//   const quizObject = themeId ? (quizList[themeId] || {}) : {};
//   const groups = Object.values(quizObject).flat() as QuizGroup[];

//   // Số page phụ thuộc vào mode
//   const totalMiniStoryPages = themeId ? (MojiGoiData[Number(themeId)]?.miniStory?.length || 0) : 0;
//   const totalQuizGroupPages = groups.length || 0;
//   const totalPages = mode === 1 ? totalQuizGroupPages : totalMiniStoryPages;

//   // Tính tổng kết quả
//   const summary = useMemo(() => {
//     const pages = Object.values(finishedPages);
//     if (pages.length === 0) return null;
//     return pages.reduce(
//       (acc, p) => ({
//         correct: acc.correct + p.correct,
//         total: acc.total + p.total,
//         points: acc.points + p.points,
//       }),
//       { correct: 0, total: 0, points: 0 },
//     );
//   }, [finishedPages]);

//   const PracticeMode: PracticeModeItem[] = useMemo(
//     () => [
//       {
//         title: "Fill in the blank",
//         subtitle: "Điền từ còn thiếu vào câu chuyện",
//         modeKey: "fillBlank",
//         content: (
//           <FillInBlank
//             MojiGoiData={MojiGoiData}
//             themeId={themeId}
//             page={page}
//             setUserAnswer={setUserAnswer}
//           />
//         ),
//         icon: PencilLine,
//       },
//       {
//         title: "Multichoice Quiz",
//         subtitle: "Chọn đáp án đúng cho mỗi câu hỏi",
//         modeKey: "multichoice",
//         content: <MultichoiceQuiz />,
//         icon: List,
//       },
//     ],
//     [page, MojiGoiData, themeId],
//   );

//   // Lấy currentPartId để đánh dấu hoàn thành
//   const currentPartId = mode === 1
//     ? groups[page]?.id
//     : (themeId ? (MojiGoiData[Number(themeId)]?.miniStory?.[page]?.id) : undefined);

//   const handleCheck = () => {
//     const modeKey = PracticeMode[mode ?? 0]?.modeKey;
//     switch (mode) {
//       case 0:
//         {
//           const res: Record<string, boolean> = {};
//           Object.entries(
//             practices.fillBlank.answers,
//           ).forEach(([id, answers]) => {
//             res[id] = (answers as string[]).includes(
//               userAnswer[id] || "",
//             );
//           });
//           setCheckRes(res);
//         }
//         break;
//       case 1: {
//         const currentGroup = groups[page];
//         if (!currentGroup) break;
//         const res: Record<string, boolean> = {};
//         currentGroup.questions.forEach((q) => {
//           // userAnswer[q.id] là index 0-based (0, 1, 2, 3), có thể là 0
//           const userAns = userAnswer[q.id];
//           if (userAns === undefined || userAns === null) { res[q.id] = false; return; }
//           // correctAnswer là index 1-based (1, 2, 3, 4) dạng number hoặc string
//           const isCorrect = (Number(userAns) + 1) === Number(q.correctAnswer);
//           res[q.id] = isCorrect;
//         });
//         setCheckRes(res);

//         // Lưu kết quả page hiện tại
//         const correct = Object.values(res).filter(Boolean).length;
//         const total = Object.keys(res).length;
//         const points = currentGroup.questions.reduce((sum, q) => {
//           return sum + (res[q.id] ? q.point : 0);
//         }, 0);
//         setFinishedPages((prev) => ({ ...prev, [page]: { correct, total, points } }));
//       }
//     }
//     setDisplayAnswer((prev) => !prev);

//     if (currentPartId && modeKey && themeId) {
//       markPartPracticeAsCompleted(Number(themeId), currentPartId, modeKey);
//     }

//     // Kiểm tra nếu đây là page cuối và đã check
//     if (page === totalPages - 1) {
//       setShowSummary(true);
//     }
//   };

//   const handleFinish = () => {
//     // Lưu kết quả nếu chưa lưu cho page hiện tại
//     if (Object.keys(checkRes).length > 0 && !finishedPages[page]) {
//       const correct = Object.values(checkRes).filter(Boolean).length;
//       const total = Object.keys(checkRes).length;
//       const points = groups[page]?.questions.reduce((sum, q) => {
//         return sum + (checkRes[q.id] ? q.point : 0);
//       }, 0) || 0;
//       setFinishedPages((prev) => ({ ...prev, [page]: { correct, total, points } }));
//     }
//     setShowSummary(true);
//   };

//   const handleRetry = () => {
//     setPage(0);
//     setCheckRes({});
//     setUserAnswer({});
//     setDisplayAnswer(false);
//     setFinishedPages({});
//     setShowSummary(false);
//   };

//   const contextValue: PracticeContextType = {
//     checkRes, practices, themeId, userAnswer, setUserAnswer, displayAnswer, page, setPage, setCheckRes, setDisplayAnswer, finishedPages,
//   };

//   return (
//     <PracticeContext.Provider value={contextValue}>
//         {mode != null && !showSummary ? (
//           <div className="flex flex-col gap-6">
//             {/* Header */}
//             <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white via-rose-50/30 to-amber-50/20 p-6 shadow-sm">
//               <div className="flex items-start justify-between gap-4 flex-wrap">
//                 <div className="flex flex-col gap-2">
//                   <span className="text-xs uppercase tracking-[0.2em] text-rose-500/80 font-medium">
//                     Luyện tập · Practice
//                   </span>
//                   <div className="flex items-center gap-3 flex-wrap">
//                     <h2
//                       className="!text-3xl md:!text-4xl !font-display text-start"
//                     >
//                       {themeId ? (MojiGoiData[Number(themeId)].japanese) : ""}
//                     </h2>
//                     <span className="inline-flex items-center gap-1 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs font-semibold rounded-full px-3 py-1 shadow-sm">
//                       <Sparkles size={12} />
//                       {PracticeMode[mode]?.title}
//                     </span>
//                   </div>
//                   <p className="text-sm text-gray-500">
//                     {PracticeMode[mode]?.subtitle}
//                   </p>
//                 </div>

//                 <button
//                   onClick={() => setMode(null)}
//                   className="text-xs uppercase tracking-wider text-rose-600 hover:text-rose-700 font-medium px-3 py-2 rounded-full border border-rose-200 hover:bg-rose-50 transition-colors"
//                 >
//                   ← Đổi chế độ
//                 </button>
//               </div>
//             </div>

//             {/* Parts progress */}
//             <div className="rounded-2xl border border-rose-100 bg-white px-5 py-4 shadow-sm">
//               <div className="flex items-center justify-between mb-3">
//                 <div className="flex items-center gap-2">
//                   <span className="text-xs uppercase tracking-[0.2em] text-gray-400 font-medium">
//                     {mode === 1 ? 'Nhóm câu hỏi' : 'Phần'}
//                   </span>
//                   <span className="text-sm font-semibold text-gray-700">
//                     {page + 1}{" "}
//                     <span className="text-gray-400">/ {totalPages}</span>
//                   </span>
//                   {Object.keys(finishedPages).length > 0 && (
//                     <span className="text-xs text-emerald-600 ml-2">
//                       ✓ {Object.keys(finishedPages).length} trang đã làm
//                     </span>
//                   )}
//                 </div>
//               </div>
//               <div className="flex flex-wrap gap-1.5">
//                 {Array.from({ length: totalPages }, (_, index) => {
//                   if (mode === 1) {
//                     const isFinished = finishedPages[index] !== undefined;
//                     return (
//                       <button
//                         key={`group-${index}`}
//                         onClick={() => {
//                           setPage(index);
//                           setCheckRes({});
//                           setUserAnswer({});
//                           setDisplayAnswer(false);
//                         }}
//                         className={`h-2 flex-1 rounded-full transition-all duration-300 hover:scale-y-150 ${
//                           index === page
//                             ? "bg-gradient-to-r from-rose-500 to-rose-600 shadow-sm"
//                             : isFinished
//                               ? "bg-emerald-400"
//                               : "bg-gray-200"
//                         }`}
//                       />
//                     );
//                   }
//                   const theme = themeId ? MojiGoiData[Number(themeId)] : undefined;
//                   const part = theme?.miniStory?.[index];
//                   const hasPractice = part?.completedPractice?.[mode != null ? (PracticeMode[mode]?.modeKey ?? "") : ""];
//                   return (
//                     <button
//                       key={`page-${index}`}
//                       onClick={() => setPage(index)}
//                       className={`h-2 flex-1 rounded-full transition-all duration-300 hover:scale-y-150 ${
//                         index === page
//                           ? "bg-gradient-to-r from-rose-500 to-rose-600 shadow-sm"
//                           : hasPractice
//                             ? "bg-emerald-400"
//                             : "bg-gray-200"
//                       }`}
//                       aria-label={`Phần ${index + 1}${hasPractice ? ' (đã luyện tập)' : ''}`}
//                     />
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Content */}
//             <div>{PracticeMode[mode]?.content}</div>

//             {/* Footer buttons */}
//             <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
//               <button
//                 disabled={page === 0}
//                 onClick={() => {
//                   setPage(page - 1);
//                   setCheckRes({});
//                   setUserAnswer({});
//                   setDisplayAnswer(false);
//                 }}
//                 className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600 disabled:hover:bg-transparent"
//               >
//                 <ChevronLeft size={16} />
//                 Trước
//               </button>

//               <button
//                 onClick={handleCheck}
//                 className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md hover:shadow-lg transition-all"
//               >
//                 <CheckCircle2 size={16} />
//                 Kiểm tra
//               </button>

//               {page === totalPages - 1 ? (
//                 <button
//                   onClick={handleFinish}
//                   disabled={Object.keys(checkRes).length === 0}
//                   className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
//                 >
//                   Xem kết quả <Trophy size={16} />
//                 </button>
//               ) : (
//                 <button
//                   disabled={page === totalPages - 1}
//                   onClick={() => {
//                     setPage(page + 1);
//                     setCheckRes({});
//                     setUserAnswer({});
//                     setDisplayAnswer(false);
//                   }}
//                   className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600 disabled:hover:bg-transparent"
//                 >
//                   Sau
//                   <ChevronRight size={16} />
//                 </button>
//               )}
//             </div>
//           </div>
//         ) : mode != null && showSummary ? (
// <div className="flex flex-col items-center justify-center gap-6">
//   <motion.div
//     initial={{ opacity: 0, y: 24, scale: 0.96 }}
//     animate={{ opacity: 1, y: 0, scale: 1 }}
//     transition={{ duration: 0.5, ease: "easeOut" }}
//     className="rounded-[2rem] border border-rose-100/60 bg-white/90 backdrop-blur-sm p-8 shadow-[0_8px_40px_-12px_rgba(244,63,94,0.18)] w-full max-w-lg text-center"
//   >
//     {/* Trophy + score ring */}
//     <div className="relative inline-flex items-center justify-center mb-5">
//       <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300/30 to-rose-400/30 animate-pulse" />
//       <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-white shadow-lg shadow-rose-200/60 ring-4 ring-rose-50">
//         <Trophy size={36} strokeWidth={1.8} />
//       </div>
//       {summary && (
//         <motion.div
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
//           className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shadow-md ring-2 ring-white"
//         >
//           {Math.round((summary.correct / summary.total) * 100)}%
//         </motion.div>
//       )}
//     </div>

//     <h3 className="text-2xl font-bold text-gray-900 mb-1 font-display tracking-tight">
//       Kết quả bài kiểm tra
//     </h3>
//     <p className="text-sm text-gray-400 mb-8 font-medium">
//       {themeId ? (MojiGoiData[Number(themeId)]?.japanese) : ""} · {PracticeMode[mode]?.title}
//     </p>

//     {summary ? (
//       <div className="space-y-5">
//         {/* 3 Stats Cards */}
//         <div className="grid grid-cols-3 gap-3">
//           <motion.div
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.15 }}
//             className="rounded-2xl bg-gradient-to-b from-rose-50 to-white border border-rose-100 p-4 shadow-sm"
//           >
//             <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-100 text-rose-600 mb-2">
//               <Check size={16} strokeWidth={2.5} />
//             </div>
//             <div className="text-2xl font-bold text-rose-600 leading-none">
//               {summary.correct}
//             </div>
//             <div className="text-[11px] font-medium text-gray-400 mt-1.5 uppercase tracking-wide">Đúng</div>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.25 }}
//             className="rounded-2xl bg-gradient-to-b from-amber-50 to-white border border-amber-100 p-4 shadow-sm"
//           >
//             <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600 mb-2">
//               <X size={16} strokeWidth={2.5} />
//             </div>
//             <div className="text-2xl font-bold text-amber-600 leading-none">
//               {summary.total - summary.correct}
//             </div>
//             <div className="text-[11px] font-medium text-gray-400 mt-1.5 uppercase tracking-wide">Sai</div>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.35 }}
//             className="rounded-2xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-100 p-4 shadow-sm"
//           >
//             <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 mb-2">
//               <Star size={16} strokeWidth={2.5} />
//             </div>
//             <div className="text-2xl font-bold text-emerald-600 leading-none">
//               {summary.points}
//             </div>
//             <div className="text-[11px] font-medium text-gray-400 mt-1.5 uppercase tracking-wide">Điểm</div>
//           </motion.div>
//         </div>

//         {/* Progress bar */}
//         <div className="w-full">
//           <div className="flex items-center justify-between mb-1.5 px-0.5">
//             <span className="text-xs font-semibold text-gray-500">Tỷ lệ đúng</span>
//             <span className="text-xs font-bold text-rose-500">
//               {Math.round((summary.correct / summary.total) * 100)}%
//             </span>
//           </div>
//           <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
//             <motion.div
//               initial={{ width: 0 }}
//               animate={{ width: `${(summary.correct / summary.total) * 100}%` }}
//               transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
//               className="h-full rounded-full bg-gradient-to-r from-rose-400 via-rose-500 to-emerald-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
//             />
//           </div>
//         </div>

//         {/* Encouragement message */}
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ delay: 0.6 }}
//           className={`rounded-xl px-5 py-3 text-sm font-medium ${
//             summary.correct === summary.total
//               ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
//               : summary.correct >= summary.total * 0.7
//                 ? "bg-amber-50 text-amber-700 border border-amber-100"
//                 : "bg-rose-50 text-rose-700 border border-rose-100"
//           }`}
//         >
//           <div className="flex items-center gap-2 justify-center">
//             <span className="text-xl">
//               {summary.correct === summary.total
//                 ? "🎉"
//                 : summary.correct >= summary.total * 0.7
//                   ? "👍"
//                   : "💪"}
//             </span>
//             <span>
//               {summary.correct === summary.total
//                 ? "Hoàn hảo! Bạn đã trả lời đúng tất cả!"
//                 : summary.correct >= summary.total * 0.7
//                   ? "Tốt! Tiếp tục cố gắng nhé!"
//                   : "Hãy làm lại để cải thiện kết quả!"}
//             </span>
//           </div>
//         </motion.div>

//         {/* Chi tiết từng phần */}
//         <div className="text-left">
//           <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-3 font-semibold flex items-center gap-1.5">
//             <ListOrdered size={12} />
//             Chi tiết từng phần
//           </p>
//           <div className="rounded-xl border border-gray-100 bg-gray-50/50 overflow-hidden divide-y divide-gray-100">
//             {Object.entries(finishedPages)
//               .sort(([a], [b]) => Number(a) - Number(b))
//               .map(([pageIdx, result], idx) => {
//                 const pct = result.total > 0 ? (result.correct / result.total) * 100 : 0;
//                 return (
//                   <motion.div
//                     key={pageIdx}
//                     initial={{ opacity: 0, x: -8 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.5 + idx * 0.08 }}
//                     className="flex items-center justify-between py-2.5 px-3 hover:bg-white transition-colors"
//                   >
//                     <div className="flex items-center gap-3 min-w-0">
//                       <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
//                         pct === 100
//                           ? "bg-emerald-100 text-emerald-600"
//                           : pct >= 70
//                             ? "bg-amber-100 text-amber-600"
//                             : "bg-rose-100 text-rose-500"
//                       }`}>
//                         {Number(pageIdx) + 1}
//                       </div>
//                       <span className="text-sm text-gray-600 font-medium">Phần {Number(pageIdx) + 1}</span>
//                     </div>
//                     <div className="flex items-center gap-3 shrink-0">
//                       <div className="hidden sm:flex items-center gap-1.5 w-20">
//                         <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
//                           <div
//                             className={`h-full rounded-full transition-all duration-700 ${
//                               pct === 100
//                                 ? "bg-emerald-400"
//                                 : pct >= 70
//                                   ? "bg-amber-400"
//                                   : "bg-rose-400"
//                             }`}
//                             style={{ width: `${pct}%` }}
//                           />
//                         </div>
//                       </div>
//                       <span className="text-sm font-semibold text-gray-700 tabular-nums">
//                         {result.correct}/{result.total}
//                       </span>
//                       <span className="text-xs font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md tabular-nums">
//                         {result.points}đ
//                       </span>
//                     </div>
//                   </motion.div>
//                 );
//               })}
//           </div>
//         </div>
//       </div>
//     ) : (
//       <div className="py-8 text-gray-400 flex flex-col items-center gap-2">
//         <Loader2 size={24} className="animate-spin text-rose-300" />
//         <p className="text-sm">Chưa có dữ liệu</p>
//       </div>
//     )}

//     {/* Action buttons */}
//     <div className="flex gap-3 mt-7">
//       <motion.button
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//         onClick={handleRetry}
//         className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-200/60 hover:from-rose-600 hover:to-rose-700 transition-all active:scale-95"
//       >
//         <RotateCcw size={16} />
//         Làm lại
//       </motion.button>
//       <motion.button
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//         onClick={() => setMode(null)}
//         className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border border-rose-200/80 text-rose-700 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-300 transition-all active:scale-95"
//       >
//         <ArrowLeft size={16} />
//         Về chế độ
//       </motion.button>
//     </div>
//   </motion.div>
// </div>

//         ) : (
//           <SelectPracticeMode
//             PracticeMode={PracticeMode}
//             setMode={setMode}
//             mode={mode}
//           />
//         )}
//     </PracticeContext.Provider>
//   );
// };

// const FillInBlank = ({ themeId, page, MojiGoiData, setUserAnswer }: {
//   themeId: string | undefined;
//   page: number;
//   MojiGoiData: any[];
//   setUserAnswer: React.Dispatch<React.SetStateAction<Record<string, any>>>;
// }) => {
//   const ctx = useContext(PracticeContext);
//   const { checkRes } = ctx;
//   const [displayHint, setDisplayHint] = useState(false);
//   const navigate = useNavigate();
//   const story = themeId ? MojiGoiData[Number(themeId)]?.miniStory?.[page] : undefined;
//   const storyWords = Array.isArray(story?.words) ? story.words : Object.values(story?.words || {});

//   return (
//     <div className="flex flex-col gap-6">
//       <div className="rounded-3xl border border-rose-100 bg-white p-6 md:p-8 shadow-sm">
//         <div className="flex items-center justify-between mb-5">
//           <div>
//             <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-medium">
//               Bài tập
//             </p>
//             <h3 className="text-lg font-semibold text-gray-800 font-display">
//               Điền vào chỗ trống
//             </h3>
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => setDisplayHint((prev) => !prev)}
//               className={`p-3 rounded-full text-rose-500 hover:bg-rose-50 ${displayHint ? "bg-rose-100" : "bg-white"} transition-colors`}
//             >
//               <Lightbulb size={18} className="text-rose-400" />
//             </button>
//             <button
//               onClick={() => navigate(constant.PATHS.editPractice(themeId, story?.id, 'fillBlank'))}
//               className="p-3 rounded-full text-rose-500 hover:bg-rose-50 transition-colors"
//             >
//               <PencilLine size={18} className="text-rose-400" />
//             </button>
//           </div>
//         </div>

//         <div className="leading-loose text-lg text-gray-700 font-jp">
//           {story?.tokens.map((token: { id: string; text: string }, idx: number) =>
//             story?.words[token.id] ? (
//               <div className="inline-block min-w-0 shrink-0" key={idx}>
//                 {displayHint && story?.words[token.id].meaning && (
//                   <div className="text-sm text-stone-500 truncate">
//                     ({story?.words[token.id].meaning})
//                   </div>
//                 )}
//                 <input
//                   className={`text-center w-28 mx-1 px-2 py-1 rounded-md border-2 transition focus:outline-none focus:ring-2 focus:ring-rose-200 ${
//                     checkRes[token.id] === true
//                       ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold"
//                       : checkRes[token.id] === false
//                         ? "border-red-500 bg-red-50 text-red-700"
//                         : "border-rose-200 focus:border-rose-400 bg-white"
//                   }`}
//                   onChange={(e) =>
//                     setUserAnswer((prev) => ({
//                       ...prev,
//                       [token.id]: e.target.value,
//                     }))
//                   }
//                 />
//               </div>
//             ) : (
//               <span key={idx}>{token.text}</span>
//             ),
//           )}
//         </div>
//       </div>

//       {/* Vocabulary list */}
//       {ctx.displayAnswer && (
//         <div className="rounded-3xl border border-rose-100 bg-white shadow-sm overflow-hidden">
//           <div className="px-6 py-4 border-b border-rose-100 bg-gradient-to-r from-rose-50/50 to-transparent">
//             <div className="flex items-center gap-2">
//               <BookOpen size={16} className="text-rose-500" />
//               <h3 className="font-semibold text-stone-800">Từ vựng</h3>
//               <span className="text-xs text-stone-500">({storyWords.length} từ)</span>
//             </div>
//           </div>
//           <components.VocabList words={storyWords} />
//         </div>
//       )}
//     </div>
//   );
// };

// const MultichoiceQuiz = () => {
//   const ctx = useContext(PracticeContext);
//   const { themeId, practices, checkRes, userAnswer, setUserAnswer } = ctx;
//   const navigate = useNavigate();

//   const quizList = practices?.multipleChoice?.questions || {};
//   const quizObject = themeId ? (quizList[themeId] || {}) : {};
//   const allGroups = Object.values(quizObject).flat() as QuizGroup[];
//   const pageIndex = ctx?.page || 0;
//   const group = allGroups[pageIndex];

//   if (allGroups.length === 0) {
//     return (
//       <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/30 p-10 text-center text-gray-400">
//         Chưa có câu hỏi nào cho chủ đề này.
//       </div>
//     );
//   }

//   if (!group) return null;

//   return (
//     <div className="rounded-3xl border border-rose-100 bg-white shadow-sm overflow-hidden">
//       <div className="flex items-center gap-3 border-b border-rose-100 bg-gradient-to-r from-rose-50/60 to-transparent px-6 py-4">
//         <span className="flex items-center justify-center h-8 w-8 rounded-full bg-rose-500 text-white text-sm font-semibold">
//           {pageIndex + 1}
//         </span>
//         <h3 className="font-semibold text-gray-800 font-display flex-1">
//           {group.title}
//         </h3>
//         <button
//           onClick={() => navigate(constant.PATHS.editPractice(themeId, group.id, 'multichoice'))}
//           className="p-2 rounded-full text-rose-500 hover:bg-rose-50 transition-colors"
//           title="Chỉnh sửa bài tập"
//         >
//           <PencilLine size={16} className="text-rose-400" />
//         </button>
//       </div>

//       <div className="p-6 space-y-4">
//         {group.questions.map((q, j) => (
//           <div
//             key={q.id}
//             className={`rounded-2xl border p-5 transition-all ${
//               checkRes[q.id] === true
//                 ? "border-emerald-300 bg-emerald-50/50"
//                 : checkRes[q.id] === false
//                   ? "border-red-300 bg-red-50/50"
//                   : "border-gray-100 bg-gray-50/40 hover:border-rose-200"
//             }`}
//           >
//             <p className="font-medium text-gray-800 mb-4 flex items-start gap-2">
//               <span className="text-rose-500 font-semibold">{j + 1}.</span>
//               <span className="flex-1">{q.question}</span>
//               <span className="text-xs text-gray-400 px-2 py-0.5 rounded-full bg-white border border-gray-200 shrink-0">
//                 {q.point}đ
//               </span>
//             </p>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//               {q.answers.map((a, k) => {
//                 const selected = userAnswer[q.id] === k;
//                 const isCorrect = checkRes[q.id] === true && selected;
//                 const isWrong = checkRes[q.id] === false && selected;
//                 return (
//                   <button
//                     key={k}
//                     onClick={() =>
//                       setUserAnswer((p: Record<string, any>) => ({ ...p, [q.id]: k }))}
//                     className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
//                       isCorrect
//                         ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
//                         : isWrong
//                           ? "bg-red-500 text-white border-red-500 shadow-sm"
//                           : selected
//                             ? "bg-rose-500 text-white border-rose-500 shadow-sm"
//                             : "border-gray-200 hover:border-rose-300 hover:bg-rose-50 bg-white text-gray-700"
//                     }`}
//                   >
//                     <span className="inline-block w-6 text-xs opacity-70">
//                       {String.fromCharCode(65 + k)}.
//                     </span>
//                     {a}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// const SelectPracticeMode = ({ PracticeMode, mode, setMode }: {
//   PracticeMode: PracticeModeItem[];
//   mode: number | null;
//   setMode: React.Dispatch<React.SetStateAction<number | null>>;
// }) => {
//   const { themeId } = useParams<{ themeId: string }>();
//   const navigate = useNavigate();
//   const { MojiGoiData } = useAppContext();
//   const theme = themeId ? MojiGoiData[Number(themeId)] : undefined;
//   const parts = theme?.miniStory || [];
//   const totalParts = parts.length;

//   const getModeCompletion = (modeKey: string) => {
//     const done = parts.filter((p: { completedPractice?: Record<string, boolean> }) => p.completedPractice?.[modeKey]).length;
//     return { done, total: totalParts };
//   };

//   return (
//     <div className="flex flex-col gap-6">
//       {/* Header */}
//       <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white via-rose-50/30 to-amber-50/20 p-6 md:p-8 shadow-sm">
//         <div className="flex items-start justify-between gap-4 flex-wrap">
//           <div>
//             <p className="text-xs uppercase tracking-[0.2em] text-rose-500/80 font-medium mb-2">
//               Luyện tập · Practice
//             </p>
//             <h2
//               className="!text-3xl md:!text-4xl !font-display text-start mb-2"
//             >
//               {themeId ? (MojiGoiData[Number(themeId)]?.japanese) : ""}
//             </h2>
//             <p className="text-sm text-gray-500">
//               Chọn một chế độ luyện tập để bắt đầu củng cố kiến thức.
//             </p>
//           </div>

//           <button
//             onClick={() => navigate(constant.PATHS.createPractice(themeId))}
//             className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 transition-colors"
//           >
//             <Plus size={16} />
//             Soạn bài tập
//           </button>
//         </div>
//       </div>

//       {/* Mode cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {PracticeMode.map((m, index) => {
//           const active = index === mode;
//           const Icon = m.icon;
//           const { done, total } = getModeCompletion(m.modeKey);
//           const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
//           return (
//             <button
//               key={index}
//               onClick={() => setMode(index)}
//               className={`group relative text-left p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
//                 active
//                   ? "bg-gradient-to-br from-rose-500 to-rose-600 border-rose-500 text-white shadow-lg"
//                   : "bg-white border-rose-100 hover:border-rose-300 text-gray-800"
//               }`}
//             >
//               <div
//                 className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl mb-4 transition-colors ${
//                   active
//                     ? "bg-white/20 text-white"
//                     : "bg-rose-100 text-rose-600 group-hover:bg-rose-200"
//                 }`}
//               >
//                 <Icon size={22} />
//               </div>
//               <h3
//                 className={`text-lg font-semibold font-display mb-1 ${
//                   active ? "text-white" : "text-gray-900"
//                 }`}
//               >
//                 {m.title}
//               </h3>
//               <p
//                 className={`text-sm leading-relaxed ${
//                   active ? "text-white/85" : "text-gray-500"
//                 }`}
//               >
//                 {m.subtitle}
//               </p>

//               {/* Progress bar */}
//               <div className="mt-4 flex items-center gap-2">
//                 <div className="flex-1 h-1.5 rounded-full bg-rose-100 overflow-hidden">
//                   <div
//                     className={`h-full rounded-full transition-all duration-500 ${
//                       progressPct === 100 ? "bg-emerald-400" : "bg-rose-400"
//                     }`}
//                     style={{ width: `${progressPct}%` }}
//                   />
//                 </div>
//                 <span className={`text-xs font-medium shrink-0 ${
//                   active ? "text-white/80" : "text-gray-400"
//                 }`}>
//                   {done}/{total}
//                 </span>
//               </div>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// };