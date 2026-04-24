import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import type { NotificationResponse } from "../types/api/notification.type";
import { useUser } from "./user.context";
import { createContext, useContext, useEffect, useState } from "react";
import {
  handleMarkAllRead,
  hanleGetNotifications,
} from "../api/notification.api";
import { useSocket } from "../hooks/useSocket";

type NotificationContextType = {
  notifications: NotificationResponse[];
  unreadCount: number;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  markAllAsRead: () => void;
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
