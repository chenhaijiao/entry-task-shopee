import { request } from '../http/request';
import type {
  Comment,
  CommentListParams,
  CommentListResponse,
  PostCommentBody,
} from '@/types/comment';

export const fetchComments = (eventId: number, params?: CommentListParams) =>
  request<CommentListResponse>(`/events/${eventId}/comments`, {
    method: 'GET',
    params,
  });

export const postComment = (eventId: number, body: PostCommentBody) =>
  request<Comment>(`/events/${eventId}/comments`, {
    method: 'POST',
    body,
  });
