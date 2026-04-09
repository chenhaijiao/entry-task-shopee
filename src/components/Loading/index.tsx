import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import './style.scss';

type Props = {
  text?: string;
  fullscreen?: boolean;
};

const Loading: React.FC<Props> = ({ text = '', fullscreen = false }) => {
  return (
    <div className={clsx('loading-shell', { fullscreen })}>
      <div className="loading-spinner">
        <svg className="spinner-svg" viewBox="0 0 50 50" role="presentation">
          <circle className="spinner-circle" cx="25" cy="25" r="20" />
        </svg>
      </div>
      <div className="loading-text">{text}</div>
    </div>
  );
};

export default Loading;

type LoadingState = {
  active: boolean;
  text?: string;
};

type Listener = (state: LoadingState) => void;

let loadingCount = 0;
let loadingText: string | undefined;
const listeners = new Set<Listener>();

const emit = () => {
  const state = { active: loadingCount > 0, text: loadingText };
  listeners.forEach((listener) => listener(state));
};

export const startLoading = (text?: string) => {
  loadingCount += 1;
  if (text) loadingText = text;
  emit();
};

export const stopLoading = () => {
  loadingCount = Math.max(0, loadingCount - 1);
  if (loadingCount === 0) {
    loadingText = undefined;
  }
  emit();
};

export const setLoading = (next: boolean, text?: string) => {
  if (next) startLoading(text);
  else stopLoading();
};

export const subscribeLoading = (listener: Listener) => {
  listeners.add(listener);
  listener({ active: loadingCount > 0, text: loadingText });
  return () => {
    listeners.delete(listener);
  };
};

export const useGlobalLoading = () => {
  const [state, setState] = useState<LoadingState>({
    active: loadingCount > 0,
    text: loadingText,
  });

  useEffect(() => subscribeLoading(setState), []);

  return state;
};

export const GlobalLoadingOverlay: React.FC = () => {
  const { active, text } = useGlobalLoading();
  if (!active) return null;
  return <Loading text={text} fullscreen />;
};

type OverlayProps = Props & {
  loading: boolean;
  children?: React.ReactNode;
  className?: string;
  maskClassName?: string;
};

export function LoadingOverlay({
  loading,
  fullscreen = false,
  text,
  children,
  className,
  maskClassName,
}: OverlayProps) {
  const overlay = loading ? (
    <div
      className={clsx('loading-overlay', maskClassName, {
        fullscreen,
      })}
    >
      <Loading text={text} fullscreen={fullscreen} />
    </div>
  ) : null;

  if (!children) return overlay;

  return (
    <div className={clsx('loading-overlay-container', className)}>
      {children}
      {overlay}
    </div>
  );
}
