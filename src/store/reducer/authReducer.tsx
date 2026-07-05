import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import * as models from "../../model";
import { getUser } from "../../api/auth";

interface AuthState {
  user: models.User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
};

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return rejectWithValue("No token found");
    }

    try {
      const response = await getUser();
      return { user: response.data, token };
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return rejectWithValue("Token invalid");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ user: models.User }>) {
      state.user = action.payload.user;
      state.token = action.payload.user.token;
      state.isAuthenticated = true;
      state.isInitialized = true;
      localStorage.setItem("token", action.payload.user.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isInitialized = true;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      });
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
