import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email("email.invalid"),
  password: z.string().nonempty("password.required"),
  remember: z.boolean().default(false),
});

export type LoginType = z.infer<typeof LoginSchema>;
