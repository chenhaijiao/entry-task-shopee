import { request } from '../http/request';
import type {
  Event,
  EventListParams,
  EventListResponse,
  ParticipantListResponse,
  LikeListResponse,
} from '@/types/event';

export const fetchEvents = (params: EventListParams) =>
  request<EventListResponse>('/events', {
    method: 'GET',
    params,
  });

export const fetchEventDetail = (eventId: number) =>
  request<{ event: Event }>(`/events/${eventId}`, {
    method: 'GET',
  });

export const fetchParticipants = (eventId: number) =>
  request<ParticipantListResponse>(`/events/${eventId}/participants`, {
    method: 'GET',
  });

export const joinEvent = (eventId: number) =>
  request<void>(`/events/${eventId}/participants`, {
    method: 'POST',
  });

export const quitEvent = (eventId: number) =>
  request<void>(`/events/${eventId}/participants`, {
    method: 'DELETE',
  });

export const fetchLikes = (eventId: number, params: { offset?: number; limit?: number }) =>
  request<LikeListResponse>(`/events/${eventId}/likes`, {
    method: 'GET',
    params,
  });

export const likeEvent = (eventId: number) =>
  request<void>(`/events/${eventId}/likes`, {
    method: 'POST',
  });

export const unlikeEvent = (eventId: number) =>
  request<void>(`/events/${eventId}/likes`, {
    method: 'DELETE',
  });
