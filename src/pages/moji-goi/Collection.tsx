import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Plus, Library } from "lucide-react";

import { PATHS } from "../../constant/Path";
import { Button } from "../../components";
import * as api from "../../api";
import * as models from "../../model";

export const Collection = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<models.Collection[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getCollections();
        setCollections(response.data);
      } catch (error) {
        console.error("Failed to fetch collections:", error);
      }
    };
    fetchData();
  }, []);

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
          <Button  size="md" icon={Plus} iconPosition="left" onClick={() => navigate(PATHS.createCollection)} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
            Tạo bộ từ vựng mới
          </Button>
        </div>
      ) : (
        <>
          {/* Collection list header with add button */}
          <div className="w-full max-w-2xl flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {collections.length} bộ từ vựng
            </p>
            <Button  size="sm" icon={Plus} iconPosition="left" onClick={() => navigate(PATHS.createCollection)} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
              Thêm bộ từ vựng
            </Button>
          </div>

          {/* Collection list */}
          <div className="w-full max-w-2xl flex flex-col gap-3">
            {collections.map((collection) => (
              <Button
                key={collection.collection_id}
                onClick={() => navigate(PATHS.topic(collection.collection_id))}
                
                className="group w-full justify-between p-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 grid place-items-center shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6 text-amber-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-gray-800 truncate">
                    {collection.name}
                  </h3>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {(collection?.topics || []).length} từ
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
        </>
      )}
    </div>
  );
};
