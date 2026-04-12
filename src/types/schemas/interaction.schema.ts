import { z } from "zod";
import {
  CommentTargetType,
  LikeTargetType,
  ReportTargetType,
  ShareTargetType,
} from "../../constants/interaction.enum";
import { ReportReason } from "../../constants/reportReason.enum";

export const LikeReqSchema = z.object({
  targetId: z.number(),
  targetType: z.enum(LikeTargetType),
});

export type LikeReqType = z.infer<typeof LikeReqSchema>;

export const CommentReqSchema = z.object({
  targetId: z.number(),
  targetType: z.enum(CommentTargetType),
  content: z.string().nonempty(),
  mentions: z
    .array(
      z.object({
        userId: z.string().uuid("userId must be a valid UUID"),
        username: z.string(),
      }),
    )
    .optional(),

  replyToId: z.number().optional(),
});

export type CommentReqType = z.infer<typeof CommentReqSchema>;

export const ShareReqSchema = z.object({
  targetId: z.number(),
  targetType: z.enum(ShareTargetType),
  isPublic: z.boolean(),
});

export type ShareReqType = z.infer<typeof ShareReqSchema>;

export const ReportReqSchema = z.object({
  targetId: z.number(),
  targetType: z.enum(ReportTargetType),
  reason: z.enum(ReportReason),
});

export type ReportReqType = z.infer<typeof ReportReqSchema>;
