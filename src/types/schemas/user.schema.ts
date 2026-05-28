import { z } from "zod";
import { Gender } from "../../constants/gender.enum";

export const UserUpdateSchema = z.object({
  fullName: z.string().nonempty("user.fullName.required"),
  username: z.string().nonempty("user.username.required"),
  dob: z.string({
    message: "user.dob.required",
  }),
  bio: z.string(),
  gender: z.enum(Gender, {
    message: "user.gender.required",
  }),
  file: z.file().optional(),
});

export type UserUpdateType = z.infer<typeof UserUpdateSchema>;
