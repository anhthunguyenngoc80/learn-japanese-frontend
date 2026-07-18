import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ReactNode } from "react";

export type ModalType = 
  | "excelColumnMapping"
  | "confirm"
  | "custom";

interface ModalState {
  isOpen: boolean;
  modalType: ModalType | null;
  content: ReactNode | null;
}

const initialState: ModalState = {
  isOpen: false,
  modalType: null,
  content: null,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal(state, action: PayloadAction<{ type: ModalType; content?: ReactNode }>) {
      state.isOpen = true;
      state.modalType = action.payload.type;
      state.content = action.payload.content ?? null;
    },
    closeModal(state) {
      state.isOpen = false;
      state.modalType = null;
      state.content = null;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;

// Selector
export const selectModal = (state: { modal: ModalState }) => state.modal;
