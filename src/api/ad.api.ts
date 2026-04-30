import type { AdStatus } from "../constants/adStatus.enum";
import type { AdResponsePage } from "../types/api/ad.type";
import type { UserPageResponse } from "../types/api/user.type";
import type { CreateAdType } from "../types/schemas/ad.schema";
import axiosInstance from "../utils/axiosInstance";

export const savePendingAd = async (data: CreateAdType) => {
  try {
    const res = await axiosInstance.post(
      `${import.meta.env.VITE_API_URL}ads/ad/pending`,
      data,
    );
    return { success: true, message: res.data.message };
  } catch (error) {
    return { success: false, message: "Something wrong! please try again" };
  }
};

export const handleUpdateAdStatus = async (id: number, status: AdStatus) => {
  try {
    const res = await axiosInstance.put(
      `${import.meta.env.VITE_API_URL}ads/ad/${id}/status?status=${status}`,
    );
    return {
      success: true,
      message: res.data.message,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || "Create failed",
    };
  }
};

export const handleGetAdUsers = async (
  page = 0,
  size = 10,
  keyword?: string,
): Promise<UserPageResponse> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}ads/ad/users?page=${page}&size=${size}${keyword ? `&username=${keyword}` : ""}`,
  );
  return res.data;
};

export const handleGetAdByUser = async (
  userId: string,
  page = 0,
  size = 10,
): Promise<AdResponsePage> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}ads/ad/user/${userId}?page=${page}&size=${size}`,
  );
  return res.data;
};
