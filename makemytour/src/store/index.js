import { configureStore, createSlice } from "@reduxjs/toolkit";

const saveusertolocalstorage = (user) => {
  try {
    if (typeof window !== "undefined" && localStorage) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  } catch {}
};

const loaduserfromlocalstorage = () => {
  try {
    if (typeof window !== "undefined" && localStorage) {
      const saved = localStorage.getItem("user");
      if (saved) return { user: JSON.parse(saved) };
    }
  } catch {}
  return { user: null };
};

const userSlice = createSlice({
  name: "user",
  initialState: loaduserfromlocalstorage(),
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      saveusertolocalstorage(action.payload);
    },
    clearUser: (state) => {
      state.user = null;
      try {
        if (typeof window !== "undefined" && localStorage) {
          localStorage.removeItem("user");
        }
      } catch {}
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
});

export default store;