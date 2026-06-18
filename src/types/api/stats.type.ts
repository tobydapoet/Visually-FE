export type Period = "day" | "week" | "month";

export interface ContentStats {
  period: string;
  post: {
    total: number;
    today: number;
    active: number;
    banned: number;
    deleted: number;
  };
  short: {
    total: number;
    today: number;
    active: number;
    banned: number;
    deleted: number;
  };
  story: { total: number; today: number; expired: number };
}

export interface UserStats {
  period: string;
  total: number;
  newUsers: number;
  active: number;
  banned: number;
  online: number;
}

export interface InteractionStats {
  period: string;
  like: { total: number; today: number };
  comment: { total: number; today: number };
  save: { total: number; today: number };
  report: { total: number; today: number };
}

export interface AdStats {
  period: string;
  total: number;
  newAds: number;
  active: number;
  inactive: number;
  disabled: number;
  totalSpent: number;
  totalBudget: number;
  totalViews: number;
}

export interface DashboardStats {
  content: ContentStats;
  user: UserStats;
  interaction: InteractionStats;
  ad: AdStats;
}
