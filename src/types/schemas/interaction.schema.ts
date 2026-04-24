import { z } from "zod";
import {
  CommentTargetType,
  LikeTargetType,
  ReportTargetType,
  SaveTargetType,
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

export const SaveReqSchema = z.object({
  targetId: z.number(),
  targetType: z.enum(SaveTargetType),
});

export type SaveReqType = z.infer<typeof SaveReqSchema>;

export const ReportReqSchema = z.object({
  targetId: z.number(),
  targetType: z.enum(ReportTargetType),
  reason: z.enum(ReportReason),
});

export type ReportReqType = z.infer<typeof ReportReqSchema>;
