import { z } from "zod";

export const CreateStorageSchema = z.object({
  name: z.string().min(1, "Name is required!"),
  storyIds: z.array(z.number()).min(1, "Please add at least one story!"),
});

export type CreateStorageType = z.infer<typeof CreateStorageSchema>;
