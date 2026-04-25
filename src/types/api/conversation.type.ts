import type { ConversationEnum } from "../../constants/conversation.enum";

export type UserConverstation = {
  userId: string;
  avatarUrl?: string | null;
  username: string;
  lastSeen: Date;
};

export interface ConversationType {
  id: number;
  name?: string | null;
  mediaUrl?: string;
  type: ConversationEnum;
  lastMessage?: string | null;
  otherUsers: UserConverstation[];
  isRead: boolean;
  isBlocked: boolean;
}
