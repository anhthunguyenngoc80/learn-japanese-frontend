import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Library,
  Trash2,
  Sparkles,
  Pencil,
  Share2,
} from "lucide-react";

import { PATHS } from "../../constant/Path";
import { Button } from "../../components";
import * as api from "../../api";
import * as models from "../../model";
import { Card } from "../../components/Card";

export const Collection = () => {
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
    <div className="grow flex flex-col items-center justify-center px-6 py-12">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 grid place-items-center shadow-lg shadow-amber-200">
          <Library className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Danh sách bộ từ vựng
        </h1>
        <p className="text-sm text-gray-500">
          {collections.length > 0
            ? `Bạn có ${collections.length} bộ từ vựng`
            : "Chưa có bộ từ vựng nào"}
        </p>
      </div>

      {collections.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-amber-50 border-2 border-dashed border-amber-200 grid place-items-center">
            <BookOpen className="w-10 h-10 text-amber-300" />
          </div>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            Bạn chưa có bộ từ vựng nào. Hãy tạo bộ từ vựng đầu tiên để bắt đầu
            học!
          </p>
          <Button
            size="md"
            icon={Plus}
            iconPosition="left"
            onClick={() => navigate(PATHS.createCollection)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
          >
            Tạo bộ từ vựng mới
          </Button>
        </div>
      ) : (
        <>
          {/* Collection list header with add button */}
          <div className="w-full max-w-7xl flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-gray-500">
              {collections.length} bộ từ vựng
            </p>
            <Button
              size="md"
              kind="elevated"
              color="amber"
              spacing="sm"
              icon={Plus}
              iconPosition="left"
              onClick={() => navigate(PATHS.createCollection)}
              radius="full"
            >
              Thêm bộ từ vựng
            </Button>
          </div>

          {/* Collection list */}
          <div className="w-full max-w-7xl flex flex-wrap gap-3 px-4 sm:px-6 lg:px-8">
            {collections.map((collection, idx) => (
              <Card
                item={{
                  id: "" + idx,
                  title: collection.name,
                  subtitle: 0 + " chủ đề",
                  progress: undefined,
                  icon: Sparkles,
                  buttonText: "Bắt đầu học",
                  onButtonClick: () =>
                    navigate(PATHS.topic(collection.collection_id)),
                }}
                fullWidth={false}
                className="w-70"
                kind="outline"
                color="indigo"
                onClick={() => navigate(PATHS.topic(collection.collection_id))}
                menuItems={[
                  { icon: Pencil, label: "Chỉnh sửa", onClick: () => {} },
                  { icon: Share2, label: "Chia sẻ", onClick: () => {} },
                  {
                    icon: Trash2,
                    label: "Xoá",
                    color: "red",
                    onClick: () => handleDelete(collection.collection_id),
                    disabled: false,
                  },
                ]}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
