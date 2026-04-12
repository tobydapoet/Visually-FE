import type { ContentStatus } from "../../constants/contentStatus.enum";

export type ShortResponse = {
  id: number;
  username: string;
  avatarUrl?: string;
  userId: string;
  caption?: string;
  thumbnailUrl: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;

  isLiked: false;
  isCommented: false;
  isShared: false;
  isSaved: false;

  createdAt: string;

  mentions: {
    userId: string;
    username: string;
  }[];
};

export type ShortResponsePage = {
  page: number;
  size: number;
  total: number;
  content: ShortResponse[];
};

export type ShortDetailResponse = {
  id: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  caption?: string;

  mediaUrl: string;
  thumbnailUrl?: string;

  likeCount: number;
  commentCount: number;
  shareCount: number;

  isLiked: boolean;
  isCommented: boolean;
  isShared: boolean;
  isSaved: boolean;

  status: ContentStatus;
  createdAt: string;

  mentions: {
    userId: string;
    username: string;
  }[];

  tags: {
    id: number;
    targetId: number;
    name: string;
    createdAt: string;
  }[];
};
