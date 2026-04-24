import z from "zod";
import { GenderSelect } from "../../constants/gender.enum";
import { ContentType } from "../../constants/contentType.enum";

export const CreateAdSchema = z
  .object({
    dailyBudget: z
      .number()
      .min(1000, "Daily budget must be at least 1,000")
      .max(1000000, "Daily budget cannot exceed 1,000,000"),

    time: z
      .number()
      .min(1, "Time duration must be at least 1 hour")
      .max(720, "Time duration cannot exceed 720 hours"),

    ageMin: z.number().min(1, "Minimum age must be at least 1"),

    ageMax: z.number().max(100, "Maximum age cannot exceed 100"),

    gender: z.enum(GenderSelect, "Please select a valid gender option"),

    type: z.enum(ContentType, "Please select a valid content type"),

    contentId: z.number(),
  })
  .refine((data) => data.ageMin <= data.ageMax, {
    message: "Minimum age cannot be greater than maximum age",
    path: ["ageMin"],
  });

export type CreateAdType = z.infer<typeof CreateAdSchema>;
