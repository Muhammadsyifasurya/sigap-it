import { apiClient } from '../apiClient';
import { AuthResponse } from '../../domain/models/Auth';

export const authRepository = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Fungsi tambahan misal getProfile, register bisa ditambah di sini nanti
};
