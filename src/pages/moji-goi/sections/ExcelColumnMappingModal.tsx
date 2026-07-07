import { X } from "lucide-react";

import { useAppDispatch, openModal, closeModal } from "../../../store";
import { type ColumnMapping } from "../../../utils";
import { ExcelColumnMapping } from "./ExcelColumnMapping";

interface ExcelColumnMappingModalContentProps {
  columns: string[];
  onMappingComplete: (mapping: ColumnMapping[], file?: File) => void;
  onCancel?: () => void;
  file?: File;
}

const ExcelColumnMappingModalContent = ({ columns, onMappingComplete, onCancel, file }: ExcelColumnMappingModalContentProps) => {
  const dispatch = useAppDispatch();

  const handleDismiss = () => {
    dispatch(closeModal());
    onCancel?.();
  };

  const handleComplete = (mapping: ColumnMapping[]) => {
    onMappingComplete(mapping, file);
    dispatch(closeModal());
  };

  return (
    <>
      <div className="sticky top-0 flex items-center justify-between p-4 border-b border-amber-200 bg-white z-10">
        <h2 className="text-lg font-semibold text-gray-800">Cấu hình cột Excel</h2>
        <button onClick={handleDismiss} className="p-1 rounded-lg hover:bg-gray-100 transition" aria-label="Đóng">
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      <div className="p-6">
        <ExcelColumnMapping columns={columns} onMappingComplete={handleComplete} onCancel={handleDismiss} />
      </div>
    </>
  );
};

interface ExcelColumnMappingModalProps {
  columns: string[];
  onMappingComplete: (mapping: ColumnMapping[], file?: File) => void;
  onCancel?: () => void;
  file?: File;
}

export const ExcelColumnMappingModal = ({
  columns,
  onMappingComplete,
  onCancel,
  file,
}: ExcelColumnMappingModalProps) => {
  const dispatch = useAppDispatch();

  const handleOpen = () => {
    dispatch(
      openModal({
        type: "excelColumnMapping",
        content: (
          <ExcelColumnMappingModalContent
            columns={columns}
            onMappingComplete={onMappingComplete}
            onCancel={onCancel}
            file={file}
          />
        ),
      })
    );
  };

  // This component doesn't render anything itself
  // It just provides the handleOpen method
  return null;
};

export const useExcelColumnMappingModal = () => {
  const dispatch = useAppDispatch();

  const open = (props: ExcelColumnMappingModalProps) =>
    dispatch(openModal({ type: "excelColumnMapping", content: <ExcelColumnMappingModalContent {...props} /> }));

  const close = () => dispatch(closeModal());

  return { open, close };
};