import { createSlice } from "@reduxjs/toolkit";

import { Resident, residentApi } from "services/resident";
import { RootState } from "store";

type ResidentState = {
  resident: Resident | null;
  residents: Resident[];
};

const initialState = { resident: null, residents: [] };

const residentSlice = createSlice({
  name: "resident",
  initialState: initialState as ResidentState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        residentApi.endpoints.createResident.matchFulfilled,
        (state, { payload }) => {
          state.resident = payload;
          state.residents = [...state.residents, state.resident];
        }
      )
      .addMatcher(
        residentApi.endpoints.updateResident.matchFulfilled,
        (state, { payload }) => {
          state.resident = payload;
          
        }
      )
      .addMatcher(
        residentApi.endpoints.getResident.matchFulfilled,
        (state, { payload }) => {
          state.resident = payload;
        }
      )
      .addMatcher(
        residentApi.endpoints.deleteResident.matchFulfilled,
        (state, { payload }) => {
          state.residents = state.residents.filter(
            (resident) => resident.id != payload.id
          );
          state.resident = payload;
          
        }
      )
      .addMatcher(
        residentApi.endpoints.getResidents.matchFulfilled,
        (state, { payload }) => {
          const residents = payload.map((res) => {
            return {
              id: res.id,
              residentId: res.residentId,
              roomNo: res.roomNo,
              createdAt: res.createdAt,
              updatedAt: res.updatedAt
            };
          });
          state.residents = residents;
        }
      );
  },
});

export default residentSlice.reducer;

export const selectResident = (state: RootState) => state.resident.resident;
export const selectResidents = (state: RootState) => state.resident.residents;