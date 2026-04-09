import type { Channel } from './channel';
import type { UserBase } from './user';
import type { PaginationParams, PaginatedList } from './common';
export interface Event {
  id: number;
  name: string;
  creator_id: number;
  channel_id: number;
  begin_time: string;
  end_time: string;
  create_time: string;
  update_time: string;
  location: string;
  location_detail: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  channel: Channel;
  creator: UserBase;
  images: string[];
  likes_count: number;
  goings_count: number;
  me_likes: boolean;
  me_going: boolean;
}

export type EventListParams = PaginationParams & {
  after?: number | string;
  before?: number | string;
  channels?: string; // comma-separated IDs
  keyword?: string;
};

export type EventListResponse = PaginatedList<Event, 'events'> & {
  total: number;
};

export type ParticipantListResponse = {
  users: UserBase[];
};

export type LikeListResponse = PaginatedList<UserBase, 'users'>;
