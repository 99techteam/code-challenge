import {createSlice, configureStore} from '@reduxjs/toolkit';

const initialState = false;
const isLoginSlice = createSlice({
  name: 'isLogin',
  initialState,
  reducers: {
    toggleIsLogin: (state) => !state,
  },
});
const store = configureStore({
  reducer: {
    isLogin: isLoginSlice.reducer,
  },
});
export const {toggleIsLogin} = isLoginSlice.actions;
export default store;