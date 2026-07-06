import { useState } from "react";
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

// ----------------------------- DỮ LIỆU MẪU ---------------------------------
const MOCK_WORDS: models.CreateWord[] = [
  {
    text: "単語",
    reading: "たんご",
    meaning: "từ vựng",
    examples: [],
  },
  {
    text: "勉強",
    reading: "べんきょう",
    meaning: "học tập",
    examples: [],
  },
  {
    text: "学校",
    reading: "がっこう",
    meaning: "trường học",
    examples: [],
  },
  {
    text: "先生",
    reading: "せんせい",
    meaning: "giáo viên",
    examples: [],
  },
  { text: "友達", reading: "ともだち", meaning: "bạn bè", examples: [] },
  { text: "図書館", reading: "としょかん", meaning: "thư viện", examples: [] },
];

const MOCK_TOPICS: models.CreateTopic[] = [
  { name: "Bài 1 - Chào hỏi", words: MOCK_WORDS },
  { name: "Bài 2 - Trường học", words: [] },
];

export const CreateCollection = () => {
  const [mode, setMode] = useState<models.ModeCardMode>(MODE_CARDS[0].mode);
  const [screen, setScreen] = useState<1 | 2>(1);
  const [words, setWords] = useState<models.CreateWord[]>(MOCK_WORDS);
  const [topics, setTopics] = useState<models.CreateTopic[]>(MOCK_TOPICS);

  const totalWords = words.length;

  return (
    <div className="grow flex flex-col px-6 py-8 max-w-7xl mx-auto w-full">
      <Button
        kind="ghost"
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
            mode === card.mode && <card.content words={words} topics={topics} />
          );
        })}

      {/* ============================ SCREEN 2 ============================ */}
      {screen === 2 && (
        <>
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <p className="text-sm text-amber-700 font-medium">
              Tổng cộng {totalWords} từ vựng trong{" "}
              {topics.filter((t) => t.words.length > 0).length} chủ đề.
            </p>
          </div>

          <TopicOverview />
        </>
      )}

      {screen === 1 ? (
        <div className="flex justify-end">
          <Button
            onClick={() => setScreen(2)}
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
              size="sm"
              icon={ChevronLeft}
              spacing="none"
              iconPosition="left"
              onClick={() => setScreen(1)}
            >
              Quay lại chỉnh sửa
            </Button>
            <Button
              kind="solid"
              color="amber"
              size="lg"
              spacing="md"
              radius="full"
              icon={Save}
              iconPosition="left"
            >
              Lưu bộ từ vựng
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
};
