export const UserRole = {
  ADMIN: "ADMIN",
  CLIENT: "CLIENT",
  MODERATOR: "MODERATOR",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
