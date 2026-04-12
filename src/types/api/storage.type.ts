export class StoryStorageResponse {
  id!: number;
  url!: string;
  name!: string;
}

export class StoryResponse {
  id!: number;
  userId!: string;
  username!: string;
  avatarUrl?: string;
  mediaUrl?: string;
  musicUrl?: string;
  expiredAt!: Date;
  createdAt!: Date;
  startMusicTime?: number;
  storageId?: number;
  likeCount!: number;
  isLiked!: boolean;
}

export class StoryPageResponse {
  content!: StoryResponse[];
  page!: number;
  total!: number;
}
