import {
  NotificationActionType,
  type NotificationContentType,
} from "../constants/notification.enum";

const notificationMessages = {
  en: {
    [NotificationActionType.FOLLOW]: "{username} started following you.",
    [NotificationActionType.LIKE]: "{username} liked your {contentType}.",
    [NotificationActionType.COMMENT]:
      "{username} commented on your {contentType}.",
    [NotificationActionType.CREATE]: "{username} created a new {contentType}.",
  },
  vi: {
    [NotificationActionType.FOLLOW]: "{username} đã bắt đầu theo dõi bạn.",
    [NotificationActionType.LIKE]: "{username} đã thích {contentType} của bạn.",
    [NotificationActionType.COMMENT]:
      "{username} đã bình luận về {contentType} của bạn.",
    [NotificationActionType.CREATE]: "{username} đã tạo {contentType} mới.",
  },
};

export function buildNotificationContent(
  type: NotificationActionType,
  username: string,
  contentType?: NotificationContentType,
  lang = "en",
) {
  const langKey = (
    lang in notificationMessages ? lang : "en"
  ) as keyof typeof notificationMessages;
  const template = notificationMessages[langKey][type] ?? "";

  return template
    .replace("{username}", username)
    .replace("{contentType}", contentType?.toLowerCase() ?? "");
}
