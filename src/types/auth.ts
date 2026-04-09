import type { UserBase } from './user';

export type RegisterBody = {
  username: string;
  password: string;
  email: string;
  avatar: string;
};

export type LoginBody = {
  username: string;
  password: string;
};

export type AuthUser = UserBase & {
  email: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type RegisterResponse =
  | {
      token: string;
      userId: number;
    }
  | AuthResponse;
