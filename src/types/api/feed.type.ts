import type { ContentStatus } from "../../constants/contentStatus.enum";
import type { ContentType } from "../../constants/contentType.enum";

export type FeedContentResponse = {
  id: number;

  userId: string;

  username: string;

  avatarUrl?: string;

  caption?: string;

  medias?: string[];

  likeCount: number;

  contentType: ContentType;

  contentId: number;

  commentCount: number;

  saveCount: number;

  repostCount: number;

  status: ContentStatus;

  createdAt: Date;

  isLiked: boolean;

  isCommented: boolean;

  isSaved: boolean;

  isReposted: boolean;

  tags: {
    id: number;
    name: string;
  }[];

  mentions: {
    userId: string;
    username: string;
  }[];
};

export type FeedContentPageResponse = {
  content: FeedContentResponse[];
  nextCursor?: number | null;
};
