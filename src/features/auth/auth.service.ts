import { api } from '../../shared/api/client';
import { apiRoutes } from '../../shared/api/api-routes';
import type { LoginResponse } from '../../shared/api/types';

export const authService = {
  async login(matricula: string, password: string) {
    const { data } = await api.post<LoginResponse>(apiRoutes.auth.login, { matricula, password });
    return data;
  },

  async defineFirstAccessPassword(password: string, token: string) {
    const { data } = await api.patch<{ message: string }>(
      apiRoutes.auth.firstAccessPassword,
      { password },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return data;
  },
};
