export const FollowCreateStatus = {
  success: "SUCCESS",
  error: "ERROR",
} as const;
export type FollowCreateStatus =
  (typeof FollowCreateStatus)[keyof typeof FollowCreateStatus];
