import axios from "axios";
import type {
  StoryPageResponse,
  StoryResponse,
  StoryStorageResponse,
} from "../types/api/storage.type";
import type { StoryResponsePage } from "../types/api/story.type";
import type { CreateStorageType } from "../types/schemas/storage.schema";
import axiosInstance from "../utils/axiosInstance";

export const handleCreateStory = async (formData: FormData) => {
  try {
    const res = await axiosInstance.post(
      `${import.meta.env.VITE_API_URL}contents/story`,
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

export const handleGetStoryByUser = async (
  id: string,
  page = 1,
  size = 10,
  filterStorage?: boolean,
): Promise<StoryResponsePage> => {
  const url =
    `${import.meta.env.VITE_API_URL}contents/story/user` +
    `?userId=${id}&page=${page}&size=${size}` +
    (filterStorage ? `&filterStorage=true` : "");

  const res = await axiosInstance.get(url);
  return res.data;
};

export const handleCreateStorage = async (data: CreateStorageType) => {
  try {
    const res = await axiosInstance.post(
      `${import.meta.env.VITE_API_URL}contents/story-storage`,
      data,
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

export const handleGetStorageByUser = async (
  userId: string,
): Promise<StoryStorageResponse[]> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}contents/story-storage/user/${userId}`,
  );
  return res.data;
};

export const handleGetStoryInStorage = async (
  storageId: number,
  page = 1,
): Promise<StoryPageResponse> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}contents/story/storage/${storageId}?page=${page}`,
  );
  console.log("RES: ", res.data);
  return res.data;
};

export const handleGetStory = async (id: number): Promise<StoryResponse> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}contents/story/${id}`,
  );
  console.log("RES: ", res.data);
  return res.data;
};

export const handleAddToStorage = async (
  storyId: number,
  storageId: number,
) => {
  try {
    const res = await axiosInstance.put(
      `${import.meta.env.VITE_API_URL}contents/story/storage/add?storageId=${storageId}&storyId=${storyId}`,
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

export const handleRemoveFromStorage = async (
  storyId: number,
  storageId: number,
) => {
  try {
    const res = await axiosInstance.put(
      `${import.meta.env.VITE_API_URL}contents/story/storage/remove?storageId=${storageId}&storyId=${storyId}`,
    );
    return {
      success: true,
      message: res.data.message,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || "Remove failed",
    };
  }
};
