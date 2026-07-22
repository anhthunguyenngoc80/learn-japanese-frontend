import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  Gamepad2,
  ListChecks,
  Pencil,
  PenLine,
  Sparkles,
  Trash2,
  Puzzle,
  Keyboard,
  MessageSquareText,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button, Card, SelectionModal } from "../../components";
import { PATHS } from "../../constant";
import * as models from "../../model";
import { closeModal, openModal, useAppDispatch } from "../../store";
import { WriteTypeModalContent } from "../learn/sections/WriteTypeModalContent";
import { WordCard } from "./sections/WordCard";
import * as api from "../../api";
import { CollectionLayout } from "./sections";

export const Topic = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { topicId } = useParams();
  const [topic, setTopic] = useState<models.Topic | null>(null);

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
    if (
      !window.confirm("Bạn có chắc chắn muốn xóa bộ từ vựng này?") ||
      !topicId
    )
      return;

    try {
      await api.deleteTopic(topicId);
      navigate(PATHS.collection(topic?.collection_id));
      alert("Xóa bộ từ vựng thành công!");
    } catch (error) {
      console.error("Failed to delete collection:", error);
      alert("Có lỗi xảy ra khi xóa bộ từ vựng. Vui lòng thử lại.");
    }
  };

  const handleOpenGameModes = () => {
    if (!topic) return;
    dispatch(
      openModal({
        type: "custom",
        content: (
          <SelectionModal
            title="Chọn chế độ chơi"
            description="Chọn một chế độ chơi ghép chữ phù hợp với bạn"
            options={[
              {
                icon: Keyboard,
                label: "Điền từ vào chỗ trống",
                subtitle: "Chọn các ký tự hiragana và sắp xếp thành từ đúng",
                onClick: () => {
                  dispatch(closeModal());
                  navigate(PATHS.wordMatchGame(topic.topic_id));
                },
                iconBg: "from-emerald-100 to-emerald-200",
                iconColor: "text-emerald-600",
              },
              {
                icon: Puzzle,
                label: "Bảng nối chữ",
                subtitle: "Tìm các từ trong bảng chữ cái hiragana",
                onClick: () => {
                  dispatch(closeModal());
                  navigate(PATHS.wordSearchGrid(topic.topic_id));
                },
                iconBg: "from-violet-100 to-violet-200",
                iconColor: "text-violet-600",
              },
              {
                icon: MessageSquareText,
                label: "Ghép câu",
                subtitle: "Sắp xếp các từ để tạo thành câu hoàn chỉnh từ ví dụ",
                onClick: () => {
                  dispatch(closeModal());
                  navigate(PATHS.sentenceBuild(topic.topic_id));
                },
                iconBg: "from-amber-100 to-amber-200",
                iconColor: "text-amber-600",
              },
            ]}
            onCancel={() => dispatch(closeModal())}
            cancelLabel="Huỷ"
          />
        ),
      }),
    );
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
      onclick: () => navigate(PATHS.practiceQuiz(topic?.topic_id)),
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
    {
      color: "emerald" as const,
      onclick: handleOpenGameModes,
      icon: Gamepad2,
      title: "Game ghép chữ",
      subtitle: "Ghép chữ hiragana",
    },
  ];

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
              id: "" + topic?.topic_id,
              title: "" + topic?.name,
              subtitle:
                (topic?.words.length || 0) > 0
                  ? `Bạn có ${topic?.word_count} từ vựng`
                  : "Chưa có từ vựng nào",
              progress: topic?.progress,
              icon: Sparkles,
            }}
            menuItems={[
              { icon: Pencil, label: "Chỉnh sửa", onClick: () => navigate(PATHS.editTopic(topic?.topic_id)) },
              {
                icon: Trash2,
                label: "Xoá",
                color: "red",
                onClick: () => handleDelete(topic?.topic_id),
                disabled: false,
              },
            ]}
            loading={topic === null}
          />
        ),
      }}
      addButton={{
        label: "Thêm từ vựng",
        onClick: () => navigate(PATHS.createCollection),
      }}
      emptyState={{
        icon: BookOpen,
        message:
          "Bạn chưa có từ vựng nào. Hãy tạo từ vựng đầu tiên để bắt đầu học!",
        buttonText: "Tạo từ vựng mới",
        onButtonClick: () => navigate(PATHS.createCollection),
      }}
      color="rose"
      goBackPath={PATHS.collection(topic?.collection_id)}
      isEmptyState={topic?.words.length === 0}
    >
      {/* Action cards */}
      <div className="grid grid-cols-4 gap-10 mb-8">
        {actionCards.map((card) => (
          <Button
            key={card.title}
            kind="outline"
            size="lg"
            color={card.color}
            onClick={card.onclick}
            className="group flex flex-col items-center gap-3 p-6 h-auto"
          >
            <div
              className={`w-12 h-12 rounded-full bg-gradient-to-br from-${card.color}-100 to-${card.color}-200 grid place-items-center group-hover:scale-110 transition-transform`}
            >
              <card.icon className={`w-6 h-6 text-${card.color}-600`} />
            </div>
            <span className="font-semibold text-gray-800">{card.title}</span>
            <span className="text-xs text-gray-400">{card.subtitle}</span>
          </Button>
        ))}
      </div>

      {/* Word list */}
      <div className="flex flex-wrap justify-between gap-6 gap-y-6">
        {topic === null
          ? Array.from({ length: 4 }).map((_, index) => (
              <WordCard key={index} loading />
            ))
          : topic.words.map((word) => (
              <WordCard key={word.word_id} word={word} />
            ))}
      </div>
    </CollectionLayout>
  );
};
