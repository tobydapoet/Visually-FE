import axiosInstance from "../utils/axiosInstance";
import type {
  PostDetailResponse,
  PostResponsePage,
} from "../types/api/post.type";

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
