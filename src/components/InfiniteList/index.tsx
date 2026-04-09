import React, { useEffect, useRef } from 'react';
import Loading from '@/components/Loading';
import './style.scss';

type Props<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  empty?: React.ReactNode;
  error?: string | null;
  onRetry?: () => void;
};

function InfiniteList<T>({
  items,
  renderItem,
  hasMore,
  loading,
  onLoadMore,
  empty,
  error,
  onRetry,
}: Props<T>) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || error) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loading) {
            onLoadMore();
          }
        });
      },
      { rootMargin: '120px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore, error]);

  return (
    <>
      {items.map((item, idx) => renderItem(item, idx))}
      {!items.length && !loading && !error ? empty || <div className="empty">No data</div> : null}
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
      <div ref={sentinelRef} />
      {loading ? <Loading text="Loading..." /> : null}
      {!hasMore && items.length ? <div className="end-text">No More</div> : null}
    </>
  );
}

export default InfiniteList;
