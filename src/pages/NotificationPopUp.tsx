import { Dialog, DialogPanel } from "@headlessui/react";
import {
  Bell,
  X,
  CheckCheck,
  Loader2,
  Heart,
  MessageCircle,
  UserPlus,
  Plus,
  Image,
  Video,
} from "lucide-react";
import type { FC } from "react";
import { useNotification } from "../contexts/notification.context";
import { useNavigate } from "react-router-dom";
import type { NotificationResponse } from "../types/api/notification.type";
import {
  NotificationActionType,
  NotificationContentType,
} from "../constants/notification.enum";

type Props = {
  open: boolean;
  onClose: () => void;
};

const NotificationPopUp: FC<Props> = ({ open, onClose }) => {
  const {
    notifications,
    unreadCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    markAllAsRead,
  } = useNotification();

  const navigate = useNavigate();

  const handleNotificationClick = (notification: NotificationResponse) => {
    onClose();

    if (notification.contentId) {
      switch (notification.contentType) {
        case NotificationContentType.POST:
          navigate(`/post/${notification.contentId}`);
          break;
        case NotificationContentType.SHORT:
          navigate(`/short/${notification.contentId}`);
          break;
        case NotificationContentType.STORY:
          navigate(`/`);
          break;
        case NotificationContentType.COMMENT:
          navigate(`/post/${notification.contentId}`);
          break;
        default:
          if (notification.type === NotificationActionType.FOLLOW) {
            navigate(`/${notification.content}`);
          }
      }
    } else if (notification.type === NotificationActionType.FOLLOW) {
      navigate(`/${notification.content}`);
    }
  };

  const getNotificationIcon = (notification: NotificationResponse) => {
    switch (notification.type) {
      case NotificationActionType.LIKE:
        return <Heart className="w-5 h-5 text-red-400" />;
      case NotificationActionType.COMMENT:
        return <MessageCircle className="w-5 h-5 text-blue-400" />;
      case NotificationActionType.FOLLOW:
        return <UserPlus className="w-5 h-5 text-green-400" />;
      case NotificationActionType.CREATE:
        switch (notification.contentType) {
          case NotificationContentType.POST:
            return <Image className="w-5 h-5 text-purple-400" />;
          case NotificationContentType.SHORT:
            return <Video className="w-5 h-5 text-purple-400" />;
          case NotificationContentType.STORY:
            return <Plus className="w-5 h-5 text-purple-400" />;
          default:
            return <Plus className="w-5 h-5 text-purple-400" />;
        }
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const bottom =
      target.scrollHeight - target.scrollTop === target.clientHeight;
    if (bottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-y-0 left-18 flex">
        <DialogPanel
          transition
          className="
            w-120 max-w-[90%]
            bg-zinc-900
            h-full
            p-0
            shadow-none
            border-r border-gray-700

            transform
            transition-all duration-300 ease-out

            data-closed:-translate-x-full
            data-closed:opacity-0
            data-open:translate-x-0
          "
        >
          <div className="sticky top-0 bg-zinc-900 border-gray-700 p-4 z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-white" />
                <h2 className="text-white text-lg font-semibold">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-gray-400 hover:text-white"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-9 h-9 flex items-center cursor-pointer justify-center rounded-full hover:bg-zinc-800 transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Notification List */}
          <div
            className="overflow-y-auto h-[calc(100vh-73px)]"
            onScroll={handleScroll}
          >
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-20">
                <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No notifications yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  When you get notifications, they'll appear here
                </p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      flex items-start gap-3 p-4 cursor-pointer transition-colors
                      hover:bg-zinc-800 border-b border-gray-800
                      ${!notification.isRead ? "bg-blue-500/5" : ""}
                    `}
                  >
                    {/* Avatar/Snapshot */}
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                      {notification.snapshotUrl ? (
                        <img
                          src={notification.snapshotUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getNotificationIcon(notification)
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">
                        {notification.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                    )}
                  </div>
                ))}

                {/* Loading more */}
                {isFetchingNextPage && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  </div>
                )}
              </>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default NotificationPopUp;
