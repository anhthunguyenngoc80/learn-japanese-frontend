import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Share2,
  Trash2,
  Pencil,
  BookOpen,
} from "lucide-react";
import { PATHS } from "../../constant";
import * as api from "../../api";
import * as models from "../../model";
import { CollectionLayout } from "./sections";
import { Card } from "../../components";

export const Collection = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<models.Collection | null>(null);

  useEffect(() => {
    const fetchCollection = async () => {
      if (!collectionId) return;
      try {
        const response = await api.getCollectionById(collectionId);
        setCollection(response.data);
      } catch (error) {
        console.error("Failed to fetch collection:", error);
      }
    };
    fetchCollection();
  }, [collectionId]);

  const handleDelete = async (collectionId?: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa bộ từ vựng này?") || !collectionId) return;

    try {
      await api.deleteCollection(collectionId);
      navigate(PATHS.collections)
      alert("Xóa bộ từ vựng thành công!");
    } catch (error) {
      console.error("Failed to delete collection:", error);
      alert("Có lỗi xảy ra khi xóa bộ từ vựng. Vui lòng thử lại.");
    }
  };

  const topics = collection?.topics ?? [];

  return (
    <CollectionLayout
      header={{
        type: "card",
        children: (
          (collection === null) ? <Card item={{
            id: '',
            title: '',
          }} hoverEffect={false} loading={true} /> : <Card
            kind="solid"
            color="rose"
            className="mb-8"
            hoverEffect={false}
            item={{
              id: '' + collection!.collection_id,
              title: '' + collection!.name,
              subtitle: collection!.topic_count > 0 ? `Bạn có ${collection!.topic_count} chủ đề` : "Chưa có chủ đề nào",
              progress: collection!.progress,
              icon: Sparkles,
            }}
            menuItems={[
              { icon: Pencil, label: "Chỉnh sửa", onClick: () => { } },
              { icon: Share2, label: "Chia sẻ", onClick: () => { } },
              {
                icon: Trash2,
                label: "Xoá",
                color: "red",
                onClick: () => handleDelete(collection!.collection_id),
                disabled: false,
              },
            ]}

          />
        )
      }}
      addButton={{
        label: "Thêm chủ đề",
        onClick: () => navigate(PATHS.createCollection)
      }}
      emptyState={{
        icon: BookOpen,
        message: "Bạn chưa có chủ đề nào. Hãy tạo chủ đề đầu tiên để bắt đầu học!",
        buttonText: "Tạo chủ đề mới",
        onButtonClick: () => navigate(PATHS.createCollection)
      }}
      color="rose"
      goBackPath={PATHS.collections}
      isEmptyState={topics.length === 0}
    >
      {
        topics.map((topic) => (
          <Card
            key={topic.topic_id}
            kind="outline"
            onClick={() => navigate(PATHS.topic(topic.topic_id))}
            className="w-70"
            hoverEffect={true}
            color="rose"
            item={{
              id: topic.topic_id,
              title: topic.name,
              subtitle: topic.word_count + " từ",
              progress: topic.progress,
              icon: Sparkles,
              buttonText: "Bắt đầu học",
              onButtonClick: () => navigate(PATHS.topic(topic.topic_id))
            }}
            loading={topic === null}
            borderWidth="sm"
          />
        ))
      }
    </CollectionLayout >
  );
};