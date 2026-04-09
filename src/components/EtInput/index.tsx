import type { InputHTMLAttributes, ReactNode } from 'react';
import './style.scss';
import EtIcon from '../EtIcon';

type EtInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  error?: string;
  iconSrc?: string;
};

function EtInput({ label, error, iconSrc, className, ...rest }: EtInputProps) {
  return (
    <label className={`et-input-wrapper ${className}`}>
      {label && <span className="label">{label}</span>}
      <div className={`inputBox ${error ? 'error' : ''}`}>
        {iconSrc && <EtIcon src={iconSrc} className="icon" alt="" />}
        <input className="input" {...rest} />
      </div>
      {error && <span className="errorText">{error}</span>}
    </label>
  );
}

export default EtInput;
