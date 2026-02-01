import apiClient from './apiClient';
import { AuthResponse, User } from '@/types';

type BackendAuthUser = {
  id?: string;
  _id?: string;
  username?: string;
  name?: string;
  email?: string;
  role?: string;
  createdAt?: string;
};

const normalizeUser = (u: BackendAuthUser | undefined | null): User | null => {
  if (!u) return null;
  const id = (u.id || u._id || '') as string;
  if (!id) return null;
  return {
    _id: id,
    name: (u.username || u.name || '').toString() || 'User',
    email: (u.email || '').toString(),
    role: u.role,
    createdAt: u.createdAt,
  };
};

const normalizeAuthResponse = (data: any): AuthResponse => {
  const token = data?.token;
  const user = normalizeUser(data?.user);
  const message = data?.message || data?.error;

  return {
    success: Boolean(token && user),
    token,
    user: user || undefined,
    message,
    error: data?.error,
  };
};

export const authApi = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    // Backend expects `username`
    const response = await apiClient.post('/api/auth/register', {
      username: name,
      email,
      password,
    });
    return normalizeAuthResponse(response.data);
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password,
    });
    return normalizeAuthResponse(response.data);
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/api/auth/profile');
    const user = normalizeUser(response.data?.user);
    if (!user) throw new Error('Invalid profile response');
    return user;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};