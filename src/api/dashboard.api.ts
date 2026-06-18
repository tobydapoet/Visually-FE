import type {
  AdStats,
  ContentStats,
  DashboardStats,
  InteractionStats,
  Period,
  UserStats,
} from "../types/api/stats.type";
import axiosInstance from "../utils/axiosInstance";

export const handleGetDashboardStats = async (
  period: Period,
): Promise<DashboardStats> => {
  const base = import.meta.env.VITE_API_URL;

  const [content, user, interaction, ad] = await Promise.all([
    axiosInstance.get<ContentStats>(
      `${base}contents/dashboard?period=${period}`,
    ),
    axiosInstance.get<UserStats>(`${base}users/dashboard?period=${period}`),
    axiosInstance.get<InteractionStats>(
      `${base}interactions/dashboard?period=${period}`,
    ),
    axiosInstance.get<AdStats>(`${base}ads/dashboard?period=${period}`),
  ]);

  return {
    content: content.data,
    user: user.data,
    interaction: interaction.data,
    ad: ad.data,
  };
};
