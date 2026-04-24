export const AdStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  DISABLED: "DISABLED",
} as const;
export type AdStatus = (typeof AdStatus)[keyof typeof AdStatus];
