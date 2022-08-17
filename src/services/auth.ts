import { build } from "@reduxjs/toolkit/dist/query/core/buildMiddleware/cacheLifecycle";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { graphqlRequestBaseQuery } from "@rtk-query/graphql-request-base-query";
import { gql } from "graphql-request";
import { RootState } from "store";

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  jwt?: string;
}
export interface UserResponse {
    login: User;
}


export interface CurrentUserResponse {
     currentUser: User;
  }

export const authApi = createApi({
  reducerPath: "authApi",
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
  tagTypes: ["LoginRequest", "User", "UserResponse"],

  endpoints: (build) => ({
    login: build.mutation<User, Partial<LoginRequest>>({
      query: ({ identifier, password }) => ({
        document: gql`
          mutation UserLogin($input: LoginInput!) {
            login(input: $input) {
              id
              username
              email
              jwt
            }
          }
        `,
        variables: {
          input: {
            identifier,
            password,
          },
        },
      }),
      transformResponse: (response: UserResponse) => response.login
    }),
    getCurrentUser: build.query<User, void>({
      query: () => ({
        document: gql`
        query GetCurrentUser {
            currentUser {
                id
                username
                email
            }
        }
       `,
      }),
      transformResponse: (response: CurrentUserResponse) => response.currentUser,
    }),
  }),
});

export const { getCurrentUser } = authApi.endpoints;

export const { useLoginMutation, useGetCurrentUserQuery } = authApi;
