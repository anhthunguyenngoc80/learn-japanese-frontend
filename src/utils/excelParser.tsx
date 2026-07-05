import * as XLSX from "xlsx";
import type { Example, Word } from "../model";

type CreateExample = Omit<Example, "example_id" | "word_id">;
type CreateWord = Omit<Word, "word_id" | "topic_id" | "examples"> & {
  examples: CreateExample[];
};

const parseExamples = (jp: unknown, vn: unknown): CreateExample[] => {
  const jpLines = String(jp ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim());

  const vnLines = String(vn ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim());

  const length = Math.max(jpLines.length, vnLines.length);

  return Array.from({ length }, (_, i) => ({
    content: jpLines[i] ?? "",
    meaning: vnLines[i] ?? "",
  })).filter((example) => example.content || example.meaning);
};

const createWord = (row: unknown[]): CreateWord => ({
  text: String(row[1] ?? "").trim(),
  sv_word: "",
  reading: String(row[2] ?? "").trim(),
  meaning: String(row[3] ?? "").trim(),
  examples: parseExamples(row[4], row[5]),
});

const parseRows = (rows: unknown[][]): CreateWord[] =>
  rows
    .slice(1)
    .filter((row) => row.length >= 4)
    .map(createWord)
    .filter((item) => item.text.length > 0);

export const parseText = (raw: string): CreateWord[] =>
  raw
    .split(/\n\s*\n/)
    .map((block): CreateWord | null => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      const [
        text = "",
        reading = "",
        meaning = "",
        exampleJp = "",
        exampleVn = "",
      ] = trimmed.split("|").map((s) => s.trim());

      return {
        text,
        sv_word: "",
        reading,
        meaning,
        examples: parseExamples(exampleJp, exampleVn),
      };
    })
    .filter((item): item is CreateWord => item !== null);

export const parseExcel = (data: ArrayBuffer): CreateWord[] => {
  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
  });

  return parseRows(rows);
};

export const parseCSV = (csvText: string): CreateWord[] => {
  const rows = csvText
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map(parseCSVLine);

  return parseRows(rows);
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
};
