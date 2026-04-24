export const LikeTargetType = {
  POST: "POST",
  SHORT: "SHORT",
  COMMENT: "COMMENT",
  STORY: "STORY",
} as const;
export type LikeTargetType =
  (typeof LikeTargetType)[keyof typeof LikeTargetType];

export const CommentTargetType = {
  POST: "POST",
  SHORT: "SHORT",
} as const;
export type CommentTargetType =
  (typeof CommentTargetType)[keyof typeof CommentTargetType];

export const SaveTargetType = {
  POST: "POST",
  SHORT: "SHORT",
} as const;
export type SaveTargetType =
  (typeof SaveTargetType)[keyof typeof SaveTargetType];

export const ReportTargetType = {
  POST: "POST",
  SHORT: "SHORT",
} as const;
export type ReportTargetType =
  (typeof ReportTargetType)[keyof typeof ReportTargetType];

export const RepostTargetType = {
  POST: "POST",
  SHORT: "SHORT",
} as const;
export type RepostTargetType =
  (typeof RepostTargetType)[keyof typeof RepostTargetType];
