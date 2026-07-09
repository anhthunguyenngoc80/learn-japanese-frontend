import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Sparkles,
  ChevronLeft,
  PenLine,
  ListChecks,
} from "lucide-react";
import { PATHS } from "../../constant";
import { Button } from "../../components";
import * as api from "../../api";
import * as models from "../../model";
import { WriteTypeModalContent } from "../learn/sections/WriteTypeModalContent";
import { useAppDispatch } from "../../store/typedHooks";
import { openModal } from "../../store/reducer/modalReducer";
import { WordCard } from "./sections/WordCard";

export const Topic = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [topics, setTopics] = useState<models.Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<models.Topic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      if (!collectionId) return;
      setLoading(true);
      try {
        const response = await api.getCollectionByIdLimit(collectionId, {
          limit: 20,
        });
        setTopics(response.data.topics);
      } catch (error) {
        console.error("Failed to fetch collection:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [collectionId]);

  useEffect(() => {
    console.log("Topics updated:", topics);
  }, [topics]);

  if (loading) {
    return (
      <div className="grow flex items-center justify-center">
        <p className="text-gray-400">Đang tải...</p>
      </div>
    );
  }

  if (!selectedTopic && topics.length > 0) {
    // Show topic list
    return (
      <div className="grow flex flex-col px-6 py-8 max-w-3xl mx-auto w-full">
        <Button
          kind="text"
          color="slate"
          size="sm"
          icon={ChevronLeft}
          iconPosition="left"
          onClick={() => navigate(PATHS.collection)}
          className="mb-6"
        >
          Quay lại
        </Button>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Danh sách chủ đề
        </h1>

        <div className="flex flex-col gap-3">
          {topics.map((topic) => (
            <Button
              key={topic.topic_id}
              onClick={() => setSelectedTopic(topic)}
              className="group w-full justify-between p-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 grid place-items-center shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-gray-800 truncate">
                  {topic.name}
                </h3>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {topic.words.length} từ
                </span>
                <div className="w-6 h-6 rounded-full bg-amber-100 grid place-items-center group-hover:bg-amber-200 transition-colors">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-amber-600"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedTopic) {
    return (
      <div className="grow flex items-center justify-center">
        <p className="text-gray-400">Không tìm thấy chủ đề nào</p>
      </div>
    );
  }

  return (
    <div className="grow flex flex-col px-6 py-8 max-w-7xl mx-auto w-full">
      {/* Back button */}
      <Button
        kind="text"
        color="slate"
        size="sm"
        icon={ChevronLeft}
        iconPosition="left"
        onClick={() => setSelectedTopic(null)}
        className="mb-6"
      >
        Quay lại
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {selectedTopic.name}
        </h1>
        <span className="text-xs text-gray-400">
          {selectedTopic.words.length} từ vựng
        </span>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button
          kind="outline"
          onClick={() =>
            navigate(PATHS.flashcardLearn(selectedTopic.topic_id), {
              state: {
                words: selectedTopic.words,
                topicName: selectedTopic.name,
              },
            })
          }
          className="group flex flex-col items-center gap-3 p-6 h-auto"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-rose-200 grid place-items-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6 text-rose-600" />
          </div>
          <span className="font-semibold text-gray-800">Học mới</span>
          <span className="text-xs text-gray-400">Học với flashcard</span>
        </Button>

        <Button
          kind="outline"
          color="indigo"
          onClick={() =>
            navigate(`/moji-goi/practice/${selectedTopic.topic_id}`)
          }
          className="group flex flex-col items-center gap-3 p-6 h-auto"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 grid place-items-center group-hover:scale-110 transition-transform">
            <ListChecks className="w-6 h-6 text-sky-600" />
          </div>
          <span className="font-semibold text-gray-800">Quiz</span>
          <span className="text-xs text-gray-400">Kiểm tra kiến thức</span>
        </Button>

        <div className="relative">
          <Button
            kind="outline"
            color="amber"
            onClick={() => {
              dispatch(
                openModal({
                  type: "custom",
                  content: <WriteTypeModalContent topic={selectedTopic} />,
                }),
              );
            }}
            className="group flex flex-col items-center gap-3 p-6 w-full h-auto"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 grid place-items-center group-hover:scale-110 transition-transform">
              <PenLine className="w-6 h-6 text-amber-600" />
            </div>
            <span className="font-semibold text-gray-800">Luyện viết</span>
            <span className="text-xs text-gray-400">Luyện viết kanji</span>
          </Button>
        </div>
      </div>

      {/* Word list */}
      <div className="flex flex-wrap justify-between gap-6 gap-y-6">
        {selectedTopic.words.map((word, index) => (
          <WordCard key={index} word={word} />
        ))}{" "}
      </div>
    </div>
  );
};
