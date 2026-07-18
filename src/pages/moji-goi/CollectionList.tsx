import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Library,
  Trash2,
  Sparkles,
  Pencil,
  Share2,
  ListOrdered,
  Headphones,
  Route,
  Plus,
} from "lucide-react";

import { PATHS } from "../../constant/Path";
import * as api from "../../api";
import * as models from "../../model";
import { CollectionLayout } from "./sections";
import {
  Button,
  Card,
  SelectionModal,
  type SelectionOption,
} from "../../components";
import { useAppDispatch } from "../../store/typedHooks";
import { openModal, closeModal } from "../../store/reducer/modalReducer";

/* ------------------------------------------------------------------ */
/*  Mock roadmap type – replace with real API data later                */
/* ------------------------------------------------------------------ */

interface Roadmap {
  id: string;
  name: string;
  description: string;
  progress: number;
}

export const CollectionList = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [collections, setCollections] = useState<models.Collection[]>([]);
  const [roadmaps] = useState<Roadmap[]>([]);

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
    // TODO: fetch roadmaps from API when available
  }, []);

  const handleDelete = async (collectionId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài học này?")) return;

    try {
      await api.deleteCollection(collectionId);
      await fetchCollections();
      alert("Xóa bài học thành công!");
    } catch (error) {
      console.error("Failed to delete collection:", error);
      alert("Có lỗi xảy ra khi xóa bài học. Vui lòng thử lại.");
    }
  };

  const handleShowAddModal = () => {
    const options: SelectionOption[] = [
      {
        icon: ListOrdered,
        label: "Tạo bài học từ vựng",
        subtitle: "Nhập từ vựng và chia chủ đề",
        iconBg: "from-amber-100 to-amber-200",
        iconColor: "text-amber-600",
        onClick: () => {
          dispatch(closeModal());
          navigate(PATHS.createCollection);
        },
      },
      {
        icon: Headphones,
        label: "Tạo bài học luyện nghe",
        subtitle: "Luyện nghe tiếng Nhật",
        iconBg: "from-sky-100 to-sky-200",
        iconColor: "text-sky-600",
        onClick: () => {
          dispatch(closeModal());
          navigate(PATHS.createListeningCollection);
        },
      },
    ];

    dispatch(
      openModal({
        type: "custom",
        content: (
          <SelectionModal
            title="Chọn loại bài học"
            description="Bạn muốn tạo bài học gì?"
            options={options}
            onCancel={() => dispatch(closeModal())}
          />
        ),
      }),
    );
  };

  const handleCreateRoadmap = () => {
    // TODO: navigate to create roadmap page when available
    navigate(PATHS.createCollection);
  };

  return (
    <CollectionLayout
      color="rose"
      header={{
        type: "simple",
        icon: Library,
        title: "Danh sách bài học",
        subtitle:
          collections.length > 0
            ? `Bạn có ${collections.length} bài học`
            : "Chưa có bài học nào",
      }}
      emptyState={{
        icon: BookOpen,
        message:
          "Bạn chưa có bài học nào. Hãy tạo bài học đầu tiên để bắt đầu học!",
        buttonText: "Tạo bài học mới",
        onButtonClick: handleShowAddModal,
      }}
      isEmptyState={collections.length === 0}
    >
      {/* ================================================================ */}
      {/*  PHẦN RIÊNG: DANH SÁCH LỘ TRÌNH (1 hàng, lượt ngang)           */}
      {/* ================================================================ */}
      <div className="w-full mb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Route className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-gray-800">
              Danh sách lộ trình
            </h2>
          </div>
          <Button
            size="sm"
            kind="elevated"
            color="rose"
            spacing="sm"
            icon={Plus}
            iconPosition="left"
            onClick={handleCreateRoadmap}
            radius="full"
          >
            Thêm lộ trình
          </Button>
        </div>

        {roadmaps.length > 0 ? (
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin scrollbar-thumb-rose-200 scrollbar-track-transparent">
            {roadmaps.map((roadmap) => (
              <Card
                key={roadmap.id}
                kind="outline"
                color="rose"
                className="min-w-64 shrink-0 w-64"
                hoverEffect={true}
                item={{
                  id: roadmap.id,
                  title: roadmap.name,
                  subtitle: roadmap.description,
                  progress: roadmap.progress,
                  icon: Route,
                  buttonText: "Xem chi tiết",
                  onButtonClick: () => {
                    navigate(PATHS.roadmap(roadmap.id));
                  },
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/30">
            <Route className="w-8 h-8 text-rose-300" />
            <p className="text-sm text-gray-400 text-center max-w-xs">
              Bạn chưa có lộ trình học nào. Hãy tạo lộ trình để theo dõi tiến độ
              học tập!
            </p>
            <Button
              size="sm"
              kind="elevated"
              color="rose"
              spacing="sm"
              icon={Plus}
              iconPosition="left"
              onClick={handleCreateRoadmap}
              radius="full"
            >
              Tạo lộ trình
            </Button>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/*  NÉT ĐỨT NGĂN CÁCH                                                */}
      {/* ================================================================ */}
      <div className="w-full border-t-2 border-dashed border-gray-300 my-4" />

      {/* ================================================================ */}
      {/*  PHẦN DƯỚI: DANH SÁCH BÀI HỌC (lưới xuống)                      */}
      {/* ================================================================ */}
      <div className="w-full mb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Route className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-gray-800">
              Danh sách bài học
            </h2>
          </div>
          <Button
            size="sm"
            kind="elevated"
            color="rose"
            spacing="sm"
            icon={Plus}
            iconPosition="left"
            onClick={handleShowAddModal}
            radius="full"
          >
            Thêm bài học
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {collections.map((collection) => (
            <Card
              key={collection.collection_id}
              kind="outline"
              color="rose"
              onClick={() =>
                navigate(PATHS.collection(collection.collection_id))
              }
              className="w-70"
              hoverEffect={true}
              item={{
                id: collection.collection_id,
                title: collection.name,
                subtitle: collection.topic_count + " chủ đề",
                progress: collection.progress,
                icon: Sparkles,
                buttonText: "Bắt đầu học",
                onButtonClick: () =>
                  navigate(PATHS.collection(collection.collection_id)),
              }}
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
              loading={collection === null}
            />
          ))}
        </div>
      </div>
    </CollectionLayout>
  );
};
