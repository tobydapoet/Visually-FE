import { z } from "zod";
import { Gender } from "../../constants/gender.enum";

export const UserUpdateSchema = z.object({
  fullName: z.string().nonempty("Please enter your full name!"),
  username: z.string().nonempty("Please enter your username!"),
  dob: z.string({
    message: "Please select your date of birth!",
  }),
  bio: z.string(),
  gender: z.enum(Gender, {
    message: "Please select your gender!",
  }),
  file: z.file().optional(),
});

export type UserUpdateType = z.infer<typeof UserUpdateSchema>;
