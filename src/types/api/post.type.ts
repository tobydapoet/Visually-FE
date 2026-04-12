import type { ContentStatus } from "../../constants/contentStatus.enum";

export class PostResponse {
  id!: number;
  caption?: string;
  userId!: string;
  username!: string;
  avatarUrl?: string;
  likeCount!: number;
  commentCount!: number;
  shareCount!: number;
  mediaUrl?: string;
}

export class PostResponsePage {
  page!: number;
  size!: number;
  total!: number;
  content!: PostResponse[];
}

export type PostDetailResponse = {
  id: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  caption?: string;

  likeCount: number;
  commentCount: number;
  shareCount: number;

  medias: {
    id: number;
    url: string;
  }[];

  status: ContentStatus;

  isLiked: boolean;
  isCommented: boolean;
  isShared: boolean;
  isSaved: boolean;

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
