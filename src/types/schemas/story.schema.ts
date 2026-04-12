import { z } from "zod";

export const CreateStorySchema = z.object({
  musicId: z.number().optional(),
  startMusicTime: z.number().optional(),
  expiredAt: z
    .string()
    .datetime({ message: "expiredAt must be a valid date string" })
    .optional(),
  file: z.instanceof(File, { message: "File is required!" }),
});

export type CreateStoryType = z.infer<typeof CreateStorySchema>;
