import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer";
import modalReducer from "./reducer/modalReducer";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    modal: modalReducer,
  },
});

export type RootState = {
  auth: ReturnType<typeof authReducer>;
  modal: ReturnType<typeof modalReducer>;
};
export type AppDispatch = typeof store.dispatch;
