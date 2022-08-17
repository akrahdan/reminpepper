import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "services/auth";
import type { User } from "services/auth";

type AuthState = {
  user: User | null;
  token: string | null;
};

const initialState = { user: null, token: null };

const authSlice = createSlice({
  name: "auth",
  initialState: initialState as AuthState,
  reducers: {
    setCredentials: (
      state,
      { payload: { user, token } }: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = user;
      state.token = token;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.getCurrentUser.matchFulfilled,
      (state, { payload }) => {
        
        state.user = payload;
      }
    );
  },
});

export const { setCredentials } = authSlice.actions;

export default authSlice.reducer;
