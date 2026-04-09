import type { Event } from './event';
import type { PaginationParams, PaginatedList } from './common';

export type UserBase = {
  id: number;
  username: string;
  avatar?: string;
};

export type UserProfile = UserBase & {
  email: string;
  likes_count: number;
  past_count: number;
  goings_count: number;
};

export type UserEventsParams = PaginationParams & {
  type: 'liked' | 'going' | 'past';
};

export type UserEventsResponse = PaginatedList<Event, 'events'> & {
  total: number;
};
