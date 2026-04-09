
type InfiniteScrollOptions = {
  disabled?: boolean;
  onLoadMore: () => void;
  threshold?: number;
};

export function useInfiniteScroll({
  disabled,
  onLoadMore,
  threshold = 0.6,
}: InfiniteScrollOptions) {
  return {
    disabled,
    onLoadMore,
    threshold,
  };
}
