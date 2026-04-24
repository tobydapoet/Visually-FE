import type { ContentType } from "../../constants/contentType.enum";
import type { MentionItem } from "./mention.type";

export type ContentDefaultResponse = {
  id: number;
  caption: string;
  userId: string;
  username: string;
  avatarUrl: string;

  thumbnailUrl: string;
  mediaUrl: string;

  likeCount: number;
  commentCount: number;
  saveCount: number;
  repostCount: number;

  createdAt: string;

  tags: {
    id: number;
    name: string;
  }[];
  mentions: MentionItem[];

  isLiked: boolean;
  isCommented: boolean;
  isSaved: boolean;
  isReposted: boolean;

  originalType: "POST" | "SHORT";
};

export type ContentDefaultPageResponse = {
  content: ContentDefaultResponse[];
  page: number;
  size: number;
  total: number;
};

export type ContentMangeResponse = {
  id: number;
  caption?: string;

  userId: string;
  username: string;
  avatarUrl?: string;

  thumbnailUrl?: string;

  createdAt: Date;
  updatedAt?: Date;

  mentions?: MentionItem[];
};

export type ContentMangePageResponse = {
  content: ContentMangeResponse[];
  page: number;
  size: number;
  total: number;
};

export type ContentSearchResponse = {
  id: number;
  userId: string;
  likeCount: number;
  commentCount: number;
  thumbnailUrl: string;
  type: ContentType;
  createdAt: Date;
};
