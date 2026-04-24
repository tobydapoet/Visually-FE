import type { ContentType } from "../../constants/contentType.enum";
import type { CommentTargetType } from "../../constants/interaction.enum";
import type { ReportReason } from "../../constants/reportReason.enum";
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

export type ReportResponse = {
  id: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  reason: ReportReason;
  createdAt: Date;
};

export type ReportPageResponse = {
  content: ReportResponse[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
};

export type ReportListResponse = {
  id: number;
  userId: string;
  username: string;
  avatarUrl: string;
  targetId: number;
  targetType: ContentType;
  reason: ReportReason;
  createdAt: Date;
};

export type ReportListPageResponse = {
  content: ReportListResponse[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
};
