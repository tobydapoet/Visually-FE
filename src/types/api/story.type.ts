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

export class StoryUserResponse {
  id!: number;
  userId!: string;
  username!: string;
  avatarUrl?: string;
  isViewed!: boolean;
}

export class StoryUserPageResponse {
  page!: number;
  size!: number;
  total!: number;
  content!: StoryUserResponse[];
}
