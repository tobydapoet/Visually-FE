export const NotificationContentType = {
  POST: "POST",
  SHORT: "SHORT",
  STORY: "STORY",
  COMMENT: "COMMENT",
} as const;
export type NotificationContentType =
  (typeof NotificationContentType)[keyof typeof NotificationContentType];

export const NotificationActionType = {
  LIKE: "LIKE",
  COMMENT: "COMMENT",
  FOLLOW: "FOLLOW",
  CREATE: "CREATE",
} as const;
export type NotificationActionType =
  (typeof NotificationActionType)[keyof typeof NotificationActionType];
