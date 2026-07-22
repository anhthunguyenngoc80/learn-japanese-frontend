import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Save,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";

import { Button, UploadExcel } from "../../components";
import { ExcelColumnMapping } from "./sections/ExcelColumnMapping";
import { WordDiffTable, type WordDiff } from "./sections/WordDiffTable";
import { parseExcel, parseCSV, type ColumnMapping } from "../../utils";
import * as api from "../../api";
import { PATHS } from "../../constant";
import type { Word } from "../../model";

/** So sánh 2 từ để xác định có khớp nhau không (dựa vào text + reading) */
const isSameWord = (a: { text: string; reading?: string }, b: { text: string; reading?: string }) =>
  a.text === b.text && (a.reading || "") === (b.reading || "");

/** Tìm những trường khác nhau giữa old và new */
const getChangedFields = (
  oldWord: Word,
  newWord: Record<string, unknown>,
): string[] => {
  const fields = ["text", "reading", "meaning", "sv_word", "partOfSpeech"] as const;
  const changed: string[] = [];
  for (const f of fields) {
    const oldVal = String(oldWord[f] ?? "").trim();
    const newVal = String(newWord[f] ?? "").trim();
    if (oldVal !== newVal) changed.push(f);
  }

  // So sánh examples
  const oldExamples = oldWord.examples ?? [];
  const newExamples = (newWord.examples as any[]) ?? [];
  const oldExStr = JSON.stringify(oldExamples.map((e) => ({ content: e.content, meaning: e.meaning })));
  const newExStr = JSON.stringify(newExamples.map((e) => ({ content: e.content, meaning: e.meaning })));
  if (oldExStr !== newExStr) changed.push("examples");

  return changed;
};

/** Tạo danh sách WordDiff từ words cũ và mới */
const computeDiffs = (
  oldWords: Word[],
  newWords: { text: string; reading?: string; meaning: string; sv_word?: string; partOfSpeech?: string; examples?: { content: string; meaning?: string }[] }[],
): WordDiff[] => {
  const diffs: WordDiff[] = [];
  const usedOldIndices = new Set<number>();

  for (let ni = 0; ni < newWords.length; ni++) {
    const nw = newWords[ni];
    let matched = false;

    for (let oi = 0; oi < oldWords.length; oi++) {
      if (usedOldIndices.has(oi)) continue;
      if (!isSameWord(oldWords[oi], nw)) continue;

      const changedFields = getChangedFields(oldWords[oi], nw as unknown as Record<string, unknown>);
      usedOldIndices.add(oi);

      if (changedFields.length > 0) {
        diffs.push({
          status: "modified",
          oldIndex: oi,
          newIndex: ni,
          oldWord: oldWords[oi],
          newWord: nw as Word,
          changedFields,
        });
      }
      matched = true;
      break;
    }

    if (!matched) {
      diffs.push({
        status: "added",
        newIndex: ni,
        newWord: nw as Word,
      });
    }
  }

  for (let oi = 0; oi < oldWords.length; oi++) {
    if (!usedOldIndices.has(oi)) {
      diffs.push({
        status: "removed",
        oldIndex: oi,
        oldWord: oldWords[oi],
      });
    }
  }

  return diffs;
};

