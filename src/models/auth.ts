import { useState, useCallback, useEffect } from 'react';
import { history } from 'umi';
import { clearToken, getToken, setToken } from '@/utils/storage';
import {
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
  fetchMe,
} from '@/services';
import { store } from '@/store';
import { setUser as setUserAction } from '@/store/userSlice';

export default function useAuthModel() {
  const [token, setTokenState] = useState<string>(getToken());
  const [loading, setLoading] = useState(false);
  const authed = !!token;

  const redirectAfterAuth = () => {
    const search = new URLSearchParams(history.location.search);
    const redirect = search.get('redirect');
    history.replace(redirect || '/list');
  };

  const persistToken = useCallback((nextToken: string) => {
    setTokenState(nextToken);
    if (nextToken) setToken(nextToken);
    else clearToken();
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      setLoading(true);
      try {
        const res = await loginApi({ username, password });
        persistToken(res.token);
        store.dispatch(setUserAction(res.user));
        redirectAfterAuth();
        return res;
      } finally {
        setLoading(false);
      }
    },
    [persistToken],
  );

  const register = useCallback(
    async (username: string, password: string, email: string, avatar: string) => {
      setLoading(true);
      try {
        const res = await registerApi({ username, password, email, avatar });
        persistToken(res.token);
        store.dispatch(setUserAction('user' in res ? res.user : null));
        redirectAfterAuth();
        return res;
      } finally {
        setLoading(false);
      }
    },
    [persistToken],
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      if (token) await logoutApi();
    } catch (e) {
      console.warn('logout failed', e);
    } finally {
      persistToken('');
      store.dispatch(setUserAction(null));
      setLoading(false);
      history.replace('/login');
    }
  }, [persistToken, token]);

  useEffect(() => {
    if (!token) {
      store.dispatch(setUserAction(null));
      return;
    }
    let cancelled = false;
    const loadUser = async () => {
      try {
        const profile = await fetchMe();
        if (cancelled) return;
        store.dispatch(
          setUserAction({
            id: profile.id,
            username: profile.username,
            email: profile.email,
            avatar: profile.avatar,
          }),
        );
      } catch (err) {
        if (cancelled) return;
        console.warn('fetch user failed', err);
        clearToken();
        setTokenState('');
        store.dispatch(setUserAction(null));
        history.replace('/login');
      }
    };
    loadUser();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return {
    token,
    loading,
    authed,
    login,
    register,
    logout,
  };
}
