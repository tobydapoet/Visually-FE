export const FollowRelation = {
  FOLLOWING: "FOLLOWING",
  FOLLOWER: "FOLLOWER",
} as const;
export type FollowRelation =
  (typeof FollowRelation)[keyof typeof FollowRelation];
