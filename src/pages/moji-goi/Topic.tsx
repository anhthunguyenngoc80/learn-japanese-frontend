import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Sparkles,
  ChevronLeft,
  PenLine,
  ListChecks,
  Plus,
  FileText,
  ClipboardList,
} from "lucide-react";
import { PATHS } from "../../constant";
import { Button } from "../../components";
import { WordCardList } from "../../components/WordCardList";
import * as api from "../../api";
import * as models from "../../model";

export const Topic = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<models.Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<models.Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWriteModal, setShowWriteModal] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!collectionId) return;
      setLoading(true);
      try {
        const response = await api.getTopics(collectionId);
        setTopics(response.data);
      } catch (error) {
        console.error("Failed to fetch topics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [collectionId]);

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
        <Button  size="sm" icon={ChevronLeft} iconPosition="left" onClick={() => navigate(PATHS.collection)} className="mb-6 w-fit">
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
    <div className="grow flex flex-col px-6 py-8 max-w-3xl mx-auto w-full">
      {/* Back button */}
      <Button  size="sm" icon={ChevronLeft} iconPosition="left" onClick={() => setSelectedTopic(null)} className="mb-6 w-fit">
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
        <Button  onClick={() => navigate(PATHS.flashcardLearn(selectedTopic.topic_id))} className="group flex flex-col items-center gap-3 p-6 h-auto">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-rose-200 grid place-items-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6 text-rose-600" />
          </div>
          <span className="font-semibold text-gray-800">Học mới</span>
          <span className="text-xs text-gray-400">Học với flashcard</span>
        </Button>

        <Button  onClick={() => navigate(`/moji-goi/practice/${selectedTopic.topic_id}`)} className="group flex flex-col items-center gap-3 p-6 h-auto">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 grid place-items-center group-hover:scale-110 transition-transform">
            <ListChecks className="w-6 h-6 text-sky-600" />
          </div>
          <span className="font-semibold text-gray-800">Quiz</span>
          <span className="text-xs text-gray-400">Kiểm tra kiến thẻm</span>
        </Button>

        <div className="relative">
          <Button  onClick={() => setShowWriteModal(true)} className="group flex flex-col items-center gap-3 p-6 w-full h-auto">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 grid place-items-center group-hover:scale-110 transition-transform">
              <PenLine className="w-6 h-6 text-amber-600" />
            </div>
            <span className="font-semibold text-gray-800">Luyện viết</span>
            <span className="text-xs text-gray-400">Luyện viết kanji</span>
          </Button>

          {/* Modal chọn loại luyện viết */}
          {showWriteModal && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                onClick={() => setShowWriteModal(false)}
              />
              <div className="fixed inset-0 z-50 grid place-items-center pointer-events-none">
                <div className="pointer-events-auto bg-white rounded-2xl shadow-xl border border-amber-100 p-6 w-80 max-w-[90vw]">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Chọn hình thức luyện viết
                  </h3>
                  <p className="text-sm text-gray-400 mb-5">
                    Bạn muốn luyện viết theo cách nào?
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button
                      key="paper"
                      onClick={() => {
                        setShowWriteModal(false);
                        navigate(PATHS.practicePaper(selectedTopic.topic_id));
                      }}
                      className="flex items-center gap-4 p-4 h-auto justify-start"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 grid place-items-center shrink-0 group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">
                          Giấy luyện viết
                        </span>
                        <span className="text-xs text-gray-400">
                          In giấy để luyện viết tay
                        </span>
                      </div>
                    </Button>
                    <Button
                      key="write"
                      onClick={() => {
                        setShowWriteModal(false);
                        navigate(PATHS.practiceWrite(selectedTopic.topic_id));
                      }}
                      className="flex items-center gap-4 p-4 h-auto justify-start"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 grid place-items-center shrink-0 group-hover:scale-110 transition-transform">
                        <ClipboardList className="w-5 h-5 text-sky-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">
                          Quiz Luyện viết
                        </span>
                        <span className="text-xs text-gray-400">
                          Luyện viết kanji trực tiếp
                        </span>
                      </div>
                    </Button>
                  </div>
                  <Button  size="sm" onClick={() => setShowWriteModal(false)} className="mt-4 w-full">
                    Huỷ
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <WordCardList
        items={selectedTopic.words}
        icon={<BookOpen size={16} />}
        title="Danh sách từ vựng"
        accent="amber"
        actionButton={
          <Button  size="sm" icon={Plus} iconPosition="left" onClick={() => navigate(PATHS.editCollection(selectedTopic.topic_id))} className="bg-amber-100 text-amber-700 hover:bg-amber-200">
            Thêm từ
          </Button>
        }
      />
    </div>
  );
};
