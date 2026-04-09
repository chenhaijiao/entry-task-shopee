import '@/assets/styles/global.scss';
import type { ReactNode } from 'react';
import { history } from 'umi';
import { Provider } from 'react-redux';
import { clearToken } from './utils/storage';
import { isApiError, setUnauthorizedHandler } from './services/http/request';
import { store } from './store';
import { clearUser } from './store/userSlice';
import { showToast } from '@/components/Toast';

const LOGIN_PATHS = ['/login'];

if (typeof window !== 'undefined') {
  let lastToastAt = 0;
  let lastToastContent = '';
  window.addEventListener('unhandledrejection', (event) => {
    const reason = (event as PromiseRejectionEvent).reason;
    if (!isApiError(reason)) return;
    const content =
      reason.error === 'timeout' ? 'Request Timout Out' : reason.message || 'System Error';
    const now = Date.now();
    if (content === lastToastContent && now - lastToastAt < 2000) return;
    lastToastAt = now;
    lastToastContent = content;
    showToast({ content, type: 'error' });
    event.preventDefault();
  });
}

setUnauthorizedHandler(() => {
  if (!LOGIN_PATHS.includes(history.location.pathname)) {
    clearToken();
    store.dispatch(clearUser());
    const redirect = encodeURIComponent(history.location.pathname + history.location.search);
    history.push(`/login?redirect=${redirect}`);
  }
});

export function rootContainer(container: ReactNode) {
  return <Provider store={store}>{container}</Provider>;
}
