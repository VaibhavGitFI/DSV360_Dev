import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: JSON.parse(localStorage.getItem("currUser")) || null,
};

const UserSlice = createSlice({
  name: "userData",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("currUser", JSON.stringify(action.payload)); 
      
    },
    clearUserData: (state) => {
      state.user = null;
      localStorage.removeItem("currUser"); 
    },
  },
});

export default UserSlice;
export const UserDataActions = UserSlice.actions;
