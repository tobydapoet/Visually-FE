import axiosInstance from "../utils/axiosInstance";
import type {
  ShortDetailResponse,
  ShortResponsePage,
} from "../types/api/short.type";
import type { ContentStatus } from "../constants/contentStatus.enum";
import type { ContentMangePageResponse } from "../types/api/content.type";

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

export const hanleGetShortByStatus = async (
  status: ContentStatus,
  page = 1,
  size = 10,
  keyword?: string,
): Promise<ContentMangePageResponse> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}contents/short/status/${status}?page=${page}&size=${size}${
      keyword?.trim() ? `&keyword=${keyword.trim()}` : ""
    }`,
  );

  return res.data;
};

export const handleUpdateShortStatus = async (
  shortId: number,
  status: ContentStatus,
) => {
  try {
    const res = await axiosInstance.put(
      `${import.meta.env.VITE_API_URL}contents/short/${shortId}/status`,
      {
        status,
      },
    );
    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    return {
      success: false,
      data: err?.response.data,
    };
  }
};
