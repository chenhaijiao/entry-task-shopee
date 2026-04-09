import type { CSSProperties } from 'react';

type EtImageProps = {
  src?: string;
  alt?: string;
  color?: string;
  className?: string;
  style?: CSSProperties;
  isSvgSource?: boolean;
  onClick?: () => void;
  loading?: 'eager' | 'lazy';
};

function EtImage({
  src,
  alt = '',
  color,
  className,
  style,
  isSvgSource = false,
  onClick,
  loading = 'lazy',
}: EtImageProps) {
  if (!src) return <span className={className} style={style} onClick={onClick}></span>;

  if (!isSvgSource) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        onClick={onClick}
        loading={loading}
      />
    );
  }

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

export default EtImage;
