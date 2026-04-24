import type { ContentSearchResponse } from "../types/api/content.type";
import type { TagPageResponse } from "../types/api/tag.type";
import axiosInstance from "../utils/axiosInstance";

export const handleContentSearch = async (
  page = 1,
  size = 10,
  caption?: string,
  tag?: string,
): Promise<ContentSearchResponse[]> => {
  const params = new URLSearchParams();

  if (caption?.trim()) {
    params.append("caption", caption.trim());
  }

  if (tag?.trim()) {
    params.append("tag", tag.trim());
  }

  params.append("page", String(page));
  params.append("size", String(size));

  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}contents/content/search?${params.toString()}`,
  );

  return res.data;
};

export const handleTagSearch = async (
  page = 1,
  size = 10,
  keyword: string,
): Promise<TagPageResponse> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}contents/tag?keyword=${keyword}&page=${page}&size=${size}`,
  );
  return res.data;
};
