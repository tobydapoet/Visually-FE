import type { UserSummaryType } from "./user.type";

export interface UserFollowType extends UserSummaryType {
  isFollowed: boolean;
}

export type FollowType = {
  followedId: string;

  user: UserFollowType;

  createdAt: Date;
};

export type FollowPageResponse = {
  content: FollowType[];

  totalPages: number;
  totalElements: number;

  size: number;
  number: number;

  first: boolean;
  last: boolean;
};
