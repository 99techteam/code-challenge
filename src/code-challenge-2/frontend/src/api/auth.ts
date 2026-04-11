import { api } from './client';

export interface User {
  id: string;
  email: string;
  name: string;
}

export const authApi = {
  register: (body: { email: string; name: string; password: string }) =>
    api.post<{ token: string; user: User }>('/auth/register', body).then(r => r.data),

  login: (body: { email: string; password: string }) =>
    api.post<{ token: string; user: User }>('/auth/login', body).then(r => r.data),
};
