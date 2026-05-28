import { z } from "zod";

export const ResetPasswordSchema = z
  .object({
    resetToken: z.string(),
    password: z.string().min(8, "auth.password.min"),
    confirmPassword: z.string(),
  })

  .refine((data) => data.password === data.confirmPassword, {
    message: "auth.password.not_match",
    path: ["confirmPassword"],
  });

export type ResetPasswordType = z.infer<typeof ResetPasswordSchema>;

export const ResendOtpSchema = z.object({
  email: z.email("auth.email.invalid"),
});

export type ResendOtpType = z.infer<typeof ResendOtpSchema>;

export const OtpSchema = z.object({
  otp: z
    .string()
    .length(6, "auth.otp.length")
    .regex(/^\d+$/, "auth.otp.numeric"),
});
export type OtpFormType = z.infer<typeof OtpSchema>;
