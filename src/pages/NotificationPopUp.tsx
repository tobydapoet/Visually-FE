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
          navigate(
            `/content?contentId=${notification.contentId}&type=${notification.contentType}`,
          );
          break;
        case NotificationContentType.SHORT:
          navigate(
            `/content?contentId=${notification.contentId}&type=${notification.contentType}`,
          );
          break;
        case NotificationContentType.STORY:
          navigate(`/`);
          break;
        case NotificationContentType.COMMENT:
          navigate(
            `/content?contentId=${notification.contentId}&type=${notification.contentType}`,
          );
          break;
        default:
          if (notification.type === NotificationActionType.FOLLOW)
            navigate(`/${notification.content.split(" ")[0]}`);
      }
    } else if (notification.type === NotificationActionType.FOLLOW) {
      navigate(`/${notification.content.split(" ")[0]}`);
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
    if (bottom && hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Backdrop — chỉ hiện trên mobile */}
      <div className="md:hidden fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* 
        Desktop: panel trượt từ trái cạnh sidebar (left-18)
        Mobile:  bottom sheet trượt từ dưới lên, full width
      */}

      {/* Desktop panel */}
      <div className="hidden md:flex fixed inset-y-0 left-18">
        <DialogPanel
          transition
          className="
            w-120 max-w-[90vw]
            bg-zinc-900 h-full p-0
            border-r border-gray-700
            transform transition-all duration-300 ease-out
            data-closed:-translate-x-full data-closed:opacity-0
            data-open:translate-x-0
          "
        >
          <PanelContent
            unreadCount={unreadCount}
            markAllAsRead={markAllAsRead}
            onClose={onClose}
            isLoading={isLoading}
            notifications={notifications}
            isFetchingNextPage={isFetchingNextPage}
            handleNotificationClick={handleNotificationClick}
            getNotificationIcon={getNotificationIcon}
            formatTime={formatTime}
            handleScroll={handleScroll}
            scrollAreaClass="h-[calc(100vh-73px)]"
          />
        </DialogPanel>
      </div>

      <div className="md:hidden fixed inset-x-0 bottom-0">
        <DialogPanel
          transition
          className="
            w-full
            bg-zinc-900 rounded-t-2xl
            max-h-[80vh]
            flex flex-col
            transform transition-all duration-300 ease-out
            data-closed:translate-y-full data-closed:opacity-0
            data-open:translate-y-0
          "
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-600" />
          </div>

          <PanelContent
            unreadCount={unreadCount}
            markAllAsRead={markAllAsRead}
            onClose={onClose}
            isLoading={isLoading}
            notifications={notifications}
            isFetchingNextPage={isFetchingNextPage}
            handleNotificationClick={handleNotificationClick}
            getNotificationIcon={getNotificationIcon}
            formatTime={formatTime}
            handleScroll={handleScroll}
            scrollAreaClass="flex-1 overflow-y-auto"
          />
        </DialogPanel>
      </div>
    </Dialog>
  );
};

type PanelContentProps = {
  unreadCount: number;
  markAllAsRead: () => void;
  onClose: () => void;
  isLoading: boolean;
  notifications: NotificationResponse[];
  isFetchingNextPage: boolean;
  handleNotificationClick: (n: NotificationResponse) => void;
  getNotificationIcon: (n: NotificationResponse) => React.ReactNode;
  formatTime: (d: Date) => string;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  scrollAreaClass: string;
};

const PanelContent: FC<PanelContentProps> = ({
  unreadCount,
  markAllAsRead,
  onClose,
  isLoading,
  notifications,
  isFetchingNextPage,
  handleNotificationClick,
  getNotificationIcon,
  formatTime,
  handleScroll,
  scrollAreaClass,
}) => (
  <>
    <div className="sticky top-0 bg-zinc-900 border-b border-gray-700 p-3.5 z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-white" />
          <h2 className="text-white text-lg font-semibold">Notifications</h2>
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

    <div className={scrollAreaClass} onScroll={handleScroll}>
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
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{notification.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTime(notification.createdAt)}
                </p>
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
              )}
            </div>
          ))}
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  </>
);

export default NotificationPopUp;
