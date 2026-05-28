import { z } from "zod";

export const MusicCreateSchema = z.object({
  title: z.string().min(1, "music.title.required"),
  artist: z.string().min(1, "music.artist.required"),
  url: z
    .instanceof(File, { message: "music.url.required" })
    .refine((file) => file.size > 0, "music.url.required"),
  img: z
    .instanceof(File, { message: "music.img.required" })
    .refine((file) => file.size > 0, "music.img.required"),
});

export const MusicUpdateSchema = z.object({
  title: z.string().min(1, "music.title.required").optional(),
  artist: z.string().min(1, "music.artist.required").optional(),
  url: z
    .instanceof(File, { message: "music.url.required" })
    .refine((file) => file.size > 0, "music.url.required")
    .optional(),

  img: z
    .instanceof(File, { message: "music.img.required" })
    .refine((file) => file.size > 0, "music.img.required")
    .optional(),
});

export type MusicCreateSchemaType = z.infer<typeof MusicCreateSchema>;
export type MusicUpdateSchemaType = z.infer<typeof MusicUpdateSchema>;
