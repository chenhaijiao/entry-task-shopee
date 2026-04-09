import { request } from '../http/request';
import type { ChannelListResponse } from '@/types/channel';

export const fetchChannels = () =>
  request<ChannelListResponse>('/channels', {
    method: 'GET',
  });
