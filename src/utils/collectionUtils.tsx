import type { CreateTopic, CreateWord } from "../model";

/**
 * Gộp words và topics:
 * - Trong `topics[].words`, mỗi phần tử chỉ chứa `text` (chưa đầy đủ dữ liệu).
 * - Dùng `text` để tìm object CreateWord đầy đủ trong mảng `words` gốc.
 * - Trả về topics đã có words đầy đủ, và words còn lại là những từ
 *   CHƯA được gán vào topic nào.
 */
export function mergeWordsAndTopics(
  words: CreateWord[],
  topics: CreateTopic[]
): { topics: CreateTopic[]; words: CreateWord[] } {
  // Map: text -> CreateWord đầy đủ, để tra cứu O(1)
  const wordMap = new Map<string, CreateWord>();
  for (const w of words) {
    wordMap.set(w.text, w);
  }

  // Tập hợp các text đã được gán vào topic nào đó
  const assignedTexts = new Set<string>();

  const mergedTopics: CreateTopic[] = topics.map((topic) => {
    const fullWords: CreateWord[] = topic.words
      .map((w) => {
        const full = wordMap.get(w.text);
        if (full) {
          assignedTexts.add(w.text);
          return full;
        }
        // Không tìm thấy dữ liệu đầy đủ -> giữ nguyên (fallback)
        return w;
      });

    return {
      ...topic,
      words: fullWords,
    };
  });

  // Words còn lại = những từ chưa được gán vào topic nào
  const remainingWords = words.filter((w) => !assignedTexts.has(w.text));

  return {
    topics: mergedTopics,
    words: remainingWords,
  };
}