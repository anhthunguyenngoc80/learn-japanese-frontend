import { useState, useCallback, type DragEvent, type ChangeEvent } from "react";
import { Upload, Loader2 } from "lucide-react";

interface UploadExcelProps {
  onFileSelect: (file: File) => void;
  loading?: boolean;
}

export const UploadExcel = ({ onFileSelect, loading = false }: UploadExcelProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    const validExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setError("Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV (.csv)");
      return;
    }

    onFileSelect(file);
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    // Reset input để có thể chọn lại cùng file
    e.target.value = "";
  }, [handleFile]);

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-8 px-6 cursor-pointer transition ${
          isDragging
            ? "border-emerald-500 bg-emerald-50"
            : "border-emerald-300 bg-emerald-50/40 hover:border-emerald-500"
        } ${loading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleInputChange}
          className="hidden"
          id="excel-upload"
          disabled={loading}
        />
        <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center gap-2">
          {loading ? (
            <Loader2 className="text-emerald-600 animate-spin" size={28} />
          ) : (
            <Upload className="text-emerald-600" size={28} />
          )}
          <p className="text-sm font-medium text-gray-700">
            {loading ? "Đang xử lý..." : "Kéo & thả file Excel vào đây"}
          </p>
          <p className="text-xs text-gray-500">
            {!loading && "hoặc "}
            {!loading && (
              <span className="text-emerald-600 font-medium">bấm để chọn file</span>
            )}
          </p>
          <p className="text-[11px] text-gray-400 text-center">
            Hỗ trợ <code>.xlsx</code>, <code>.xls</code>, <code>.csv</code>
          </p>
        </label>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
      )}
    </div>
  );
};
