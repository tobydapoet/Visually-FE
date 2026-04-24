import type { ContentType } from "../constants/contentType.enum";
import type { FeedEnum } from "../constants/feed.enum";
import type { FeedContentPageResponse } from "../types/api/feed.type";
import axiosInstance from "../utils/axiosInstance";

export const handleGetFeed = async (
  type: FeedEnum,
  cursor?: string,
): Promise<FeedContentPageResponse> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}contents/content/${type.toLowerCase()}/feed${cursor ? `?cursor=${cursor}` : ""}`,
  );

  return res.data;
};

export const handlemarkSeenHomeFeed = async (contentIds: number[]) => {
  await axiosInstance.put(
    `${import.meta.env.VITE_API_URL}feeds/feed/home/seen`,
    { contentIds },
  );
};

export const handlemarkSeenReelFeed = async (contentIds: number[]) => {
  await axiosInstance.put(
    `${import.meta.env.VITE_API_URL}feeds/feed/reels/seen`,
    { contentIds },
  );
};

export const handleMarkCurrentReelFeed = async (
  contentId: number,
  contentType: ContentType,
) => {
  await axiosInstance.post(
    `${import.meta.env.VITE_API_URL}feeds/feed/reel-current?contentId=${contentId}&contentType=${contentType}`,
  );
};
