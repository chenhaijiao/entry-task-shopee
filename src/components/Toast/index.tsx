import React, { useEffect, useState, type CSSProperties } from 'react';
import ReactDOM from 'react-dom';
import clsx from 'clsx';
import './style.scss';

type ToastMessage = {
  id: number;
  content: string;
  type?: 'info' | 'error' | 'success';
  duration?: number;
  anchorId?: string;
};

type Listener = (msg: ToastMessage) => void;

let idCounter = 1;
const listeners = new Set<Listener>();

type ShowToastOptions = {
  content: string;
  type?: ToastMessage['type'];
  duration?: number;
  anchorId?: string;
};

export const showToast = ({
  content,
  type = 'info',
  duration = 2500,
  anchorId,
}: ShowToastOptions) => {
  const msg: ToastMessage = { id: idCounter++, content, type, duration, anchorId };
  listeners.forEach((fn) => fn(msg));
};

const ToastHost: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler: Listener = (msg) => {
      setToasts((prev) => [...prev, msg]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== msg.id));
      }, msg.duration || 2500);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const resolveAnchorStyle = (anchorId?: string): CSSProperties | undefined => {
    if (!anchorId || typeof document === 'undefined') return undefined;
    const el = document.getElementById(anchorId);
    if (!el) return undefined;
    const rect = el.getBoundingClientRect();
    const top = rect.bottom;
    return {
      position: 'fixed',
      top,
    };
  };

  const node = (
    <div className="toast-wrapper">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx('toast', toast.type)}
          style={resolveAnchorStyle(toast.anchorId)}
        >
          {toast.content}
        </div>
      ))}
    </div>
  );

  if (typeof document === 'undefined') return null;
  if (!toasts.length) return null;
  const mount = document.body;
  return ReactDOM.createPortal(node, mount);
};

export default ToastHost;
