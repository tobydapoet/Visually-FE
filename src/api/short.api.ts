import axios from "axios";
import axiosInstance from "../utils/axiosInstance";
import type {
  ShortDetailResponse,
  ShortResponsePage,
} from "../types/api/short.type";

export const handleCreateShort = async (formData: FormData) => {
  try {
    const res = await axiosInstance.post(
      `${import.meta.env.VITE_API_URL}contents/short`,
      formData,
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

export const handleGetShortByUser = async (
  id: string,
  page = 1,
  size = 10,
): Promise<ShortResponsePage> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}contents/short/user?userId=${id}&page=${page}&size=${size}`,
  );
  return res.data;
};

export const handleGetShort = async (
  id: number,
): Promise<ShortDetailResponse> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}contents/short/${id}`,
  );
  return res.data;
};
