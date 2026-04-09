import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './style.scss';

type EtButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
  children: ReactNode;
};

function EtButton({
  variant = 'primary',
  loading,
  disabled,
  children,
  className,
  ...rest
}: EtButtonProps) {
  return (
    <button
      className={`et-button et-${variant} ${className ?? ''}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="spinner" />}
      <span className="label">{children}</span>
    </button>
  );
}

export default EtButton;
