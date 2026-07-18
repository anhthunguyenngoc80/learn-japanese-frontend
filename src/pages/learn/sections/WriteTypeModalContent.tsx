import { ClipboardList, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PATHS } from "../../../constant";
import type { Topic } from "../../../model";
import { SelectionModal, type SelectionOption } from "../../../components";
import { useAppDispatch } from "../../../store/typedHooks";
import { closeModal } from "../../../store/reducer/modalReducer";

export const WriteTypeModalContent = ({ topic }: { topic: Topic }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(closeModal());
  };

  const options: SelectionOption[] = [
    {
      icon: FileText,
      label: "Giấy luyện viết",
      subtitle: "In giấy để luyện viết tay",
      iconBg: "from-amber-100 to-amber-200",
      iconColor: "text-amber-600",
      onClick: () => {
        handleClose();
        navigate(PATHS.practicePaper(topic.topic_id), {
          state: { topic },
        });
      },
    },
    {
      icon: ClipboardList,
      label: "Quiz Luyện viết",
      subtitle: "Luyện viết kanji trực tiếp",
      iconBg: "from-sky-100 to-sky-200",
      iconColor: "text-sky-600",
      onClick: () => {
        handleClose();
        navigate(PATHS.practiceWrite(topic.topic_id), {
          state: { topic },
        });
      },
    },
  ];

  return (
    <SelectionModal
      title="Chọn hình thức luyện viết"
      description="Bạn muốn luyện viết theo cách nào?"
      options={options}
      onCancel={handleClose}
    />
  );
};