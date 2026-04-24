export const ContentType = {
  POST: "POST",
  SHORT: "SHORT",
} as const;
export type ContentType = (typeof ContentType)[keyof typeof ContentType];
