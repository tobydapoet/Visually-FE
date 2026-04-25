import { z } from "zod";

export const CreateShortSchema = z.object({
  caption: z.string().optional(),
  tagsName: z.array(z.string("Each tag must be a string")).optional(),
  fileVideo: z.instanceof(File, { message: "Video is required!" }),
  fileThumbnail: z.instanceof(File, { message: "Thumbnail is required!" }),
  mentions: z
    .array(
      z.object({
        userId: z.string().uuid("userId must be a valid UUID"),
        username: z.string(),
      }),
    )
    .optional(),
});

export type CreateShortType = z.infer<typeof CreateShortSchema>;
