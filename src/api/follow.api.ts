import type { FollowCreateStatus } from "../constants/follow.enum";
import type { FollowPageResponse } from "../types/api/follow.type";
import axiosInstance from "../utils/axiosInstance";

export const handleGetFollower = async (
  userId: string,
  page: number,
  search?: string,
): Promise<FollowPageResponse> => {
  const res = await axiosInstance.get(
    `${import.meta.env.VITE_API_URL}follows/follow/followers?${search && `search=${search}`}&followerId=${userId}&page=${page}&size=20`,
  );
  return res.data;
};

export const handleGetFollowing = async (
  userId: string,
  page: number,
  search?: string,
): Promise<FollowPageResponse> => {
  const res = await axiosInstance.get<FollowPageResponse>(
    `${import.meta.env.VITE_API_URL}follows/follow/following?${search && `search=${search}`}&followerId=${userId}&page=${page}&size=20`,
  );

  return res.data;
};

export const handleFollow = async (userId: string) => {
  const res = await axiosInstance.post(
    `${import.meta.env.VITE_API_URL}follows/follow/${userId}`,
  );
  const status: FollowCreateStatus = res.data.status;
  return status;
};

export const handleUnfollow = async (userId: string) => {
  const res = await axiosInstance.delete(
    `${import.meta.env.VITE_API_URL}follows/follow/${userId}`,
  );
  const status: FollowCreateStatus = res.data.status;
  return status;
};

export const handleSearchRelationship = async (
  search: string,
): Promise<FollowPageResponse> => {
  const res = await axiosInstance.get<FollowPageResponse>(
    `${import.meta.env.VITE_API_URL}follows/follow/both?search=${search}`,
  );
  return res.data;
};

export const handleSearchMutualRelationship = async (
  search: string,
): Promise<FollowPageResponse> => {
  const res = await axiosInstance.get<FollowPageResponse>(
    `${import.meta.env.VITE_API_URL}follows/follow/mutual?search=${search}`,
  );
  return res.data;
};
