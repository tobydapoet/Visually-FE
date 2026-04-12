export const MusicStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  DELETED: "DELETED",
  SUSPENDED: "SUSPENDED",
} as const;
export type MusicStatus = (typeof MusicStatus)[keyof typeof MusicStatus];
