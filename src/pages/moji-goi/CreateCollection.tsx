import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import * as api from "../../api";
import { PATHS } from "../../constant";

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
  const navigate = useNavigate();
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
    // 1. Build danh sách topic đầy đủ: topics hiện có + từ chưa phân loại (nếu có)
    const allTopics = [...topics];
    if (words.length > 0) {
      allTopics.push({ name: "Chưa phân loại", words: [...words] });
    }

    if (allTopics.length === 0) {
      alert("Chưa có dữ liệu từ vựng để lưu");
      setIsSaving(false);
      return;
    }

    // 2. Tạo collection + topics RỖNG (chỉ gửi tên topic, không gửi words)
    const { data: createdCollection } = await api.createCollection({
      name: collectionName.trim(),
      visibility: "public",
      topics: allTopics.map((t) => ({ name: t.name, words: [] })),
    });

    // 3. Lấy danh sách topics từ collection vừa tạo
    const { data: fetchedTopics } = await api.getTopics(createdCollection.collection_id);

    // 4. Map tên topic -> topic_id
    const topicIdByName = new Map(
      fetchedTopics.map((t) => [t.name, t.topic_id]),
    );

    // 4. Chia words của từng topic thành batch nhỏ
    const BATCH_SIZE = 50;
    const batchJobs: { topicId: string; words: models.CreateWord[] }[] = [];

    allTopics.forEach((topic) => {
      const topicId = topicIdByName.get(topic.name);
      if (!topicId) {
        console.warn(`Không tìm thấy topic_id cho topic "${topic.name}"`);
        return;
      }

      for (let i = 0; i < topic.words.length; i += BATCH_SIZE) {
        const batchWords = topic.words.slice(i, i + BATCH_SIZE).map((w) => ({
          text: w.text,
          sv_word: w.sv_word,
          reading: w.reading,
          meaning: w.meaning,
          partOfSpeech: w.partOfSpeech,
          examples: w.examples.map((e) => ({
            content: e.content,
            meaning: e.meaning,
          })),
        }));
        batchJobs.push({ topicId, words: batchWords });
      }
    });

    // 5. Gửi TUẦN TỰ từng batch vào đúng topic
    for (let i = 0; i < batchJobs.length; i++) {
      const { topicId, words: batchWords } = batchJobs[i];
      await api.updateWords(topicId, { words: batchWords });
    }

    alert("Lưu bộ từ vựng thành công!");
    navigate(PATHS.collections);
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

      {/* ============================ SCREEN 1 — selected mode ============================ */}
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
