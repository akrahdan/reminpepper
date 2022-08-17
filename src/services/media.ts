import { createApi } from "@reduxjs/toolkit/query/react";
import { graphqlRequestBaseQuery } from "@rtk-query/graphql-request-base-query";

import { gql } from "graphql-request";

import { RootState } from "store";
export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface MediaRequest {
  files: File[];
  refId: string;
  ref: string;
  field: string;
}

export interface Media {
  name: string;
  mime?: string;
  height?: number;
  width?: number;
  url: string;
  thumbnail?: Thumbnail;
}

export interface Thumbnail {
  name: string;
  mime: string;
  width: number;
  height: number;
  url: string;
}

export interface MediaAttributes {
  id: number;
  attributes: {
    name: string;
    width: number;
    height: number;
    mime: string;
    url: string;
    formats: {
      thumbnail: Thumbnail;
    };
  };
}
export interface MediaResponses {
  data: MediaAttributes[];
}

export interface MediaResponse {
  data: MediaAttributes;
  readFiles: {
    id: number;
  };
}

export const mediApi = createApi({
  reducerPath: "mediaApi",
  baseQuery: graphqlRequestBaseQuery({
    url: process.env.REACT_APP_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token =
        (getState() as RootState).auth.token || localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["FormData"],
  endpoints: (build) => ({
    saveMedia: build.mutation<number, Partial<MediaRequest>>({
      query: ({ field, files, ref, refId }) => ({
        document: gql`
          mutation UploadMediaMutation($media: FolderInput!) {
            readFiles(media: $media) {
              id
            }
          }
        `,
        variables: {
          field,
          files,
          ref,
          refId,
        },
      }),
      transformResponse: (response: MediaResponse) => response.readFiles.id,
    }),
    getAllMedia: build.query<MediaResponses, void>({
      query: () => ({
        url: "/api/upload/files",
        method: "GET",

        responseHandler: (response) => response.json(),
      }),
    }),

    getMedia: build.query<MediaResponse, void>({
      query: () => ({
        url: "/api/upload/files/:id",
        method: "GET",

        responseHandler: (response) => response.json(),
      }),
    }),

    deleteMedia: build.query<MediaResponse, void>({
      query: () => ({
        url: "/api/upload/files/:id",
        method: "DELETE",

        responseHandler: (response) => response.json(),
      }),
    }),
  }),
});

export const {
  useSaveMediaMutation,
  useGetAllMediaQuery,
  useGetMediaQuery,
  useDeleteMediaQuery,
} = mediApi;
