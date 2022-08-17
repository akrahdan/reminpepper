import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "services/auth";
import { residentApi } from "services/resident";
import { eventApi } from "services/event";
import { mediApi } from "services/media";
import authSlice from "state/auth/authSlice";
import eventSlice from "state/event/eventSlice";
import residentSlice from "state/resident/residentSlice";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [residentApi.reducerPath]: residentApi.reducer,
    [eventApi.reducerPath]: eventApi.reducer,
    [mediApi.reducerPath]: mediApi.reducer,
    auth: authSlice,
    event: eventSlice,
    resident: residentSlice,
  },
});

export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof store.getState>;
