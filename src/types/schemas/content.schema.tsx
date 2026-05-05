import z from "zod";

const CreateMentionContentSchema = z.object({
  userId: z.string().uuid(),
  username: z.string(),
});

export const UpdateContentSchema = z.object({
  caption: z.string({ message: "caption must be a string" }).optional(),
  tagsNameAdd: z
    .array(z.string({ message: "Each tag must be a string" }))
    .optional(),
  tagsIdRemove: z.array(z.number()).optional(),
  mentionAdd: z.array(CreateMentionContentSchema).optional(),
  mentionUserIdRemove: z.array(z.uuid()).optional(),
});

export type UpdateContentType = z.infer<typeof UpdateContentSchema>;
export type CreateMentionContentType = z.infer<
  typeof CreateMentionContentSchema
>;
