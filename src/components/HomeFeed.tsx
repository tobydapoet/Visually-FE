import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useCallback, useState } from "react";

import { handleGetFeed } from "../api/feed.api";
import { FeedEnum } from "../constants/feed.enum";
import SkeletonCard from "./SkeletionCard";
import PostCard from "./PostCard";
import type { FeedContentResponse } from "../types/api/feed.type";

const HomeFeed = () => {
  const [allFeeds, setAllFeeds] = useState<FeedContentResponse[]>([]);
  const [feedType, setFeedType] = useState<FeedEnum>(FeedEnum.HOME);
  const isFetchingRef = useRef(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<number>(0);

  const homeQuery = useInfiniteQuery({
    queryKey: ["feed", FeedEnum.HOME],
    queryFn: ({ pageParam }) =>
      handleGetFeed(FeedEnum.HOME, pageParam as string | undefined),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const reelQuery = useInfiniteQuery({
    queryKey: ["feed", FeedEnum.REEL],
    queryFn: ({ pageParam }) =>
      handleGetFeed(FeedEnum.REEL, pageParam as string | undefined),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: feedType === FeedEnum.REEL,
  });

  const activeQuery = feedType === FeedEnum.HOME ? homeQuery : reelQuery;
  const { fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    activeQuery;

  useEffect(() => {
    const newFeeds = activeQuery.data?.pages.flatMap((p) => p.content) ?? [];
    if (newFeeds.length === 0) return;
    setAllFeeds((prev) => {
      const existingIds = new Set(prev.map((f) => f.id));
      const fresh = newFeeds.filter((f) => !existingIds.has(f.id));
      return [...prev, ...fresh];
    });
  }, [activeQuery.data]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        if (hasNextPage && !isFetchingRef.current) {
          isFetchingRef.current = true;
          fetchNextPage().finally(() => {
            isFetchingRef.current = false;
          });
        } else if (!hasNextPage && feedType === FeedEnum.HOME) {
          // Lưu scroll height hiện tại trước khi fetch reel
          scrollAnchorRef.current = document.documentElement.scrollHeight;
          setFeedType(FeedEnum.REEL);
        }
      }
    },
    [fetchNextPage, hasNextPage, feedType],
  );

  useEffect(() => {
    const newFeeds = activeQuery.data?.pages.flatMap((p) => p.content) ?? [];
    if (newFeeds.length === 0) return;

    setAllFeeds((prev) => {
      const existingIds = new Set(prev.map((f) => f.id));
      const fresh = newFeeds.filter((f) => !existingIds.has(f.id));
      if (fresh.length === 0) return prev;

      // Restore scroll sau khi DOM update
      if (feedType === FeedEnum.REEL && scrollAnchorRef.current > 0) {
        requestAnimationFrame(() => {
          window.scrollTo({
            top: scrollAnchorRef.current,
            behavior: "instant",
          });
          scrollAnchorRef.current = 0;
        });
      }

      return [...prev, ...fresh];
    });
  }, [activeQuery.data]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.5,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <>
      <div className="min-h-screen">
        <div className="max-w-120 mx-auto px-3 pt-4 pb-10">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : allFeeds.length === 0 ? (
            <div className="text-center py-20 text-neutral-600 text-sm">
              No posts yet.
            </div>
          ) : (
            allFeeds.map((post, i) => (
              <PostCard key={`${post.id}-${i}`} post={post} />
            ))
          )}

          <div
            ref={loaderRef}
            className="py-4 flex justify-center"
            style={{ overflowAnchor: "none" }}
          >
            {isFetchingNextPage && (
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-neutral-600 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeFeed;
