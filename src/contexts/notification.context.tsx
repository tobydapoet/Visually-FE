import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import type { NotificationResponse } from "../types/api/notification.type";
import { useUser } from "./user.context";
import { createContext, useContext, useEffect, useState } from "react";
import {
  handleMarkAllRead,
  hanleGetNotifications,
} from "../api/notification.api";
import { useSocket } from "../hooks/useSocket";
import { toast } from "sonner";
import assets from "../assets";

type NotificationContextType = {
  notifications: NotificationResponse[];
  unreadCount: number;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  markAllAsRead: () => void;
  toastNotification: NotificationResponse | null;
  clearToast: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useUser();
  const queryClient = useQueryClient();
  const socket = useSocket(currentUser?.id ?? null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastNotification, setToastNotification] =
    useState<NotificationResponse | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["notifications"],
      queryFn: ({ pageParam = 1 }) => hanleGetNotifications(pageParam, 10),
      getNextPageParam: (lastPage) => {
        const totalPages = Math.ceil(lastPage.total / lastPage.size);
        return lastPage.page + 1 < totalPages ? lastPage.page + 1 : undefined;
      },
      initialPageParam: 1,
      enabled: !!currentUser,
    });

  const notifications = data?.pages.flatMap((p) => p.content) ?? [];

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.isRead).length);
  }, [data]);

  useEffect(() => {
    if (!socket) return;

    socket.on("new_notification", (newNotification: NotificationResponse) => {
      queryClient.setQueryData(["notifications"], (old: any) => {
        setToastNotification(newNotification);
        toast.custom(
          (t) => (
            <div className="flex items-center gap-3 bg-white shadow-lg rounded-xl p-4 w-80">
              <img
                src={newNotification.snapshotUrl || assets.profile}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  {newNotification.content}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Just now</p>
              </div>
              <button
                onClick={() => toast.dismiss(t)}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          ),
          { duration: 4000, position: "bottom-right" },
        );
        if (!old) return old;
        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              content: [newNotification, ...old.pages[0].content],
              total: old.pages[0].total + 1,
            },
            ...old.pages.slice(1),
          ],
        };
      });
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("new_notification");
    };
  }, [socket, queryClient]);

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    await handleMarkAllRead();
    queryClient.setQueryData(["notifications"], (old: any) => ({
      ...old,
      pages: old.pages.map((page: any) => ({
        ...page,
        content: page.content.map((n: NotificationResponse) => ({
          ...n,
          isRead: true,
        })),
      })),
    }));
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNextPage,
        hasNextPage: !!hasNextPage,
        isFetchingNextPage,
        isLoading,
        markAllAsRead,
        toastNotification,
        clearToast: () => setToastNotification(null),
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error("useNotification must be used within NotificationProvider");
  return context;
};
