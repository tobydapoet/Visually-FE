import { z } from "zod";

export const CreateConversationSchema = z.object({
  name: z.string().min(1, "Name is required!"),
  memberIds: z.array(z.uuid()).min(1, "Please add at least one user!"),
});

export type CreateConversationType = z.infer<typeof CreateConversationSchema>;

export const UpdateConversationSchema = z.object({
  name: z.string().min(1, "Name is required!"),
  file: z.instanceof(File).optional(),
});

export type UpdateConversationType = z.infer<typeof UpdateConversationSchema>;
