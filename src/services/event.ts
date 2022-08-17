import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { graphqlRequestBaseQuery } from "@rtk-query/graphql-request-base-query";
import { gql } from "graphql-request";

import { RootState } from "store";
import type { MediaResponses, Media } from "./media";

export interface EventAttributes {
  id: number;
  attributes: {
    Title: string;
    Description: string;
    resident: number;
    Photos?: MediaResponses;
    Songs?: MediaResponses;
  };
}

export interface EventResponse {
  addEvent: Event;
  getEvent: Event
  allEvents: Event[]
  updateEvent: Event
}

export interface DeleteResponse {
  deleteEvent: {
    id: number
  }
}

export interface EventResponses {
  data: EventAttributes[];
}

export interface EventRequest {
  Title: string;
  Description?: string;
  resident: number;
}

export interface Event {
  title: string;
  resident: number;
  description: string;
  id?: number;
  photos?: Media[];
  songs?: Media[];
}

export const eventApi = createApi({
  reducerPath: "eventApi",
  baseQuery: graphqlRequestBaseQuery({
    url: process.env.REACT_APP_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token =
        (getState() as RootState).auth.token || localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      // headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Event"],
  endpoints: (build) => ({
    createEvent: build.mutation<Event, Partial<EventRequest>>({
      query: (event) => ({
        document: gql`
          mutation CreateEventMutation($event: EventInput!) {
            addEvent(event: $event) {
              id
              title
              description
            }
          }
        `,
        variables: {
          event 
        }
      }),
      transformResponse: (response: EventResponse) => response.addEvent,
    }),
    getEvent: build.query<Event, number>({
      query: (id) => ({
        document: gql`
         query GetEventQuery($id: int!) {
           getEvent(id: $id) {
            id
            title
            description
           }
         }
        `,

        variables: {
          id
        }

      }),
      transformResponse: (response: EventResponse ) => response.getEvent
    }),

    getEvents: build.query<Event[], void>({
      query: () => ({
        document: gql`
          query GetEventsQuery {
            allEvents {
              id
              title
              description
            }
          }
        `,
        
      }),
      transformResponse: (response: EventResponse) => response.allEvents
    }),

    updateEvent: build.mutation<Event, number>({
      query: (id) => ({
        document: gql`
          mutation UpdateEventMutation($id: int!) {
             updateEvent(id: $id) {
              id
              title
              description
             }
          }
        `,
        variables: {
          id
        }
      }),
      transformResponse: (response: EventResponse) => response.updateEvent
    }),

    deleteEvent: build.mutation<number, number>({
      query: (id) => ({
        document: gql`
         mutation  DeleteEventMutation($id: int) {
          deleteEvent(id: $id) {
            id
          }
         }
        `,
        varibles: {
          id
        }
      }),
      transformResponse: (response: DeleteResponse) => response.deleteEvent.id
      
    }),
  }),
});

export const {
  useCreateEventMutation,
  useDeleteEventMutation,
  useGetEventQuery,
  useGetEventsQuery,
  useUpdateEventMutation,
} = eventApi;
