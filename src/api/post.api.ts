import axiosInstance from "../utils/axiosInstance";
import type {
  PostDetailResponse,
  PostResponsePage,
} from "../types/api/post.type";
import type { RepostTargetType } from "../constants/interaction.enum";
import type {
  ContentDefaultPageResponse,
  ContentMangePageResponse,
} from "../types/api/content.type";
import type { ContentStatus } from "../constants/contentStatus.enum";

export const handleCreatePost = async (formData: FormData) => {
  try {
    const res = await axiosInstance.post(
      `${import.meta.env.VITE_API_URL}contents/post`,
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

export const handleGetPostByUser = async (
  id: string,
  page = 1,
  size = 10,
): Promise<PostResponsePage> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}contents/post/user?userId=${id}&page=${page}&size=${size}`,
  );
  return res.data;
};

export const handleGetPost = async (
  id: number,
): Promise<PostDetailResponse> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}contents/post/${id}`,
  );
  return res.data;
};

export const handleRepost = async (
  originalId: number,
  originalType: RepostTargetType,
) => {
  try {
    await axiosInstance.post(`${import.meta.env.VITE_API_URL}contents/repost`, {
      originalId,
      originalType,
    });
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message,
    };
  }
};

export const handleDeleteRepost = async (
  originalId: number,
  originalType: RepostTargetType,
) => {
  try {
    await axiosInstance.delete(
      `${import.meta.env.VITE_API_URL}contents/repost?originalId=${originalId}&originalType=${originalType}`,
    );
  } catch (err: any) {
    console.log("ERR: ", err.response?.data?.message);
    return {
      success: false,
      message: err.response?.data?.message,
    };
  }
};

export const handleGetRepostByUser = async (
  id: string,
  page = 1,
  size = 10,
): Promise<ContentDefaultPageResponse> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}contents/repost/user/${id}?page=${page}&size=${size}`,
  );
  return res.data;
};

export const hanleGetPostByStatus = async (
  status: ContentStatus,
  page = 0,
  size = 10,
  keyword?: string,
): Promise<ContentMangePageResponse> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}contents/post/status/${status}?page=${page}&size=${size}&keyword=${keyword}`,
  );
  return res.data;
};

export const handleUpdatePostStatus = async (
  postId: number,
  status: ContentStatus,
) => {
  try {
    const res = await axiosInstance.put(
      `${import.meta.env.VITE_API_URL}contents/post/${postId}/status`,
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
