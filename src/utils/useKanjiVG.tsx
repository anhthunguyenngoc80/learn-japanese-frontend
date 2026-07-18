// useKanjiVG.ts

import { useEffect, useState } from "react";
import { parse } from "svgson";

export function useKanjiVG(fileName: string | null) {
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      if (!fileName) return;
      const svgText = await fetch(`/kanjivg/kanji/${fileName}`).then(r => r.text());

      const svg = await parse(svgText);

      const result: string[] = [];

      const walk = (node: any) => {
        if (node.name === "path") {
          result.push(node.attributes.d);
        }

        node.children?.forEach(walk);
      };

      walk(svg);

      setPaths(result);
    }

    load();
  }, [fileName]);

  return paths;
}