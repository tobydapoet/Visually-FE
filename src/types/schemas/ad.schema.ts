import z from "zod";
import { GenderSelect } from "../../constants/gender.enum";
import { ContentType } from "../../constants/contentType.enum";

export const CreateAdSchema = z
  .object({
    dailyBudget: z
      .number()
      .min(1000, "daily_budget.min")
      .max(1000000, "daily_budget.max"),

    duration: z.number().min(1, "duration.min").max(720, "duration.max"),

    ageMin: z.number().min(1, "age_min.min"),
    ageMax: z.number().max(100, "age_max.max"),

    gender: z.enum(GenderSelect, "gender.invalid"),
    contentType: z.enum(ContentType, "content_type.invalid"),
    contentId: z.number(),
  })
  .refine((data) => data.ageMin <= data.ageMax, {
    message: "age_min.greater_than_max",
    path: ["ageMin"],
  });

export type CreateAdType = z.infer<typeof CreateAdSchema>;
