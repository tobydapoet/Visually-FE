import { z } from "zod";
import { Gender } from "../../constants/gender.enum";

export const RegisterSchema = z
  .object({
    fullName: z.string().nonempty("Please enter your full name!"),
    username: z.string().nonempty("Please enter your username!"),
    email: z.email("Please enter a valid email address!"),
    phone: z.string().min(10, "Phone number must be at least 10 digits!"),
    password: z.string().min(8, "Password must be at least 8 characters!"),
    dob: z.coerce.date({
      message: "Please select your date of birth!",
    }),
    gender: z.enum(Gender, {
      message: "Please select your gender!",
    }),
    confirmPassword: z.string(),
  })

  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match!",
    path: ["confirmPassword"],
  });

export type RegisterType = z.infer<typeof RegisterSchema>;
