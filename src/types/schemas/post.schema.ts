import { z } from "zod";

export const CreatePostSchema = z.object({
  caption: z.string().optional(),
  tagsName: z.array(z.string("Each tag must be a string")).optional(),
  collabUserId: z
    .array(z.string().uuid("collabUserId must be a valid UUID"))
    .optional(),
  mentions: z
    .array(
      z.object({
        userId: z.string().uuid("userId must be a valid UUID"),
        username: z.string(),
      }),
    )
    .optional(),
  files: z.array(z.instanceof(File)),
});

export type CreatePostType = z.infer<typeof CreatePostSchema>;
