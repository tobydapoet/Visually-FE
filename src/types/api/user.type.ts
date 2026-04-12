import type { Gender } from "../../constants/gender.enum";

export type CurrentUserType = {
  id: string;
  email: string;
  username: string;
  gender: Gender;
  fullName: string;
  avatar: string;
  dob: Date;
  phone: string;
  bio: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserType = {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatar: string;
  dob: Date;
  phone: string;
  bio: string;
  createdAt: Date;
  updatedAt: Date;
  followersCount: number;
  followingCount: number;
  postCount: number;
  shortCount: number;
};

export interface UserSummaryType {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
}

export interface UserPageResponse {
  content: UserSummaryType[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
