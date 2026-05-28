import { z } from "zod";
import { Gender } from "../../constants/gender.enum";

export const RegisterSchema = z
  .object({
    fullName: z.string().nonempty("full_name.required"),
    username: z.string().nonempty("username.required"),
    email: z.email("email.invalid"),
    phone: z.string().min(10, "phone.min_length"),
    password: z.string().min(8, "password.min_length"),
    dob: z.coerce.date({ message: "dob.required" }),
    gender: z.enum(Gender, { message: "gender.required" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "password.not_match",
    path: ["confirmPassword"],
  });

export type RegisterType = z.infer<typeof RegisterSchema>;
