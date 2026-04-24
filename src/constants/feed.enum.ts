export const FeedEnum = {
  HOME: "HOME",
  REEL: "REEL",
} as const;
export type FeedEnum = (typeof FeedEnum)[keyof typeof FeedEnum];
