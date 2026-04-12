import { z } from "zod";

export const MusicCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  url: z
    .instanceof(File, { message: "Url file is required" })
    .refine((file) => file.size > 0, "Url file is required"),
  img: z
    .instanceof(File, { message: "Image is required" })
    .refine((file) => file.size > 0, "Image is required"),
});

export const MusicUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  artist: z.string().min(1, "Artist is required").optional(),
  url: z
    .instanceof(File, { message: "Url file is required" })
    .refine((file) => file.size > 0, "Url file is required")
    .optional(),
  img: z
    .instanceof(File, { message: "Image is required" })
    .refine((file) => file.size > 0, "Image is required")
    .optional(),
});

export type MusicCreateSchemaType = z.infer<typeof MusicCreateSchema>;
export type MusicUpdateSchemaType = z.infer<typeof MusicUpdateSchema>;
