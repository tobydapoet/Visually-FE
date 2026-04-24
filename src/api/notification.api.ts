import type { NotificationPageResponse } from "../types/api/notification.type";
import axiosInstance from "../utils/axiosInstance";

export const hanleGetNotifications = async (
  page = 0,
  size = 10,
): Promise<NotificationPageResponse> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}notifications/notification?page=${page}&size=${size}`,
  );
  return res.data;
};

export const handleMarkAllRead = async () => {
  await axiosInstance.post(
    `${import.meta.env.VITE_API_URL}notifications/notification/read-all`,
  );
};
