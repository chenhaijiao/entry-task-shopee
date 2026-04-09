export type PaginationParams = {
  offset?: number;
  limit?: number;
};

export type PaginatedList<T, K extends string> = {
  hasMore: boolean;
} & Record<K, T[]>;
