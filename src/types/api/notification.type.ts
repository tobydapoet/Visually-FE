import type {
  NotificationActionType,
  NotificationContentType,
} from "../../constants/notification.enum";

export type NotificationResponse = {
  id: number;

  snapshotUrl?: string;

  contentId: number;

  contentType: NotificationContentType;

  type: NotificationActionType;

  content: string;

  createdAt: Date;

  isRead: boolean;

  senderId: string;
};

export type NotificationPageResponse = {
  page: number;
  size: number;
  total: number;
  content: NotificationResponse[];
};
