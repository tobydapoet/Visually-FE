export type Message = {
  id: number;
  content: string;
  files: File[];
  filePreviews: string[];
  createdAt: Date;
  isOwn: boolean;
  senderUsername?: string;
  senderAvatar?: string;
  replyTo: {
    id: number;
    username?: string;
    content?: string;
    avatarUrl?: string | null;
    isDeleted?: boolean;
  } | null;
  mentions: {
    userId: string;
    username: string;
  }[];
};

export type MemberType = {
  id: number;
  userId: string;
  username: string;
  avatarUrl?: string;
};
