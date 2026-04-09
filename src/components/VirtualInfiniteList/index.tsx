import React, { useEffect, useMemo, useRef, useState } from 'react';
import Loading from '@/components/Loading';
import './style.scss';

type Key = string | number;

type Props<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getKey?: (item: T, index: number) => Key;
  estimatedItemHeight?: number;
  overscan?: number;
  itemGap?: number;
  scrollContainer?: HTMLElement | null;
  resetKey?: string | number;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  empty?: React.ReactNode;
  error?: string | null;
  onRetry?: () => void;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const findStartIndex = (offsets: number[], scrollTop: number) => {
  let low = 0;
  let high = offsets.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (offsets[mid] <= scrollTop) low = mid + 1;
    else high = mid - 1;
  }
  return Math.max(0, high);
};

const findEndIndex = (offsets: number[], heights: number[], endTop: number) => {
  let low = 0;
  let high = offsets.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    const bottom = offsets[mid] + heights[mid];
    if (bottom < endTop) low = mid + 1;
    else high = mid - 1;
  }
  return Math.min(offsets.length - 1, low);
};

function VirtualInfiniteList<T>({
  items,
  renderItem,
  getKey,
  estimatedItemHeight = 160,
  overscan = 6,
  itemGap = 8,
  scrollContainer,
  resetKey,
  hasMore,
  loading,
  onLoadMore,
  empty,
  error,
  onRetry,
}: Props<T>) {
  const heightsRef = useRef<number[]>([]);
  const [measureVersion, setMeasureVersion] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const observedRowRef = useRef<Map<number, HTMLElement>>(new Map());
  const containerResizeObserverRef = useRef<ResizeObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    heightsRef.current = [];
    observedRowRef.current.clear();
    setMeasureVersion((v) => v + 1);
  }, [resetKey]);

  useEffect(() => {
    if (items.length < heightsRef.current.length) {
      heightsRef.current = [];
      setMeasureVersion((v) => v + 1);
    }
    heightsRef.current.length = items.length;
  }, [items.length]);

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const observed = observedRowRef.current;
    const ro = new ResizeObserver((entries) => {
      let changed = false;
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        const index = Number(el.dataset.index);
        if (!Number.isFinite(index) || index < 0) continue;
        const next = Math.max(1, Math.ceil(el.getBoundingClientRect().height));
        const prev = heightsRef.current[index];
        if (!prev || Math.abs(prev - next) > 1) {
          heightsRef.current[index] = next;
          changed = true;
        }
      }
      if (changed) setMeasureVersion((v) => v + 1);
    });
    resizeObserverRef.current = ro;
    return () => {
      ro.disconnect();
      resizeObserverRef.current = null;
      observed.clear();
    };
  }, []);

  useEffect(() => {
    const target = scrollContainer || window;
    const getScrollTop = () => {
      if (scrollContainer) return scrollContainer.scrollTop;
      return window.scrollY || document.documentElement.scrollTop || 0;
    };
    const getViewportHeight = () => {
      if (scrollContainer) return scrollContainer.clientHeight;
      return window.innerHeight || 0;
    };

    let raf = 0;
    const sync = () => {
      setScrollTop(getScrollTop());
      setViewportHeight(getViewportHeight());
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setScrollTop(getScrollTop());
      });
    };
    const onResize = () => {
      setViewportHeight(getViewportHeight());
    };

    sync();
    target.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    if (scrollContainer && typeof ResizeObserver !== 'undefined') {
      const cro = new ResizeObserver(onResize);
      containerResizeObserverRef.current = cro;
      cro.observe(scrollContainer);
    }

    return () => {
      target.removeEventListener('scroll', onScroll as EventListener);
      window.removeEventListener('resize', onResize as EventListener);
      if (raf) window.cancelAnimationFrame(raf);
      containerResizeObserverRef.current?.disconnect();
      containerResizeObserverRef.current = null;
    };
  }, [scrollContainer]);

  const { offsets, heights, totalHeight } = useMemo(() => {
    void measureVersion;
    const n = items.length;
    const estimated = Math.max(1, Math.ceil(estimatedItemHeight + itemGap));
    const nextOffsets = new Array<number>(n);
    const nextHeights = new Array<number>(n);
    let acc = 0;
    for (let i = 0; i < n; i += 1) {
      nextOffsets[i] = acc;
      const h = heightsRef.current[i] || estimated;
      nextHeights[i] = h;
      acc += h;
    }
    return { offsets: nextOffsets, heights: nextHeights, totalHeight: acc };
  }, [items.length, estimatedItemHeight, itemGap, measureVersion]);

  const { startIndex, endIndex, translateY } = useMemo(() => {
    const n = items.length;
    if (!n) return { startIndex: 0, endIndex: -1, translateY: 0 };
    const viewH = viewportHeight || (scrollContainer ? scrollContainer.clientHeight : 0) || 600;
    const start = findStartIndex(offsets, scrollTop);
    const end = findEndIndex(offsets, heights, scrollTop + viewH);
    const startWithOverscan = clamp(start - overscan, 0, n - 1);
    const endWithOverscan = clamp(end + overscan, 0, n - 1);
    return {
      startIndex: startWithOverscan,
      endIndex: endWithOverscan,
      translateY: offsets[startWithOverscan] || 0,
    };
  }, [heights, items.length, offsets, overscan, scrollTop, scrollContainer, viewportHeight]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || error) return;
    if (typeof IntersectionObserver === 'undefined') return;
    const root = scrollContainer || null;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loading) onLoadMore();
        });
      },
      { root, rootMargin: '240px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [error, hasMore, loading, onLoadMore, scrollContainer]);

  const observeRow = (index: number) => (el: HTMLDivElement | null) => {
    const ro = resizeObserverRef.current;
    const prev = observedRowRef.current.get(index);
    if (prev && ro) ro.unobserve(prev);
    if (!el || !ro) {
      observedRowRef.current.delete(index);
      return;
    }
    el.dataset.index = String(index);
    observedRowRef.current.set(index, el);
    ro.observe(el);
  };

  const resolvedGetKey = getKey || ((_: T, index: number) => index);

  if (!items.length && !loading && !error) {
    return <>{empty || <div className="empty">No data</div>}</>;
  }

  return (
    <div className="virtual-infinite-list">
      {error ? (
        <div className="error">
          <div>{error}</div>
          {onRetry ? (
            <button className="retry-btn" onClick={onRetry}>
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="vil-spacer" style={{ height: totalHeight, position: 'relative' }}>
        <div
          className="vil-inner"
          style={{
            transform: `translate3d(0, ${translateY}px, 0)`,
            willChange: 'transform',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {endIndex >= startIndex
            ? items.slice(startIndex, endIndex + 1).map((item, localIdx) => {
                const index = startIndex + localIdx;
                const key = resolvedGetKey(item, index);
                return (
                  <div
                    key={key}
                    ref={observeRow(index)}
                    className="vil-row"
                    style={{ paddingBottom: itemGap }}
                  >
                    {renderItem(item, index)}
                  </div>
                );
              })
            : null}
        </div>
        <div
          ref={sentinelRef}
          className="vil-sentinel"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: Math.max(0, totalHeight - 1),
            height: 1,
          }}
        />
      </div>

      {loading ? <Loading text="Loading..." /> : null}
      {!hasMore && items.length ? <div className="end-text">No More</div> : null}
    </div>
  );
}

export default VirtualInfiniteList;
