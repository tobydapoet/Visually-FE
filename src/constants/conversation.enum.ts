export const ConversationEnum = {
  GROUP: "GROUP",
  PRIVATE: "PRIVATE",
} as const;
export type ConversationEnum =
  (typeof ConversationEnum)[keyof typeof ConversationEnum];
