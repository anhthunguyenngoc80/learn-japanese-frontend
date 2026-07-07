// fieldConfig.ts
export interface TargetFieldOption {
  value: string;       // dùng dot-path cho field thuộc mảng, vd "examples.content"
  label: string;
  aliases: string[];
  required?: boolean;
}

export const DEFAULT_WORD_FIELDS: TargetFieldOption[] = [
  { value: "text", label: "Từ vựng (text)", aliases: ["từ vựng", "word", "text"], required: true },
  { value: "sv_word", label: "Hán Việt (sv_word)", aliases: ["hán việt", "sv_word", "chinese"] },
  { value: "reading", label: "Cách đọc (reading)", aliases: ["cách đọc", "reading", "yomi"] },
  { value: "meaning", label: "Nghĩa (meaning)", aliases: ["nghĩa từ", "meaning"], required: true }, // bỏ alias trần "nghĩa"
  {
    value: "examples.content",
    label: "Ví dụ tiếng Nhật",
    aliases: ["ví dụ tiếng nhật", "ví dụ jp", "example jp", "例"],
  },
  {
    value: "examples.meaning",
    label: "Nghĩa ví dụ (tiếng Việt)",
    aliases: ["nghĩa ví dụ", "ví dụ tiếng việt", "example vn", "example meaning"],
  },
];

// Tách "examples.content" -> { arrayPath: "examples", arrayKey: "content" }
// Field không thuộc mảng (vd "text") -> trả về null
export function parseArrayPath(fieldValue: string): { arrayPath: string; arrayKey: string } | null {
  const dotIndex = fieldValue.indexOf(".");
  if (dotIndex === -1) return null;
  return {
    arrayPath: fieldValue.slice(0, dotIndex),
    arrayKey: fieldValue.slice(dotIndex + 1),
  };
}