/** Đọc tên cột gốc từ file Excel mà không parse dữ liệu */
const readExcelColumns = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
        if (rows.length > 0) {
          const headers = (rows[0] as Array<unknown>).map((h) => String(h ?? ""));
          resolve(headers);
        } else {
          resolve([]);
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

/** Đọc tên cột từ CSV */
const readCSVColumns = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const firstLine = text.split(/\r?\n/)[0];
        if (firstLine) {
          resolve(firstLine.split(",").map((h) => h.replace(/^"|"$/g, "").trim()));
        } else {
          resolve([]);
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export const UpdateTopic = () => {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const [topic, setTopic] = useState<{ name: string; words: Word[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [diffs, setDiffs] = useState<WordDiff[]>([]);
  const [acceptedChanges, setAcceptedChanges] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasFileUploaded, setHasFileUploaded] = useState(false);

  // Trạng thái cho mapping
  const [showMapping, setShowMapping] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);

  // Fetch topic hiện tại
  useEffect(() => {
    if (!topicId) return;
    const fetchTopic = async () => {
      try {
        const response = await api.getTopicById(topicId, { limit: 5000 });
        setTopic({
          name: response.data.name,
          words: response.data.words,
        });
      } catch (error) {
        console.error("Failed to fetch topic:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopic();
  }, [topicId]);

  // Parse file với mapping đã chọn
  const parseWithMapping = useCallback(
    async (file: File, mapping: ColumnMapping[]) => {
      setIsProcessing(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const fileExtension = file.name
          .substring(file.name.lastIndexOf("."))
          .toLowerCase();

        let parsed: {
          text: string;
          reading?: string;
          meaning: string;
          sv_word?: string;
          partOfSpeech?: string;
          examples?: { content: string; meaning?: string }[];
        }[];

        if (fileExtension === ".csv") {
          const text = await file.text();
          parsed = parseCSV(text, mapping);
        } else {
          parsed = parseExcel(arrayBuffer, mapping);
        }

        if (parsed.length === 0) {
          alert("Không tìm thấy dữ liệu từ vựng trong file.");
          setIsProcessing(false);
          return;
        }

        if (!topic) return;
        const computed = computeDiffs(topic.words, parsed);
        setDiffs(computed);
        setAcceptedChanges(new Set());
        setHasFileUploaded(true);
        setShowMapping(false);
        setPendingFile(null);
      } catch (error) {
        console.error("Error parsing file:", error);
        alert("Có lỗi khi đọc file. Vui lòng kiểm tra lại định dạng.");
      } finally {
        setIsProcessing(false);
      }
    },
    [topic],
  );

  // Upload file -> đọc tên cột -> show mapping
  const handleFileSelect = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      try {
        const fileExtension = file.name
          .substring(file.name.lastIndexOf("."))
          .toLowerCase();

        let columns: string[];
        if (fileExtension === ".csv") {
          columns = await readCSVColumns(file);
        } else {
          columns = await readExcelColumns(file);
        }

        if (columns.length === 0) {
          alert("Không tìm thấy cột dữ liệu trong file.");
          setIsProcessing(false);
          return;
        }

        setPendingFile(file);
        setExcelColumns(columns);
        setShowMapping(true);
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Có lỗi khi đọc file. Vui lòng kiểm tra lại định dạng.");
      } finally {
        setIsProcessing(false);
      }
    },
    [],
  );

  // Khi mapping hoàn tất
  const handleMappingComplete = useCallback(
    (mapping: ColumnMapping[]) => {
      if (pendingFile) {
        parseWithMapping(pendingFile, mapping);
      }
    },
    [pendingFile, parseWithMapping],
  );

  const handleMappingCancel = useCallback(() => {
    setShowMapping(false);
    setPendingFile(null);
  }, []);

  // Toggle accept/decline 1 diff
  const handleToggleAccept = useCallback((diffIndex: number) => {
    setAcceptedChanges((prev) => {
      const next = new Set(prev);
      if (next.has(diffIndex)) {
        next.delete(diffIndex);
      } else {
        next.add(diffIndex);
      }
      return next;
    });
  }, []);

  // Accept tất cả
  const handleAcceptAll = useCallback(() => {
    setAcceptedChanges(new Set(diffs.map((_, i) => i)));
  }, [diffs]);

  // Decline tất cả
  const handleDeclineAll = useCallback(() => {
    setAcceptedChanges(new Set());
  }, []);

  const normalizeExamples = (
    examples: any,
  ): { example_id?: string; content: string; meaning?: string }[] => {
    if (!examples || !Array.isArray(examples)) return [];
    return examples.map((ex: any) => ({
      example_id: ex.example_id,
      content: String(ex.content ?? "").trim(),
      meaning: ex.meaning ? String(ex.meaning).trim() : undefined,
    }));
  };

  // Lưu thay đổi được chấp nhận
  const syncExamples = useCallback(
    async (
      wordId: string,
      oldExamples: any[],
      newExamples: any[],
    ): Promise<void> => {
      const oldNorm = normalizeExamples(oldExamples);
      const newNorm = normalizeExamples(newExamples);

      const oldByContent = new Map<string, { example_id?: string; content: string; meaning?: string }>();
      oldNorm.forEach((ex) => oldByContent.set(ex.content, ex));

      const newByContent = new Map<string, { example_id?: string; content: string; meaning?: string }>();
      newNorm.forEach((ex) => newByContent.set(ex.content, ex));

      // Add new examples
      const toAdd = newNorm.filter((ex) => !oldByContent.has(ex.content));
      if (toAdd.length > 0) {
        await api.addExamples(wordId, toAdd.map((ex) => ({ content: ex.content, meaning: ex.meaning })));
      }

      // Update changed examples
      const toUpdate = newNorm.filter((ex) => {
        const oldEx = oldByContent.get(ex.content);
        return !!oldEx && oldEx.meaning !== ex.meaning && !!oldEx.example_id;
      }).map((ex) => {
        const oldEx = oldByContent.get(ex.content)!;
        return { example_id: oldEx.example_id!, content: ex.content, meaning: ex.meaning };
      });
      if (toUpdate.length > 0) {
        await api.updateExamples(toUpdate);
      }

      // Delete removed examples
      const toDelete = oldNorm.filter((ex) => !newByContent.has(ex.content) && !!ex.example_id);
      for (const ex of toDelete) {
        await api.deleteExample(ex.example_id as string);
      }
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!topicId) return;

    const acceptedDiffs = diffs.filter((_, i) => acceptedChanges.has(i));
    if (acceptedDiffs.length === 0) {
      alert("Không có thay đổi nào để lưu.");
      return;
    }

    const wordsToAdd: {
      text: string;
      reading?: string;
      meaning: string;
      sv_word?: string;
      partOfSpeech?: string;
      examples: { content: string; meaning?: string }[];
    }[] = [];

    const wordsToUpdate: {
      word_id: string;
      text: string;
      reading?: string;
      meaning: string;
      sv_word?: string;
      partOfSpeech?: string;
      examples: { content: string; meaning?: string }[];
    }[] = [];

    const wordIdsToRemove: string[] = [];

    // Ghi nhớ examples để xử lý sau khi tạo/cập nhật từ
    const pendingAddedExamples = new Map<string, { content: string; meaning?: string }[]>();

    for (const diff of acceptedDiffs) {
      if (diff.status === "added" && diff.newWord) {
        const newExs = normalizeExamples((diff.newWord as any).examples);
        wordsToAdd.push({
          text: diff.newWord.text ?? "",
          reading: diff.newWord.reading,
          meaning: diff.newWord.meaning ?? "",
          sv_word: diff.newWord.sv_word,
          partOfSpeech: diff.newWord.partOfSpeech,
          examples: [],
        });
        pendingAddedExamples.set(diff.newWord.text ?? "", newExs);
      } else if (diff.status === "modified" && diff.newWord && diff.oldWord) {
        wordsToUpdate.push({
          word_id: diff.oldWord.word_id,
          text: diff.newWord.text ?? "",
          reading: diff.newWord.reading,
          meaning: diff.newWord.meaning ?? "",
          sv_word: diff.newWord.sv_word,
          partOfSpeech: diff.newWord.partOfSpeech,
          examples: [],
        });
      } else if (diff.status === "removed" && diff.oldWord) {
        wordIdsToRemove.push(diff.oldWord.word_id);
      }
    }

    setIsSaving(true);
    try {
      // 1. Thêm từ mới (không gửi examples)
      if (wordsToAdd.length > 0) {
        const created = await api.updateWords(topicId, {
          words: wordsToAdd as any,
        });
        // Sau khi thêm từ, thêm examples riêng
        const createdWords = created.data;
        for (let i = 0; i < createdWords.length; i++) {
          const newWord = wordsToAdd[i];
          const examples = pendingAddedExamples.get(newWord.text ?? "") ?? [];
          for (const ex of examples) {
            await api.addExamples(createdWords[i].word_id, [{ content: ex.content, meaning: ex.meaning }]);
          }
        }
      }

      // 2. Cập nhật từ đã có (không gửi examples)
      if (wordsToUpdate.length > 0) {
        await api.replaceWords({ words: wordsToUpdate as any });
      }

      // 3. Xóa từ (ví dụ cũ sẽ bị xóa theo do có cascade?)
      for (const wordId of wordIdsToRemove) {
        await api.deleteWord(wordId);
      }

      // 4. Cập nhật examples cho các từ đã sửa (gọi API riêng)
      for (const diff of acceptedDiffs) {
        if (diff.status === "modified" && diff.newWord && diff.oldWord) {
          await syncExamples(
            diff.oldWord.word_id,
            (diff.oldWord.examples ?? []) as any[],
            (diff.newWord as any).examples ?? [],
          );
        }
      }

      alert("Cập nhật từ vựng thành công!");
      navigate(PATHS.topic(topicId));
    } catch (error) {
      console.error("Failed to update words:", error);
      alert("Có lỗi xảy ra khi lưu. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  }, [topicId, diffs, acceptedChanges, navigate, syncExamples]);

  if (isLoading) {
    return (
      <div className="grow flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="grow flex flex-col items-center justify-center gap-4 px-6 py-8">
        <p className="text-gray-500">Không tìm thấy chủ đề từ vựng</p>
        <Button
          kind="outline"
          color="slate"
          size="sm"
          onClick={() => navigate(-1)}
        >
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="grow flex flex-col px-6 py-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          kind="text"
          color="slate"
          size="sm"
          icon={ChevronLeft}
          spacing="none"
          iconPosition="left"
          className="w-fit"
          onClick={() => navigate(PATHS.topic(topicId))}
        >
          Quay lại
        </Button>
        {hasFileUploaded && (
          <Button
            kind="solid"
            color="rose"
            size="lg"
            spacing="md"
            radius="full"
            icon={Save}
            iconPosition="left"
            onClick={handleSave}
            disabled={isSaving || acceptedChanges.size === 0}
          >
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        )}
      </div>

      {/* Tiêu đề */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Cập nhật chủ đề: {topic.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Hiện có {topic.words.length} từ vựng. Tải lên file Excel để cập nhật.
        </p>
      </div>

      {/* Khu vực upload file (chỉ hiện khi chưa upload và không show mapping) */}
      {!hasFileUploaded && !showMapping && (
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-rose-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Tải lên file Excel
            </h2>
          </div>
          <p className="mb-4 text-sm text-gray-500">
            File Excel cần có các cột: text, reading, meaning, sv_word, partOfSpeech, examples...
            Hệ thống sẽ so sánh với danh sách hiện tại và hiển thị các thay đổi.
          </p>
          <UploadExcel onFileSelect={handleFileSelect} loading={isProcessing} />
        </div>
      )}

      {/* Khu vực mapping cột */}
      {showMapping && excelColumns.length > 0 && (
        <div className="mb-8">
          <ExcelColumnMapping
            columns={excelColumns}
            onMappingComplete={handleMappingComplete}
            onCancel={handleMappingCancel}
          />
        </div>
      )}

      {/* Khu vực upload lại file (khi đã upload) */}
      {hasFileUploaded && (
        <div className="mb-6">
          <Button
            kind="outline"
            color="slate"
            size="sm"
            icon={Upload}
            iconPosition="left"
            onClick={() => {
              setHasFileUploaded(false);
              setDiffs([]);
              setAcceptedChanges(new Set());
              setShowMapping(false);
              setPendingFile(null);
            }}
          >
            Tải lên file khác
          </Button>
        </div>
      )}

      {/* Khu vực hiển thị từ hiện tại */}
      {!hasFileUploaded && !showMapping && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            Từ vựng hiện tại ({topic.words.length} từ)
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {topic.words.map((word) => (
              <div
                key={word.word_id}
                className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
              >
                <p className="font-bold text-gray-900">{word.text}</p>
                {word.reading && (
                  <p className="text-sm text-gray-500">{word.reading}</p>
                )}
                <p className="mt-1 text-sm text-gray-700">{word.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diff table */}
      {hasFileUploaded && diffs.length > 0 && (
        <div className="mt-2">
          <WordDiffTable
            diffs={diffs}
            acceptedChanges={acceptedChanges}
            onToggleAccept={handleToggleAccept}
            onAcceptAll={handleAcceptAll}
            onDeclineAll={handleDeclineAll}
          />
        </div>
      )}

      {/* Trường hợp không có thay đổi */}
      {hasFileUploaded && diffs.length === 0 && !isProcessing && (
        <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 py-12 text-center">
          <p className="text-lg font-medium text-emerald-700">
            Không có thay đổi nào
          </p>
          <p className="mt-1 text-sm text-emerald-600">
            Dữ liệu trong file Excel hoàn toàn trùng khớp với danh sách hiện tại.
          </p>
        </div>
      )}
    </div>
  );
};