import { useState } from 'react';
import { authRepository } from '../data/repositories/authRepository';
import { useAuthStore } from '../store/authStore';
import { User } from '../domain/models/Auth';

// Bantuan decode JWT token secara sederhana (tanpa library jwt-decode)
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: setLoginData, logout, isAuthenticated, user } = useAuthStore();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authRepository.login(email, password);

      // Backend JWT berisi informasi payload user (sub/id, email, name, role)
      // Kita decode payload ini untuk mendapatkan data user.
      const decoded = decodeJWT(data.access_token);

      if (!decoded) {
        throw new Error('Token tidak valid');
      }

      // Ambil data lengkap user langsung dari database pakai token yang baru didapat
      const { apiClient } = await import('../data/apiClient');
      const profileResponse = await apiClient.get(`/users/${decoded.sub}`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });

      const fullUser = profileResponse.data.data;

      // Mapping payload ke format User Domain kita
      const userData: User = {
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        role: {
          id: fullUser.role?.id || decoded.roleId || 0,
          name: fullUser.role?.name || decoded.role || 'Staff',
        },
        department: {
          id: fullUser.department?.id || 0,
          name: fullUser.department?.name || 'Umum',
        },
        position: fullUser.position ? {
          id: fullUser.position.id,
          name: fullUser.position.name,
        } : undefined
      };

      setLoginData(userData, data.access_token);
      return userData; // Berhasil login, return userData
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Login gagal, periksa email & password.');
      return false; // Gagal login
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    logout,
    isLoading,
    error,
    isAuthenticated,
    user,
  };
};
