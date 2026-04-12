import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email("Please enter a valid email address!"),
  password: z.string().nonempty("Please enter a valid password!"),
  remember: z.boolean().default(false),
});

export type LoginType = z.infer<typeof LoginSchema>;
