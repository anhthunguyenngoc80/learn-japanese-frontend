import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Library,
  Trash2,
  Sparkles,
  Pencil,
  Share2,
} from "lucide-react";

import { PATHS } from "../../constant/Path";
import * as api from "../../api";
import * as models from "../../model";
import { CollectionLayout } from "./sections";
import { Card } from "../../components";

export const CollectionList = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<models.Collection[]>([]);

  const fetchCollections = async () => {
    try {
      const response = await api.getCollections();
      setCollections(response.data);
    } catch (error) {
      console.error("Failed to fetch collections:", error);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleDelete = async (collectionId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa bộ từ vựng này?")) return;

    try {
      await api.deleteCollection(collectionId);
      await fetchCollections(); // Refresh the collection list after deletion
      alert("Xóa bộ từ vựng thành công!");
    } catch (error) {
      console.error("Failed to delete collection:", error);
      alert("Có lỗi xảy ra khi xóa bộ từ vựng. Vui lòng thử lại.");
    }
  };

  return (
    <CollectionLayout
      color="rose"
      header={{
        type: "simple",
        icon: Library,
        title: "Danh sách bộ từ vựng",
        subtitle:
          collections.length > 0
            ? `Bạn có ${collections.length} bộ từ vựng`
            : "Chưa có bộ từ vựng nào",
      }}
      emptyState={{
        icon: BookOpen,
        message:
          "Bạn chưa có bộ từ vựng nào. Hãy tạo bộ từ vựng đầu tiên để bắt đầu học!",
        buttonText: "Tạo bộ từ vựng mới",
        onButtonClick: () => navigate(PATHS.createCollection),
      }}
      addButton={{
        label: "Thêm bộ từ vựng",
        onClick: () => navigate(PATHS.createCollection),
        color: "rose",
      }}
      isEmptyState={collections.length === 0}
    >
      {collections.map((collection) => (
        <Card
          key={collection.collection_id}
          kind="outline"
          color="rose"
          onClick={() => navigate(PATHS.collection(collection.collection_id))}
          className="w-70"
          hoverEffect={true}
          item={{
            id: collection.collection_id,
            title: collection.name,
            subtitle: collection.topic_count + " chủ đề",
            progress: 0,
            icon: Sparkles,
            buttonText: "Bắt đầu học",
            onButtonClick: () => navigate(PATHS.collection(collection.collection_id)),
          }}
          menuItems={[
            { icon: Pencil, label: "Chỉnh sửa", onClick: () => { } },
            { icon: Share2, label: "Chia sẻ", onClick: () => { } },
            {
              icon: Trash2,
              label: "Xoá",
              color: "red",
              onClick: () => handleDelete(collection.collection_id),
              disabled: false,
            },
          ]}
          loading={collection === null}
        />
      ))}
    </CollectionLayout>
  )
};