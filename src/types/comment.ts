import type { UserBase } from './user';
import type { PaginationParams } from './common';

export type Comment = {
  id: number;
  userId: number;
  eventId: number;
  create_time: string | number;
  comment: string;
  user: UserBase;
};

export type CommentListParams = PaginationParams;

export type CommentListResponse = {
  comments: Comment[];
  hasMore?: boolean;
};

export type PostCommentBody = {
  comment: string;
};
