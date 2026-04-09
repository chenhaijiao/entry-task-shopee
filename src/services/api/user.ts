import { request } from '../http/request';
import type { UserEventsParams, UserEventsResponse, UserProfile } from '@/types/user';

export const fetchMe = () =>
  request<UserProfile>('/user', {
    method: 'GET',
  });

export const fetchUserEvents = (params: UserEventsParams) =>
  request<UserEventsResponse>('/user/events', {
    method: 'GET',
    params,
  });
