import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.token = action.payload.token;
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
