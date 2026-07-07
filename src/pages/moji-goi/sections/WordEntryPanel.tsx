import { useState, useEffect } from "react";
import { Button, IconButton } from "../../../components";
import { Plus, Settings2 } from "lucide-react";
import { UploadExcel } from "../../../components/UploadExcel";
import { useExcelColumnMappingModal } from "./ExcelColumnMappingModal";
import { parseExcel, parseCSV, type ColumnMapping } from "../../../utils/excelParser";
import type { CreateWord } from "../../../model";

interface WordEntryPanelProps {
  onFileSelect?: (file: File, words?: CreateWord[]) => void;
  loading?: boolean;
  showMappingConfig?: boolean;
  onMappingConfigClose?: () => void;
}

type UploadStep = "upload" | "configure" | "complete";

export const WordEntryPanel = ({ onFileSelect, loading, showMappingConfig: externalShowMappingConfig, onMappingConfigClose }: WordEntryPanelProps) => {
  const { open: openExcelModal } = useExcelColumnMappingModal();
  const [step, setStep] = useState<UploadStep>("upload");
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [internalShowMappingConfig, setInternalShowMappingConfig] = useState(false);

  // Use external control if provided, otherwise use internal state
  const showMappingConfig = externalShowMappingConfig ?? internalShowMappingConfig;

  const handleFileWithMapping = async (file: File, mapping: ColumnMapping[]) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      let newWords: CreateWord[];

      const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

      if (fileExtension === ".csv") {
        const text = await file.text();
        newWords = parseCSV(text, mapping);
      } else {
        newWords = parseExcel(arrayBuffer, mapping);
      }

      console.log("Parsed words with mapping:", newWords); // Debug log

      if (onFileSelect) {
        // Pass both file and parsed words to parent
        onFileSelect(file, newWords);
      }
    } catch (err) {
      console.error("Error parsing file with mapping:", err);
    } finally {
      setStep("upload");
      setExcelColumns([]);
      setColumnMapping([]);
    }
  };

  useEffect(() => {
    // This effect is no longer needed for file processing
    // Kept for any other side effects if needed
  }, [step, pendingFile, columnMapping, handleFileWithMapping, onFileSelect]);

  const handleFileSelect = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

      let columns: string[] = [];

      if (fileExtension === ".csv") {
        const text = await file.text();
        const firstLine = text.split(/\r?\n/)[0];
        columns = firstLine.split(",").map((col) => col.trim().replace(/^["']|["']$/g, ""));
      } else {
        const workbook = (await import("xlsx")).read(arrayBuffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = (await import("xlsx")).utils.sheet_to_json<unknown[]>(sheet, {
          header: 1,
        });
        if (rows.length > 0) {
          columns = (rows[0] as unknown[]).map((col) => String(col).trim());
        }
      }

      if (columns.length > 0) {
        setExcelColumns(columns);
        setPendingFile(file);
        setStep("configure");
      }
    } catch (err) {
      console.error("Error reading file columns:", err);
    }
  };

  const handleMappingComplete = (mapping: ColumnMapping[], file?: File) => {
    // Process file immediately with the mapping to avoid race condition
    const fileToProcess = file || pendingFile;
    if (fileToProcess) {
      handleFileWithMapping(fileToProcess, mapping);
    }
  };

  const handleCancel = () => {
    setStep("upload");
    setExcelColumns([]);
    setColumnMapping([]);
    setPendingFile(null);
    setInternalShowMappingConfig(false);
    onMappingConfigClose?.();
  };

  const handleMappingConfigClose = () => {
    setInternalShowMappingConfig(false);
    onMappingConfigClose?.();
  };

  const handleModalMappingComplete = (mapping: ColumnMapping[], file?: File) => {
    // Store mapping for potential future use
    setColumnMapping(mapping);
    setInternalShowMappingConfig(false);
    onMappingConfigClose?.();
    // Process file if provided
    if (file) {
      handleFileWithMapping(file, mapping);
    }
  };

  // Open modal when step changes to configure
  useEffect(() => {
    if (step === "configure" && excelColumns.length > 0) {
      openExcelModal({
        columns: excelColumns,
        onMappingComplete: handleMappingComplete,
        onCancel: handleCancel,
        file: pendingFile || undefined,
      });
    }
  }, [step, excelColumns]);

  // Open modal when showMappingConfig changes to true
  useEffect(() => {
    if (showMappingConfig) {
      openExcelModal({
        columns: [],
        onMappingComplete: handleModalMappingComplete,
        onCancel: handleMappingConfigClose,
        file: pendingFile || undefined,
      });
    }
  }, [showMappingConfig]);

  return (
    <div>
      {step === "upload" && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-gray-400 whitespace-nowrap">
              Cột: Từ • Hán Việt • Cách đọc • Nghĩa • Ví dụ (dòng đầu là tên cột)
            </p>
            <IconButton
              aria-label="Cài đặt cột Excel"
              icon={Settings2}
              size="sm"
              kind="ghost"
              color="slate"
              onClick={() => setInternalShowMappingConfig(true)}
              className="!p-1"
            />
          </div>

          <UploadExcel onFileSelect={handleFileSelect} loading={loading} />
        </div>
      )}

      {/* Modals are now controlled via Redux and rendered globally in App.tsx */}

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
          Hoặc nhập từ vựng (dạng văn bản)
        </label>

        <p className="mt-2 text-xs text-gray-500 text-left leading-relaxed">
          <span className="font-medium">Chú thích:</span> Mỗi từ cách nhau bởi một
          dòng trống. Các trường được phân tách bằng dấu{" "}
          <code className="font-mono text-amber-600">|</code>. Ví dụ:{" "}
          <code className="font-mono text-amber-600">
            単語 | 漢字 | よみ | 意味 | 例文
          </code>
        </p>

        <textarea
          placeholder="Dán nội dung từ vựng vào đây...

Ví dụ: 単語 | 漢字 | よみ | 意味 | 例文"
          rows={6}
          className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition resize-y font-mono"
        />

        <Button
          kind="soft"
          color="amber"
          size="sm"
          spacing="sm"
          radius="full"
          icon={Plus}
          iconPosition="left"
        >
          Phân tích
        </Button>
      </div>
    </div>
  );
};
