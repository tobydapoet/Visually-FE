import { z } from "zod";

export const CreateShortSchema = z.object({
  caption: z.string().optional(),
  tagsName: z.array(z.string("Each tag must be a string")).optional(),
  fileVideo: z.instanceof(File, { message: "short.video.required" }),
  fileThumbnail: z.instanceof(File, { message: "short.thumbnail.required" }),
  mentions: z
    .array(
      z.object({
        userId: z.string().uuid("short.mentions.userId.uuid"),
        username: z.string(),
      }),
    )
    .optional(),
});

export type CreateShortType = z.infer<typeof CreateShortSchema>;
