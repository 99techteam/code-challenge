import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { setCredentials, logout } from '../store/authSlice';
import { authApi } from '../api/auth';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((s: RootState) => s.auth);

  async function login(email: string, password: string) {
    const data = await authApi.login({ email, password });
    dispatch(setCredentials(data));
    return data;
  }

  async function register(email: string, name: string, password: string) {
    const data = await authApi.register({ email, name, password });
    dispatch(setCredentials(data));
    return data;
  }

  function signOut() {
    dispatch(logout());
  }

  return { token, user, isAuthenticated: !!token, login, register, signOut };
}
