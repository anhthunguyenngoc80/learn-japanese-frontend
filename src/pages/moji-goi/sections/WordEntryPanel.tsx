import { Button } from "../../../components";
import { Plus } from "lucide-react";
import { UploadExcel } from "../../../components/UploadExcel";

export const WordEntryPanel = () => (
  <div>
    <div className="mb-4">
      <p className="mt-2 text-[11px] text-gray-400 text-right whitespace-nowrap">
        Cột: Số thứ tự • Từ • Hán Việt • Cách đọc • Nghĩa • Ví dụ (dòng đầu là
        tên cột)
      </p>

      <UploadExcel />
    </div>

    <div>
      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
        Hoặc nhập từ vựng (dạng văn bản)
      </label>

      <p className="mt-2 text-xs text-gray-500 text-left leading-relaxed">
        <span className="font-medium">Chú thích:</span> Mỗi từ cách nhau bởi một
        dòng trống. Các trường được phân tách bằng dấu{" "}
        <code className="font-mono text-amber-600">|</code>. Ví dụ:{" "}
        <code className="font-mono text-amber-600">
          単語 | よみ | 意味 | 例文
        </code>
      </p>

      <textarea
        placeholder="Dán nội dung từ vựng vào đây...

Ví dụ: 単語 | よみ | 意味 | 例文"
        rows={6}
        className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition resize-y font-mono"
      />

      <Button
        kind="soft"
        color="amber"
        size="sm"
        spacing="sm"
        radius="full"
        icon={Plus}
        iconPosition="left"
      >
        Phân tích
      </Button>
    </div>
  </div>
);
