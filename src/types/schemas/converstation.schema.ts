import { z } from "zod";

export const CreateConversationSchema = z.object({
  name: z.string().min(1, "conversation.name.required"),
  memberIds: z.array(z.uuid()).min(1, "conversation.memberIds.required"),
});

export type CreateConversationType = z.infer<typeof CreateConversationSchema>;

export const UpdateConversationSchema = z.object({
  name: z.string().min(1, "conversation.name.required").optional(),
  file: z.instanceof(File).optional(),
});

export type UpdateConversationType = z.infer<typeof UpdateConversationSchema>;
