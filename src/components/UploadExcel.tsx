import { Upload } from "lucide-react";

export const UploadExcel = () => (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-8 px-6 cursor-pointer transition border-emerald-300 bg-emerald-50/40 hover:border-emerald-500">
        <Upload className="text-emerald-600" size={28} />
        <p className="text-sm font-medium text-gray-700">
            Kéo & thả file Excel vào đây
        </p>
        <p className="text-xs text-gray-500">
            hoặc{" "}
            <span className="text-emerald-600 font-medium">bấm để chọn file</span>
        </p>
        <p className="text-[11px] text-gray-400 text-center">
            Hỗ trợ <code>.xlsx</code>, <code>.xls</code>, <code>.csv</code>
        </p>
    </div>)