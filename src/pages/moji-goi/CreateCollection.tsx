import { useEffect, useState } from "react";
import {
  Save,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Layers,
  Rows3,
} from "lucide-react";
import { Button } from "../../components";
import {
  ModeCard,
  ParallelMode,
  TopicFirstMode,
  TopicOverview,
  VocabFirstMode,
} from "./sections";
import type * as models from "../../model";
import { parseExcel, parseCSV, mergeWordsAndTopics } from "../../utils";
import { createCollection } from "../../api";

const MODE_CARDS: models.ModeCard[] = [
  {
    mode: "vocab-first",
    icon: ListOrdered,
    title: "Từ vựng trước, chủ đề sau",
    description:
      "Nhập từ vựng, xem trước, rồi gán chủ đề theo khoảng số hoặc từng từ.",
    content: VocabFirstMode,
  },
  {
    mode: "topic-first",
    icon: Layers,
    title: "Chủ đề trước, từ vựng sau",
    description: "Tạo danh sách chủ đề, rồi nhập từ cho từng chủ đề.",
    content: TopicFirstMode,
  },
  {
    mode: "parallel",
    icon: Rows3,
    title: "Nhập song song",
    description: "Nhập từ và gán chủ đề cho từng từ cùng lúc.",
    content: ParallelMode,
  },
];

export const CreateCollection = () => {
  const [mode, setMode] = useState<models.ModeCardMode>(MODE_CARDS[0].mode);
  const [screen, setScreen] = useState<1 | 2>(1);
  const [words, setWords] = useState<models.CreateWord[]>([]);
  const [topics, setTopics] = useState<models.CreateTopic[]>([]);
  const [collectionName, setCollectionName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddTopic = (name: string) => {
    setTopics((prev) => [...prev, { name, words: [] }]);
  };

  const handleDeleteTopic = (index: number) => {
    setTopics((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateTopic = (topicIndex: number, wordIndices: number[]) => {
    setTopics((prev) => {
      const updated = [...prev];
      const selectedWords = wordIndices
        .filter((i) => i >= 0 && i < words.length)
        .map((i) => words[i]);
      updated[topicIndex] = { ...updated[topicIndex], words: selectedWords };
      return updated;
    });
  };

  const handleDeleteWord = (index: number) => {
    setWords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditWord = (index: number, updatedWord: models.CreateWord) => {
    setWords((prev) => {
      const updated = [...prev];
      updated[index] = updatedWord;
      return updated;
    });
  };

  const handleFileUpload = async (
    file: File,
    parsedWords?: models.CreateWord[],
  ) => {
    setIsUploading(true);
    try {
      let newWords: models.CreateWord[];

      // If parsed words are provided (from child with column mapping), use them
      if (parsedWords && parsedWords.length > 0) {
        newWords = parsedWords;
      } else {
        // Otherwise, parse the file with default mapping
        const arrayBuffer = await file.arrayBuffer();
        const fileExtension = file.name
          .substring(file.name.lastIndexOf("."))
          .toLowerCase();

        if (fileExtension === ".csv") {
          const text = await file.text();
          newWords = parseCSV(text);
        } else {
          newWords = parseExcel(arrayBuffer);
        }
      }

      if (newWords.length > 0) {
        setWords((prev) => [...prev, ...newWords]);
      }
    } catch (err) {
      console.error("Error parsing file:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!collectionName.trim()) {
      alert("Vui lòng nhập tên bộ sưu tập");
      return;
    }

    setIsSaving(true);
    try {
      // Build topics array: existing topics + unclassified words as one topic
      const allTopics = [...topics];

      // Add unclassified words as a topic if there are any
      if (words.length > 0) {
        allTopics.push({
          name: "Chưa phân loại",
          words: [...words],
        });
      }

      const payload = {
        name: collectionName.trim(),
        topics: allTopics.map((t) => ({
          name: t.name,
          words: t.words.map((w) => ({
            text: w.text,
            sv_word: w.sv_word,
            reading: w.reading,
            meaning: w.meaning,
            partOfSpeech: w.partOfSpeech,
            examples: w.examples.map((e) => ({
              content: e.content,
              meaning: e.meaning,
            })),
          })),
        })),
      };

      const response = await createCollection(payload);
      console.log("Collection created:", response);
      alert("Lưu bộ từ vựng thành công!");
    } catch (err) {
      console.error("Error saving collection:", err);
      alert("Có lỗi xảy ra khi lưu bộ từ vựng. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    console.log("Current words:", words);
  }, [words]);

  return (
    <div className="grow flex flex-col px-6 py-8 max-w-7xl mx-auto w-full">
      <Button
        kind="text"
        color="slate"
        size="sm"
        icon={ChevronLeft}
        spacing="none"
        iconPosition="left"
        className="mb-6 w-fit"
      >
        Quay lại
      </Button>

      <div className="mb-6 max-w-md">
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
          Tên bộ sưu tập
        </label>
        <input
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
          placeholder="Ví dụ: Từ vựng N3 - Bài 1"
          className="w-full px-4 py-2.5 rounded-xl border border-amber-200 bg-white text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
        />
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Nhập từ vựng và chủ đề
      </h1>

      {screen === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {MODE_CARDS.map((card) => {
            return (
              <ModeCard
                key={card.mode}
                icon={<card.icon size={16} />}
                title={card.title}
                description={card.description}
                selected={mode === card.mode}
                onClick={() => setMode(card.mode)}
              />
            );
          })}
        </div>
      )}

      {/* ============================ SCREEN 1 — vocab-first ============================ */}
      {screen === 1 &&
        MODE_CARDS.map((card) => {
          return (
            mode === card.mode && (
              <card.content
                key={card.mode}
                words={words}
                topics={topics}
                onFileUpload={handleFileUpload}
                isUploading={isUploading}
                onAddTopic={handleAddTopic}
                onDeleteTopic={handleDeleteTopic}
                onUpdateTopic={handleUpdateTopic}
                onDeleteWord={handleDeleteWord}
                onEditWord={handleEditWord}
              />
            )
          );
        })}

      {/* ============================ SCREEN 2 ============================ */}
      {screen === 2 && <TopicOverview topics={topics} words={words} />}

      {screen === 1 ? (
        <div className="flex justify-end">
          <Button
            onClick={() => {
              const merged = mergeWordsAndTopics(words, topics);
              setTopics(merged.topics);
              setWords(merged.words);
              setScreen(2);
            }}
            kind="solid"
            color="amber"
            size="lg"
            spacing="md"
            radius="full"
            icon={ChevronRight}
            iconPosition="right"
          >
            Xem trước toàn diện
          </Button>
        </div>
      ) : screen === 2 ? (
        <>
          <div className="flex items-center justify-between mt-8">
            <Button
              kind="text"
              color="slate"
              size="sm"
              icon={ChevronLeft}
              spacing="none"
              iconPosition="left"
              onClick={() => setScreen(1)}
            >
              Quay lại chỉnh sửa
            </Button>
            <Button
              disabled={isSaving}
              onClick={handleSave}
              kind="solid"
              color="amber"
              size="lg"
              spacing="md"
              radius="full"
              icon={Save}
              iconPosition="left"
            >
              {isSaving ? "Đang lưu..." : "Lưu bộ từ vựng"}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
};
