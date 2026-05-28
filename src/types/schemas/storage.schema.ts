import { z } from "zod";

export const CreateStorageSchema = z.object({
  name: z.string().min(1, "storage.name.required"),
  storyIds: z.array(z.number()).min(1, "storage.storyIds.required"),
});

export type CreateStorageType = z.infer<typeof CreateStorageSchema>;
