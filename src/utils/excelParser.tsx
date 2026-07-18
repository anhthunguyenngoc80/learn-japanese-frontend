import * as XLSX from "xlsx";
import type { CreateWord } from "../model";
import { DEFAULT_WORD_FIELDS, parseArrayPath } from "../constant";

export interface ColumnMapping {
  excelColumn: string;
  wordField: string;
}

// Build 1 Word từ 1 dòng dữ liệu dạng { tênCột: giá trị }
// - Field thường (text, meaning...) -> gán thẳng
// - Field dạng "examples.xxx" -> tách theo dòng trong ô, group theo arrayKey, rồi ZIP lại theo index
//   => 1 ô chứa nhiều dòng = nhiều example, mỗi dòng content khớp với dòng meaning cùng vị trí
const buildWordFromRow = (
  row: Record<string, unknown>,
  mapping: ColumnMapping[],
): CreateWord => {
  const flat: Record<string, string> = {};
  const arrayGroups: Record<string, Record<string, string[]>> = {};
  for (const { excelColumn, wordField } of mapping) {
    if (!wordField) continue;
    const raw = String(row[excelColumn] ?? "").trim();
    const arrayInfo = parseArrayPath(wordField);

    if (arrayInfo) {
      const lines = raw.split(/\r?\n/).map((l) => l.trim());
      arrayGroups[arrayInfo.arrayPath] ??= {};
      if (arrayGroups[arrayInfo.arrayPath][arrayInfo.arrayKey] !== undefined) {
        console.warn(
          `[Cảnh báo] Nhiều cột Excel cùng được gán vào field "${wordField}" (cột "${excelColumn}" ghi đè dữ liệu cột trước). Kiểm tra lại mapping.`
        );
      }
      arrayGroups[arrayInfo.arrayPath][arrayInfo.arrayKey] = lines;
    } else {
      if (flat[wordField] !== undefined) {
        console.warn(
          `[Cảnh báo] Nhiều cột Excel cùng được gán vào field "${wordField}" (cột "${excelColumn}" ghi đè dữ liệu cột trước).`
        );
      }
      flat[wordField] = raw;
    }
  }

  const result: Record<string, unknown> = { ...flat };

  for (const [arrayPath, group] of Object.entries(arrayGroups)) {
    const keys = Object.keys(group); // vd ["content", "meaning"]
    const maxLen = Math.max(0, ...keys.map((k) => group[k].length));
    result[arrayPath] = Array.from({ length: maxLen }, (_, i) => {
      const item: Record<string, string> = {};
      for (const k of keys) item[k] = group[k][i] ?? "";
      return item;
    }).filter((item) => Object.values(item).some((v) => v)); // bỏ dòng trống hoàn toàn
  }

  if (!("examples" in result)) result.examples = [];

  return {
    text: "",
    sv_word: "",
    reading: "",
    meaning: "",
    ...result,
  } as CreateWord;
};

const applyDefaultMapping = (columns: string[]): ColumnMapping[] =>
  DEFAULT_WORD_FIELDS.map((field, i) => ({
    excelColumn: columns[i] ?? field.label,
    wordField: field.value,
  }));

const parseRows = (rows: Record<string, unknown>[], mapping?: ColumnMapping[]): CreateWord[] => {
  if (rows.length === 0) return [];
  const effectiveMapping =
    mapping && mapping.length > 0 ? mapping : applyDefaultMapping(Object.keys(rows[0]));

  return rows
    .map((row) => buildWordFromRow(row, effectiveMapping))
    .filter((item) => item.text.length > 0);
};

export const parseExcel = (data: ArrayBuffer, mapping?: ColumnMapping[]): CreateWord[] => {
  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet); // đọc theo tên cột, không theo index
  return parseRows(rows, mapping);
};

export const parseCSV = (csvText: string, mapping?: ColumnMapping[]): CreateWord[] => {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: Record<string, unknown> = {};
    headers.forEach((h, i) => (row[h] = values[i]));
    return row;
  });

  return parseRows(rows, mapping);
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current); current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
};