import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { eventApi } from "services/event";
import type { Event } from "services/event";
import { RootState } from "store";

type EventState = {
  event: Event | null;
  events: Event[];
};

const convertResponseToMedia = (att) => {
  return {
    id: att.id,
    name: att.attributes?.name,
    width: att.attributes?.width,
    height: att.attributes?.height,
    mime: att.attributes?.mime,
    url: att.attributes?.url,
    thumbnail: att.attributes.formats?.thumbnail,
  };
};
const initialState = { event: null, events: [] };

const eventSlice = createSlice({
  name: "event",
  initialState: initialState as EventState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        eventApi.endpoints.createEvent.matchFulfilled,
        (state, { payload }) => {
          console.log("Events: ", payload)
          state.event = payload;
          state.events = [...state.events, state.event];
        }
      )
      .addMatcher(
        eventApi.endpoints.updateEvent.matchFulfilled,
        (state, { payload }) => {
          
          state.event = payload;
        }
      )
      .addMatcher(
        eventApi.endpoints.getEvent.matchFulfilled,
        (state, { payload }) => {
        
          state.event = payload
        }
      )
      .addMatcher(
        eventApi.endpoints.deleteEvent.matchFulfilled,
        (state, { payload }) => {
          state.events = state.events?.filter(
            (event) => event.id != payload
          );
        }
      )
      .addMatcher(
        eventApi.endpoints.getEvents.matchFulfilled,
        (state, { payload }) => {
          console.log("Events: ", payload)
          state.events = payload;
        }
      );
  },
});

export default eventSlice.reducer;

export const selectEvent = (state: RootState) => state.event.event;
export const selectEvents = (state: RootState) => state.event.events;