import { z } from "zod";

export const ResetPasswordSchema = z
  .object({
    resetToken: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters!"),
    confirmPassword: z.string(),
  })

  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match!",
    path: ["confirmPassword"],
  });

export type ResetPasswordType = z.infer<typeof ResetPasswordSchema>;

export const ResendOtpSchema = z.object({
  email: z.email("Please enter a valid email address!"),
});

export type ResendOtpType = z.infer<typeof ResendOtpSchema>;

export const OtpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});
export type OtpFormType = z.infer<typeof OtpSchema>;
