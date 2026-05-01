export const ConversationEnum = {
  GROUP: "GROUP",
  PRIVATE: "PRIVATE",
  BOT: "BOT",
} as const;
export type ConversationEnum =
  (typeof ConversationEnum)[keyof typeof ConversationEnum];
