import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = {
  auth: ReturnType<typeof authReducer>;
};
export type AppDispatch = typeof store.dispatch;