export const ContentStatus = {
  ACTIVE: "ACTIVE",
  DELETED: "DELETED",
  BANNED: "BANNED",
} as const;
export type ContentStatus = (typeof ContentStatus)[keyof typeof ContentStatus];
