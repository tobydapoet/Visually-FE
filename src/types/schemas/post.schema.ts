import { z } from "zod";

export const CreatePostSchema = z.object({
  caption: z.string().optional(),
  tagsName: z.array(z.string("post.tagsName.string")).optional(),
  mentions: z
    .array(
      z.object({
        userId: z.string().uuid("post.mentions.userId.uuid"),
        username: z.string(),
      }),
    )
    .optional(),
  files: z.array(z.instanceof(File)),
});

export type CreatePostType = z.infer<typeof CreatePostSchema>;
