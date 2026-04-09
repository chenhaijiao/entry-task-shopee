import type { CSSProperties } from 'react';

type EtIconProps = {
  src?: string;
  alt?: string;
  color?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
};

function EtIcon({ src, alt = '', color, className, style, onClick }: EtIconProps) {
  if (!src) return <span></span>;

  const resolvedColor = color ?? '';

  const baseStyle: CSSProperties = {
    display: 'inline-block',
    color: resolvedColor,
    backgroundColor: resolvedColor,
    mask: `url(${src}) center / contain no-repeat`,
    WebkitMask: `url(${src}) center / contain no-repeat`,
    maskType: 'alpha',
    ...style,
  };

  return (
    <span
      className={className}
      role={alt ? 'img' : 'presentation'}
      aria-label={alt || undefined}
      style={baseStyle}
      onClick={onClick}
    />
  );
}

export default EtIcon;
