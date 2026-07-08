import { ClipboardList, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PATHS } from "../../../constant";
import type { Topic } from "../../../model";
import { useAppDispatch } from "../../../store/typedHooks";
import { closeModal } from "../../../store/reducer/modalReducer";

export const WriteTypeModalContent = ({topic}: {topic: Topic}) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleClose = () => {
        dispatch(closeModal());
    };

    return (
        <div className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Chọn hình thức luyện viết</h3>
            <p className="text-sm text-gray-400 mb-5">Bạn muốn luyện viết theo cách nào?</p>
            <div className="flex flex-col gap-3">
                <button
                    onClick={() => {
                        handleClose();
                        navigate(PATHS.practicePaper(topic.topic_id), { state: { topic } });
                    }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 transition-all text-left group"
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 grid place-items-center shrink-0 group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">Giấy luyện viết</span>
                        <span className="text-xs text-gray-400">In giấy để luyện viết tay</span>
                    </div>
                </button>
                <button
                    onClick={() => {
                        handleClose();
                        navigate(PATHS.practiceWrite(topic.topic_id), { state: { topic } });
                    }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 transition-all text-left group"
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 grid place-items-center shrink-0 group-hover:scale-110 transition-transform">
                        <ClipboardList className="w-5 h-5 text-sky-600" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">Quiz Luyện viết</span>
                        <span className="text-xs text-gray-400">Luyện viết kanji trực tiếp</span>
                    </div>
                </button>
            </div>
            <button
                onClick={handleClose}
                className="mt-4 w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
            >
                Huỷ
            </button>
        </div>
    );
}