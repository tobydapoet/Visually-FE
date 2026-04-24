import type { AdStatus } from "../../constants/adStatus.enum";
import type { ContentType } from "../../constants/contentType.enum";
import type { GenderSelect } from "../../constants/gender.enum";

export type AdResponse = {
  id: number;
  type: ContentType;
  ageMin: number;
  ageMax: number;
  gender: GenderSelect;
  dailyBudget: number;
  spentAmount: number;
  startDate: Date;
  endDate: Date;
  views: number;
  clicks: number;
  status: AdStatus;
  pausedAt: Date;
  content: {
    id: number;
    caption: string;
    userId: string;
    username: string;
    avatarUrl?: string;
    likeCount: number;
    commentCount: number;
    saveCount: number;
    repostCount: number;
    thumbnailUrl: string;
    mentions: [
      {
        userId: string;
        username: string;
      },
    ];
  };
};
export type AdResponsePage = {
  page: number;
  number: number;
  totalPages: number;
  content: AdResponse[];
};
