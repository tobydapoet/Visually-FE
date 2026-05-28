import { z } from "zod";

export const CreateStorySchema = z.object({
  musicId: z.number().optional(),
  startMusicTime: z.number().optional(),
  expiredAt: z
    .string()
    .datetime({ message: "story.expiredAt.datetime" })
    .optional(),
  file: z.instanceof(File, { message: "story.file.required" }),
});

export type CreateStoryType = z.infer<typeof CreateStorySchema>;
