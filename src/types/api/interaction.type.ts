import type { CommentTargetType } from "../../constants/interaction.enum";
import type { MentionItem } from "./mention.type";

export type CommentResponse = {
  id: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  targetId: number;
  targetType: CommentTargetType;
  likeCount: number;
  replyCount: number;
  content: string;
  createdAt: Date;
  mentions: MentionItem[];
  isLiked: boolean;
};

export type CommentPageResponse = {
  content: CommentResponse[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
};

export type LkeResponse = {
  id: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  targetId: number;
  targetType: CommentTargetType;
  createdAt: Date;
};

export type LikePageResponse = {
  content: LkeResponse[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
};
