import { request } from '../http/request';
import type { AuthResponse, LoginBody, RegisterBody, RegisterResponse } from '@/types/auth';

export const login = (body: LoginBody) =>
  request<AuthResponse>('/auth/token', {
    method: 'POST',
    body,
  });

export const register = (body: RegisterBody) =>
  request<RegisterResponse>('/join', {
    method: 'POST',
    body,
  });

export const logout = () =>
  request<void>('/auth/token', {
    method: 'DELETE',
  });
