import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { UserSummaryLastSeenType } from "../types/api/user.type";
import assets from "../assets";
import { handleGetFollowingWithStatus } from "../api/follow.api";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/user.context";

const getOnlineStatus = (lastSeen: Date | null) => {
  if (lastSeen === null) return { label: "Online", color: "bg-emerald-500" };

  const diff = Date.now() - new Date(lastSeen).getTime();
  const minutes = Math.floor(diff / 1000 / 60);

  if (minutes < 60) return { label: `${minutes}m`, color: "bg-yellow-500" };

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { label: `${hours}h`, color: "bg-neutral-500" };

  return { label: null, color: "bg-neutral-600" };
};

const UserFollowSideBar: React.FC = () => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const { currentUser, loading } = useUser();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["following-status"],
      queryFn: ({ pageParam = 0 }) => handleGetFollowingWithStatus(pageParam),
      getNextPageParam: (lastPage) =>
        lastPage.last ? undefined : lastPage.number + 1,
      initialPageParam: 0,
    });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const users: UserSummaryLastSeenType[] =
    data?.pages.flatMap((page) => page.content) || [];

  if (loading || !currentUser) return null;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed right-0 hidden lg:flex overflow-x-hidden top-0 h-screen bg-zinc-900 border-l border-zinc-800 flex-col py-4 gap-1 overflow-y-auto scrollbar-none z-40 transition-all duration-300 ${
        isHovered ? "w-64 px-2" : "w-16 px-1"
      }`}
    >
      {isLoading ? (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center gap-2 py-2"
            >
              <div className="w-9 h-9 rounded-full bg-zinc-800 animate-pulse shrink-0" />
              {isHovered && (
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 bg-zinc-800 animate-pulse rounded w-3/4" />
                  <div className="h-2 bg-zinc-800 animate-pulse rounded w-1/2" />
                </div>
              )}
            </div>
          ))}
        </>
      ) : (
        <>
          {users.map((user) => {
            const status = getOnlineStatus(user.lastSeen);

            return (
              <div
                key={user.id}
                onClick={() => navigate(`/${user.username}`)}
                className="flex items-center gap-2.5 px-1 py-2 hover:bg-zinc-800/60 rounded-lg cursor-pointer transition-colors"
              >
                <div className="relative shrink-0">
                  <img
                    src={user.avatar || assets.profile}
                    alt={user.username}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zinc-900 ${status.color}`}
                  />
                </div>

                {isHovered && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-200 font-medium truncate leading-tight">
                      {user.fullName || user.username}
                    </p>
                    <p
                      className={`text-[10px] mt-0.5 ${
                        user.lastSeen === null
                          ? "text-emerald-400"
                          : "text-neutral-500"
                      }`}
                    >
                      {user.lastSeen === null
                        ? "Online"
                        : status.label === null
                          ? "Offline"
                          : `${status.label} ago`}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          <div ref={loadMoreRef} className="w-full h-4 shrink-0" />

          {isFetchingNextPage && (
            <div className="flex items-center gap-2 px-1 py-2">
              <div className="w-9 h-9 rounded-full bg-zinc-800 animate-pulse shrink-0" />
              {isHovered && (
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 bg-zinc-800 animate-pulse rounded w-3/4" />
                  <div className="h-2 bg-zinc-800 animate-pulse rounded w-1/2" />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserFollowSideBar;
