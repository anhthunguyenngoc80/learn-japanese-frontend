import React, { type ReactNode } from "react";
import { Button } from "../../../components";
import type { AccentColor } from "../../../constant";
import { ChevronLeft, Plus, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ========================================================================
 * TYPES
 * ===================================================================== */

/** Kiểu 1: Header đơn giản - tiêu đề, tiêu đề phụ, icon (dạng center, không phải Card) */
export interface SimpleHeaderConfig {
  type: "simple";
  icon: LucideIcon;
  title: string;
  subtitle: string;
  color?: AccentColor; // ví dụ "rose", dùng cho gradient icon box
}

/** Kiểu 2: Header dạng Card - tiêu đề, tiêu đề phụ, icon, tiến độ, menu item */
export interface CardHeaderConfig {
  type: "card";
  children: ReactNode
}

export type HeaderConfig = SimpleHeaderConfig | CardHeaderConfig;

/** Nút thêm mới: nhận nội dung (label) và hàm xử lý onClick */
export interface AddButtonConfig {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  color?: AccentColor;
}

/** Trạng thái rỗng khi chưa có item nào */
export interface EmptyStateConfig {
  icon: LucideIcon;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
  color?: AccentColor;
}

export interface EntityListPageProps {
  header: HeaderConfig;
  addButton?: AddButtonConfig;
  children: ReactNode;
  emptyState?: EmptyStateConfig;
  /** màu mặc định dùng chung cho Card trong list nếu item không set riêng */
  color?: AccentColor;
  cardClassName?: string;
  goBackPath?: string;
  isEmptyState: boolean
}

/* ========================================================================
 * SUB-COMPONENTS
 * ===================================================================== */

/** Header dùng chung - tự chọn render kiểu "simple" hay "card" */
const PageHeader: React.FC<{ header: HeaderConfig }> = ({ header }) => {
  if (header.type === "card") {
    return (
      header.children
    );
  }

  const Icon = header.icon;
  const color = header.color ?? "rose";
  return (
    <div className="flex flex-col items-center gap-3 mb-10">
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-${color}-400 to-${color}-600 grid place-items-center shadow-lg shadow-${color}-200`}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
        {header.title}
      </h1>
      <p className="text-sm text-gray-500">{header.subtitle}</p>
    </div>
  );
};

/** Thanh có đường kẻ + nút thêm mới, nằm ngay trên danh sách */
const AddButtonBar: React.FC<{ addButton?: AddButtonConfig }> = ({
  addButton,
}) => {
  const color = addButton?.color ?? "rose";
  return (
    <div className="w-full flex items-center justify-end mb-4 gap-5">
      <div
        className={`border-3 border-dashed border-${color}-200 rounded-full flex-1`}
        aria-hidden
      />
      {addButton && <Button
        size="md"
        kind="elevated"
        color={color}
        spacing="sm"
        icon={addButton.icon || Plus}
        iconPosition="left"
        onClick={addButton.onClick}
        radius="full"
      >
        {addButton.label}
      </Button>}
    </div>
  );
};

/** Trạng thái rỗng khi danh sách chưa có item nào */
const EmptyState: React.FC<{ emptyState: EmptyStateConfig }> = ({
  emptyState,
}) => {
  const Icon = emptyState.icon;
  const color = emptyState.color ?? "rose";
  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className={`w-24 h-24 rounded-full bg-${color}-50 border-2 border-dashed border-${color}-200 grid place-items-center`}
      >
        <Icon className={`w-10 h-10 text-${color}-300`} />
      </div>
      <p className="text-sm text-gray-400 text-center max-w-xs">
        {emptyState.message}
      </p>
      <Button
        size="md"
        icon={undefined}
        iconPosition="left"
        onClick={emptyState.onButtonClick}
        className={`bg-gradient-to-r from-${color}-500 to-${color}-600 hover:from-${color}-600 hover:to-${color}-700`}
      >
        {emptyState.buttonText}
      </Button>
    </div>
  );
};

/* ========================================================================
 * MAIN COMPONENT
 * ===================================================================== */

export const CollectionLayout: React.FC<EntityListPageProps> = ({
  header,
  addButton,
  children,
  emptyState,
  color = "rose",
  goBackPath,
  isEmptyState
}) => {
  const navigate = useNavigate()
  return (
    <div className="grow flex flex-col items-center justify-center">
      {goBackPath && <div className="w-full text-start"><Button
        kind="text"
        color={color}
        size="lg"
        icon={ChevronLeft}
        iconPosition="left"
        onClick={() => navigate(goBackPath)}
        className="mb-6"
        spacing="none"
      >
        Quay lại
      </Button></div>}

      {/* Header (kiểu simple hoặc card) */}
      <PageHeader header={header} />

      {/* Nội dung danh sách */}
      {isEmptyState && emptyState ? (
        <EmptyState emptyState={emptyState} />
      ) : (
        <>
          <AddButtonBar addButton={addButton} />

          <div className="w-full flex flex-wrap gap-3">
            {children}
          </div>
        </>
      )}
    </div>
  );
};