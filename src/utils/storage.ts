const TOKEN_KEY = 'entry_task_token';

export type StoredUser = {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
};

const getSession = () => (typeof sessionStorage === 'undefined' ? null : sessionStorage);

export const getToken = () => {
  const store = getSession();
  if (!store) return '';
  return store.getItem(TOKEN_KEY) || '';
};

export const setToken = (token: string) => {
  const store = getSession();
  if (!store) return;
  store.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  const store = getSession();
  if (!store) return;
  store.removeItem(TOKEN_KEY);
};
