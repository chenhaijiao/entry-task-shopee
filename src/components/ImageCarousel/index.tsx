import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './style.scss';

type Props = {
  images: string[];
};

const ImageCarousel: React.FC<Props> = ({ images }) => {
  const safeImages = useMemo(() => images || [], [images]);
  const [broken, setBroken] = useState<Record<number, boolean>>({});
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [previewTouchStartX, setPreviewTouchStartX] = useState<number | null>(null);
  const [renderIndex, setRenderIndex] = useState(safeImages.length > 1 ? 1 : 0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const snapTimeoutRef = useRef<number | undefined>();
  const startXRef = useRef<number | null>(null);

  const renderImages = useMemo(
    () =>
      safeImages.length > 1
        ? [safeImages[safeImages.length - 1], ...safeImages, safeImages[0]]
        : safeImages,
    [safeImages],
  );

  const getStepSize = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 192;
    const slide = track.querySelector('.carousel-slide') as HTMLDivElement | null;
    const gapRaw =
      typeof window !== 'undefined'
        ? parseFloat(window.getComputedStyle(track).columnGap || '0')
        : 0;
    const gap = Number.isFinite(gapRaw) ? gapRaw : 12;
    const slideWidth = slide?.getBoundingClientRect().width || 180;
    return slideWidth + gap;
  }, []);

  const moveTo = useCallback(
    (targetRenderIndex: number, behavior: ScrollBehavior = 'smooth') => {
      const track = trackRef.current;
      const step = getStepSize();
      if (!track || !step) return;

      const maxRenderIndex = renderImages.length - 1;
      const clampedIndex = Math.max(0, Math.min(maxRenderIndex, targetRenderIndex));

      track.style.transform = `translate3d(${-(clampedIndex * step)}px, 0, 0)`;
      track.style.transition = behavior === 'smooth' ? 'transform 260ms ease' : 'none';

      window.clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = window.setTimeout(
        () => {
          if (safeImages.length <= 1) {
            setIsAnimating(false);
            return;
          }
          const lastRealIndex = safeImages.length;
          const maxIdx = renderImages.length - 1;

          if (clampedIndex === 0) {
            track.style.transition = 'none';
            track.style.transform = `translate3d(${-(lastRealIndex * step)}px, 0, 0)`;
            setRenderIndex(lastRealIndex);
          } else if (clampedIndex === maxIdx) {
            track.style.transition = 'none';
            track.style.transform = `translate3d(${-(1 * step)}px, 0, 0)`;
            setRenderIndex(1);
          }
          setIsAnimating(false);
        },
        behavior === 'smooth' ? 260 : 0,
      );
    },
    [getStepSize, renderImages, safeImages.length],
  );

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsAnimating(false);
    startXRef.current = e.touches[0]?.clientX ?? null;
    setDragDelta(0);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startXRef.current === null) return;
    const x = e.touches[0]?.clientX ?? null;
    if (x === null) return;
    const delta = x - startXRef.current;
    setDragDelta(delta);
    const track = trackRef.current;
    const step = getStepSize();
    if (track && step) {
      track.style.transition = 'none';
      const base = -(renderIndex * step);
      track.style.transform = `translate3d(${base + delta}px, 0, 0)`;
    }
  };

  const handleTouchEnd = () => {
    const step = getStepSize();
    if (!step) return;
    const threshold = step * 0.4;
    let direction = 0;

    if (dragDelta < -threshold) direction = 1;
    if (dragDelta > threshold) direction = -1;

    const nextRenderIndex = renderIndex + direction;
    const nextCurrent = (currentIndex + direction + safeImages.length) % safeImages.length;

    setIsAnimating(direction !== 0);
    setRenderIndex(nextRenderIndex);
    setCurrentIndex(nextCurrent);
    setDragDelta(0);
    startXRef.current = null;
    moveTo(nextRenderIndex, direction === 0 ? 'auto' : 'smooth');
  };

  const prev = () =>
    setPreviewIndex((p) => {
      if (p === null) return p;
      return (p - 1 + safeImages.length) % safeImages.length;
    });

  const next = () =>
    setPreviewIndex((p) => {
      if (p === null) return p;
      return (p + 1) % safeImages.length;
    });

  const handlePreviewTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setPreviewTouchStartX(e.touches[0]?.clientX ?? null);
  };

  const handlePreviewTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (previewTouchStartX === null) return;
    const deltaX = (e.changedTouches[0]?.clientX ?? 0) - previewTouchStartX;
    const threshold = 40;
    if (deltaX < -threshold) {
      prev();
    } else if (deltaX > threshold) {
      next();
    }
    setPreviewTouchStartX(null);
  };

  useEffect(() => {
    const track = trackRef.current;
    const step = getStepSize();
    if (!track || !step) return;

    const base = safeImages.length > 1 ? 1 : 0;
    setRenderIndex(base);
    setCurrentIndex(0);
    track.style.transition = 'none';
    track.style.transform = `translate3d(${-(base * step)}px, 0, 0)`;

    return () => {
      window.clearTimeout(snapTimeoutRef.current);
    };
  }, [getStepSize, safeImages]);

  const trackStyle = {
    transform: `translate3d(${-(renderIndex * getStepSize()) + dragDelta}px, 0, 0)`,
    transition: isAnimating ? 'transform 260ms ease' : 'none',
  };

  if (!safeImages.length) return null;

  return (
    <div className="carousel">
      <div
        className="carousel-inner"
        ref={trackRef}
        style={trackStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {renderImages.map((image, idx) => {
          const realIndex =
            safeImages.length > 1 ? (idx - 1 + safeImages.length) % safeImages.length : idx;
          return (
            <div
              className="carousel-slide"
              key={`carousel-${realIndex}-${idx}`}
              data-seq={realIndex + 1}
              data-seq-uid={`${realIndex}-${idx}`}
              onClick={() => setPreviewIndex(realIndex)}
            >
              <img
                src={broken[realIndex] ? undefined : image}
                alt={`image-${realIndex}`}
                onError={() => setBroken((b) => ({ ...b, [realIndex]: true }))}
              />
              {broken[realIndex] ? <div className="img-fallback">图片加载失败</div> : null}
            </div>
          );
        })}
      </div>

      {previewIndex !== null ? (
        <div
          className="carousel-preview"
          onClick={() => setPreviewIndex(null)}
          onTouchStart={handlePreviewTouchStart}
          onTouchEnd={handlePreviewTouchEnd}
        >
          <div className="preview-body" onClick={(e) => e.stopPropagation()}>
            <img src={safeImages[previewIndex]} alt={`preview-${previewIndex}`} />
          </div>
          <button
            className="preview-close"
            onClick={() => setPreviewIndex(null)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ImageCarousel;
