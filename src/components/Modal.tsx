import { useAppDispatch, useAppSelector } from "../store/typedHooks";
import { closeModal } from "../store/reducer/modalReducer";

interface ModalProps {
  children?: React.ReactNode;
  onClose?: () => void;
  closeOnBackdropClick?: boolean;
  className?: string;
}

export const Modal = ({
  onClose,
  closeOnBackdropClick = true,
  className = "",
}: ModalProps) => {
  const dispatch = useAppDispatch();
  const { isOpen, content } = useAppSelector((state) => state.modal);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    dispatch(closeModal());
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl ${className}`}
      >
        {content}
      </div>
    </div>
  );
};
