import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, ListChecks, Pencil, PenLine, Share2, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button, Card } from "../../components";
import { PATHS } from "../../constant";
import * as models from "../../model";
import { openModal, useAppDispatch } from "../../store";
import { WriteTypeModalContent } from "../learn/sections/WriteTypeModalContent";
import { WordCard } from "./sections/WordCard";
import * as api from "../../api";
import { CollectionLayout } from "./sections";

export const Topic = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch();
  const { topicId } = useParams();
  const [topic, setTopic] = useState<models.Topic | null>(null)

  useEffect(() => {
    if (!topicId) {
      setTopic(null);
      return;
    }

    // Fallback: call API to fetch topic by ID
    const fetchTopic = async () => {
      try {
        const response = await api.getTopicById(topicId, { limit: 20 });
        setTopic(response.data);
      } catch (error) {
        console.error("Failed to fetch topic:", error);
        setTopic(null);
      }
    };
    fetchTopic();
  }, [topicId]);

  const handleDelete = async (topicId?: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa bộ từ vựng này?") || !topicId) return;

    try {
      await api.deleteTopic(topicId);
      navigate(PATHS.collection(topic?.collection_id))
      alert("Xóa bộ từ vựng thành công!");
    } catch (error) {
      console.error("Failed to delete collection:", error);
      alert("Có lỗi xảy ra khi xóa bộ từ vựng. Vui lòng thử lại.");
    }
  };

  const actionCards = [
    {
      color: "rose" as const,
      onclick: () =>
        navigate(PATHS.flashcardLearn(topic?.topic_id), {
          state: {
            words: topic?.words,
            topicName: topic?.name,
          },
        }),
      icon: Sparkles,
      title: "Học mới",
      subtitle: "Học với flashcard",
    },
    {
      color: "sky" as const,
      onclick: () =>
            navigate(`/moji-goi/practice/${topic?.topic_id}`),
      icon: ListChecks,
      title: "Quiz",
      subtitle: "Kiểm tra kiến thức",
    },
    {
      color: "amber" as const,
      onclick: () => {
              if (!topic) return;
              dispatch(
                openModal({
                  type: "custom",
                  content: <WriteTypeModalContent topic={topic} />,
                }),
              );
            },
      icon: PenLine,
      title: "Luyện viết",
      subtitle: "Luyện viết kanji",
    },
  ]

  return (
    <CollectionLayout
      header={{
        type: "card",
        children: (
          <Card
            kind="solid"
            color="rose"
            className="mb-8"
            hoverEffect={false}
            item={{
              id: '' + topic?.topic_id,
              title: '' + topic?.name,
              subtitle: (topic?.words.length || 0) > 0 ? `Bạn có ${topic?.words.length} từ vựng` : "Chưa có từ vựng nào",
              progress: 0,
              icon: Sparkles,
            }}
            menuItems={[
              { icon: Pencil, label: "Chỉnh sửa", onClick: () => { } },
              { icon: Share2, label: "Chia sẻ", onClick: () => { } },
              {
                icon: Trash2,
                label: "Xoá",
                color: "red",
                onClick: () => handleDelete(topic?.topic_id),
                disabled: false,
              },
            ]}
          />
        )
      }}
      addButton={{
        label: "Thêm từ vựng",
        onClick: () => navigate(PATHS.createCollection)
      }}
      emptyState={{
        icon: BookOpen,
        message: "Bạn chưa có từ vựng nào. Hãy tạo từ vựng đầu tiên để bắt đầu học!",
        buttonText: "Tạo từ vựng mới",
        onButtonClick: () => navigate(PATHS.createCollection)
      }}
      color="rose"
      goBackPath={PATHS.collection(topic?.collection_id)}
      isEmptyState={topic?.words.length === 0}
    >
      {/* Action cards */}
      <div className="w-4xl h-100 mx-auto flex justify-between mb-8">
        {
          actionCards.map((card) => (
            <Button
              kind="outline"
              color={card.color}
              onClick={card.onclick}
              className="group flex flex-col items-center gap-3 p-6 h-auto"
            >
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-${card.color}-100 to-${card.color}-200 grid place-items-center group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-6 h-6 text-${card.color}-600`} />
              </div>
              <span className="font-semibold text-gray-800">{card.title}</span>
              <span className="text-xs text-gray-400">{card.subtitle}</span>
            </Button>
          ))
        }
      </div>

      {/* Word list */}
      <div className="flex flex-wrap justify-between gap-6 gap-y-6">
        {topic?.words.map((word, index) => (
          <WordCard key={index} word={word} />
        ))}{" "}
      </div>
    </CollectionLayout>
  )
}