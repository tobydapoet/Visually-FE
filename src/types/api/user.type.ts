import type { Gender } from "../../constants/gender.enum";
import type { UserRole } from "../../constants/userRole.enum";
import type { UserStatus } from "../../constants/userStatus";

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
  role: UserRole;
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
  isBlocked: boolean;
  isFollowed: boolean;
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

export type UserStatusSummaryType = UserSummaryType & {
  status: UserStatus;
};

export type UserStatusPageResponse = {
  content: UserStatusSummaryType[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};
