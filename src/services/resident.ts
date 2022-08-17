import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { graphqlRequestBaseQuery } from "@rtk-query/graphql-request-base-query";
import { gql } from "graphql-request";
import { RootState } from "store";
import type { Event } from "./event";

export interface ResidentRequest {
  ResidentId: string;
  RoomNo: string;
}

export interface Resident {
  id: number;
  residentId: string;
  roomNo: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResidentAttributes {
  id: number;
  attributes: {
    ResidentId: string;
    RoomNo: string;
    createdAt?: string;
    updatedAt?: string;
    events?: Event[];
  };
}
export interface ResidentResponse {
  allResidents: Resident[];
  addResident: Resident;
  updateResident: Resident;
  getResident:  Resident
}

export interface ResidentResponses {
  data: ResidentAttributes[];
}

export const residentApi = createApi({
  reducerPath: "residentApi",
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
  tagTypes: ["Resident"],
  endpoints: (build) => ({
    createResident: build.mutation<Resident, Partial<ResidentRequest>>({
      query: (resident) => ({
        document: gql`
          mutation CreateResident($resident: ResidentInput!) {
            addResident(resident: $resident) {
              id
              residentId
              roomNo
              createdAt
              updatedAt
            }
          }
        `,
        variables: {
          resident,
        },
      }),
      transformResponse: (response: ResidentResponse) =>
        response.addResident,
    }),
    getResident: build.query<Resident, number>({
      query: (id) => ({
        document: gql`
          query GetResidentQuery($id: int!) {
            getResident(id: $id) {
              id
              residentId
              roomNo
              createdAt
              updatedAt
            }
          }       
        `,
        variables: {
          id
        }
      }),
      transformResponse: (response: ResidentResponse ) => response.getResident
    }),

    getResidents: build.query<Resident[], void>({
      query: () => ({
        document: gql`
         query getResidents {
          allResidents {
            id
            residentId
            roomNo
            createdAt
            updatedAt
          }
          
          }
        `,
      }),
      transformResponse: (response: ResidentResponse) =>
        response.allResidents,
    }),

    updateResident: build.mutation<Resident, Resident>({
      query: ({ id, residentId, roomNo }) => ({
        document: gql`
          mutation UpdateResidentMutation($input: UpdateResidentInput!) {
            updateResident(input: $input) {
              id
              residentId
              roomNo
              createdAt
              updatedAt
            }
          }
        `,
        variables: {
          input: {
            id,
            ResidentId: residentId,
            RoomNo: roomNo,
          },
        },
      }),
      transformResponse: (response: ResidentResponse) =>
        response.updateResident,
    }),

    deleteResident: build.mutation<Resident, number>({
      query: (id) => ({
        document: gql`
          mutation DeleteResidentMutation($id: int) {
            deleteResident(id: $id) {
              id
            }
          }
        `,
        variables: {
          id,
        },
      }),
    }),
  }),
});

export const { getResidents} = residentApi.endpoints

export const {
  useCreateResidentMutation,
  useDeleteResidentMutation,
  useGetResidentQuery,
  useGetResidentsQuery,
  useUpdateResidentMutation,
} = residentApi;
