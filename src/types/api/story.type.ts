export class StoryResponse {
  id!: number;
  userId!: string;
  username!: string;
  avatarUrl?: string;
  mediaUrl?: string;
  musicUrl?: string;
  expiredAt!: Date;
  createdAt!: Date;
}

export class StoryResponsePage {
  page!: number;
  size!: number;
  total!: number;
  content!: StoryResponse[];
}
