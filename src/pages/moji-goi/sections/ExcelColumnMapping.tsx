import { useState, useEffect, useMemo } from "react";
import { Settings2, Check, Plus, Trash2, AlertTriangle } from "lucide-react";

import { Button } from "../../../components";
import { DEFAULT_WORD_FIELDS, type TargetFieldOption } from "../../../constant";
import type { ColumnMapping } from "../../../utils";

interface ExcelColumnMappingProps {
  columns: string[];
  fields?: TargetFieldOption[];
  onMappingComplete: (mapping: ColumnMapping[]) => void;
  onCancel?: () => void;
}

export const ExcelColumnMapping = ({
  columns,
  fields = DEFAULT_WORD_FIELDS,
  onMappingComplete,
  onCancel,
}: ExcelColumnMappingProps) => {
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);

  // Auto-map generic fields based on column names and aliases
  useEffect(() => {
    const autoMap: ColumnMapping[] = columns.map((col) => {
      const lowerCol = col.toLowerCase();
      const matched = fields.find((f) =>
        f.aliases.some((alias) => lowerCol.includes(alias.toLowerCase()))
      );
      return { excelColumn: col, wordField: matched?.value ?? "" };
    });
    setMappings(autoMap);
  }, [columns, fields]);

  const handleFieldChange = (index: number, field: string) => {
    setMappings((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], wordField: field };
      return updated;
    });
  };

  const handleAddColumn = () => {
    setMappings((prev) => [
      ...prev,
      { excelColumn: `Cột ${prev.length + 1}`, wordField: "" },
    ]);
  };

  const handleRemoveColumn = (index: number) => {
    setMappings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleColumnNameChange = (index: number, name: string) => {
    setMappings((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], excelColumn: name };
      return updated;
    });
  };

  const mappedCount = mappings.filter((m) => m.wordField !== "").length;

  // ---- 4. Validate required fields (generic, dựa vào fields[].required) ----
  const missingRequired = useMemo(() => {
    const mappedValues = new Set(mappings.map((m) => m.wordField));
    return fields.filter((f) => f.required && !mappedValues.has(f.value));
  }, [fields, mappings]);

  const canConfirm = mappedCount > 0 && missingRequired.length === 0;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onMappingComplete(mappings);
  };

  return (
    <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="text-amber-600" size={20} />
        <h3 className="text-lg font-semibold text-gray-800">Cấu hình cột Excel</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Ánh xạ các cột trong file Excel của bạn với các trường dữ liệu.
        Chỉ các cột được ánh xạ mới được nhập vào hệ thống.
      </p>

      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-amber-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-700 w-2/5">
                Tên cột trong Excel
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 w-2/5">
                Trường dữ liệu
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700 w-1/5">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-50">
            {mappings.map((mapping, index) => (
              <tr key={index}>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={mapping.excelColumn}
                    onChange={(e) => handleColumnNameChange(index, e.target.value)}
                    placeholder="Nhập tên cột"
                    className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={mapping.wordField}
                    onChange={(e) => handleFieldChange(index, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                  >
                    <option value="">-- Không nhập --</option>
                    {fields.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                        {f.required ? " *" : ""}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleRemoveColumn(index)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition"
                    aria-label="Xóa cột"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <Button kind="soft" color="amber" size="sm" icon={Plus} iconPosition="left" onClick={handleAddColumn}>
          Thêm cột
        </Button>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200 mb-2">
        <p className="text-sm text-gray-700">
          <span className="font-medium">{mappedCount}</span> / {columns.length} cột đã được ánh xạ
        </p>
        {mappedCount > 0 && missingRequired.length === 0 && (
          <div className="flex items-center gap-1 text-emerald-600">
            <Check size={16} />
            <span className="text-xs font-medium">Sẵn sàng nhập</span>
          </div>
        )}
      </div>

      {missingRequired.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 mb-4 text-red-700 text-xs">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            Còn thiếu trường bắt buộc: {missingRequired.map((f) => f.label).join(", ")}
          </span>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button kind="text" color="slate" size="md" onClick={onCancel}>
            Hủy
          </Button>
        )}
        <Button kind="solid" color="amber" size="md" onClick={handleConfirm} disabled={!canConfirm}>
          Xác nhận và nhập dữ liệu
        </Button>
      </div>
    </div>
  );
};