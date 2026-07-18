// Utility to load and look up kanji in the kanjivg index
type KanjiIndex = Record<string, string[]>;

let cachedIndex: KanjiIndex | null = null;

export async function loadKanjiIndex(): Promise<KanjiIndex> {
  if (cachedIndex) return cachedIndex;
  const res = await fetch("/kanjivg/kvg-index.json");
  const data: KanjiIndex = await res.json();
  cachedIndex = data;
  return cachedIndex;
}

/**
 * Check if a character exists in the kanjivg index.
 */
export async function characterHasKanjiVG(char: string): Promise<boolean> {
  const index = await loadKanjiIndex();
  return char in index;
}

/**
 * Get the first valid SVG filename for a character from kanjivg index.
 * Prefers non-Kaisho variant (e.g., "04e14.svg" over "04e14-Kaisho.svg").
 */
export function getKanjiVGFilename(char: string): string | null {
  if (!cachedIndex) return null;
  const files = cachedIndex[char];
  if (!files || files.length === 0) return null;
  // Prefer non-Kaisho variant
  const plain = files.find((f) => !f.includes("-Kaisho"));
  return plain ?? files[0];
}

/**
 * Synchronous check after index is loaded.
 */
export function getCharacterSVGPath(char: string): string | null {
  const filename = getKanjiVGFilename(char);
  if (!filename) return null;
  return `/kanjivg/kanji/${filename}`;
}

/**
 * Load the kanjivg index and return a Set of all available characters.
 * Useful for bulk checking.
 */
export async function getAvailableKanjiSet(): Promise<Set<string>> {
  const index = await loadKanjiIndex();
  return new Set(Object.keys(index));
}