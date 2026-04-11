import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../api/auth';

interface AuthState {
  token: string | null;
  user: User | null;
}

const TOKEN_KEY = 'cm_token';
const USER_KEY  = 'cm_user';

const initialState: AuthState = {
  token: sessionStorage.getItem(TOKEN_KEY),
  user:  JSON.parse(sessionStorage.getItem(USER_KEY) ?? 'null'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token;
      state.user  = action.payload.user;
      sessionStorage.setItem(TOKEN_KEY, action.payload.token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(action.payload.user));
    },
    logout(state) {
      state.token = null;
      state.user  = null;
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
