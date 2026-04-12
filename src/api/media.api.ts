import type { MusicStatus } from "../constants/music.enum";
import type { MusicPageResponse, MusicResponse } from "../types/api/music.type";
import type {
  MusicCreateSchemaType,
  MusicUpdateSchemaType,
} from "../types/schemas/music.schema";
import axiosInstance from "../utils/axiosInstance";

export const handleGetListMusic = async (
  page: number,
  size: number = 20,
  status: MusicStatus = "ACTIVE",
  search?: string,
): Promise<MusicPageResponse> => {
  const params = new URLSearchParams({
    status,
    page: page.toString(),
    size: size.toString(),
  });

  if (search && search.trim()) {
    params.append("keyword", search.trim());
  }

  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}medias/music_library?${params.toString()}`,
  );

  return res.data;
};

export const handleGetMusic = async (id: number): Promise<MusicResponse> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}medias/music_library/${id}`,
  );
  return res.data;
};

export const handleCreateMusic = async (data: MusicCreateSchemaType) => {
  try {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("artist", data.artist);
    formData.append("url", data.url);
    formData.append("img", data.img);

    const res = await axiosInstance.post(
      `${import.meta.env.VITE_API_URL}medias/music_library`,
      formData,
    );
    return { success: true, message: res.data.message };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || "Create failed",
    };
  }
};

export const handleUpdateMusic = async (
  id: number,
  data: MusicUpdateSchemaType,
) => {
  try {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.artist) formData.append("artist", data.artist);
    if (data.url) formData.append("url", data.url);
    if (data.img) formData.append("img", data.img);

    const res = await axiosInstance.put(
      `${import.meta.env.VITE_API_URL}medias/music_library/${id}`,
      formData,
    );
    return { success: true, message: res.data.message };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || "Update failed",
    };
  }
};

export const handleUpdateStatusMusic = async (
  id: number,
  status: MusicStatus,
) => {
  try {
    const res = await axiosInstance.put(
      `${import.meta.env.VITE_API_URL}medias/music_library/${id}/status?status=${status}`,
    );
    return { success: true, message: res.data.message };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || "Update failed",
    };
  }
};
