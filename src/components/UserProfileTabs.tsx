import { useRef, useEffect } from "react";
import { Video, Bookmark, Repeat2, Camera } from "lucide-react";
import { UserComponent } from "./UserComponent";
import LoadingSpinner from "./LoadingSpinner";
import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import type { TabUserType } from "../constants/userPage.type";

type Props = {
  activeTab: TabUserType;
  setActiveTab: (tab: TabUserType) => void;
  visibleTabs: { id: TabUserType; label: string; icon: any }[];
  posts: any[];
  shorts: any[];
  reposted: any[];
  postsQuery: UseInfiniteQueryResult<any>;
  shortsQuery: UseInfiniteQueryResult<any>;
  repostedQuery: UseInfiniteQueryResult<any>;
  isOwner: boolean;
};

export const UserProfileTabs: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  visibleTabs,
  posts,
  shorts,
  reposted,
  postsQuery,
  shortsQuery,
  repostedQuery,
  isOwner,
}) => {
  const postsEndRef = useRef<HTMLDivElement>(null);
  const shortsEndRef = useRef<HTMLDivElement>(null);
  const repostedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!postsEndRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          postsQuery.hasNextPage &&
          !postsQuery.isFetchingNextPage
        ) {
          postsQuery.fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(postsEndRef.current);
    return () => observer.disconnect();
  }, [postsQuery.hasNextPage, postsQuery.isFetchingNextPage, activeTab]);

  useEffect(() => {
    if (!shortsEndRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          shortsQuery.hasNextPage &&
          !shortsQuery.isFetchingNextPage
        ) {
          shortsQuery.fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(shortsEndRef.current);
    return () => observer.disconnect();
  }, [shortsQuery.hasNextPage, shortsQuery.isFetchingNextPage, activeTab]);

  useEffect(() => {
    if (!repostedEndRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          repostedQuery.hasNextPage &&
          !repostedQuery.isFetchingNextPage
        ) {
          repostedQuery.fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(repostedEndRef.current);
    return () => observer.disconnect();
  }, [repostedQuery.hasNextPage, repostedQuery.isFetchingNextPage, activeTab]);

  return (
    <>
      <div className="mt-10 w-full border-b border-gray-700">
        <div className="flex border-b border-blue-500/20 w-145 mx-auto">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 relative py-3 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-t-lg ${
                  isActive
                    ? "text-blue-400 bg-blue-500/10"
                    : "text-gray-400 hover:text-gray-300 hover:bg-blue-500/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-blue-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        {activeTab === "posts" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {posts.length === 0 && !postsQuery.isLoading ? (
              <div className="col-span-full text-center text-gray-400 py-12">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No posts yet</p>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <UserComponent data={post} key={post.id} />
                ))}
                <div ref={postsEndRef} className="py-2 flex justify-center">
                  {postsQuery.isFetchingNextPage && <LoadingSpinner />}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "shorts" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {shorts.length === 0 && !shortsQuery.isLoading ? (
              <div className="col-span-full text-center text-gray-400 py-12">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No shorts yet</p>
              </div>
            ) : (
              <>
                {shorts.map((short) => (
                  <UserComponent key={short.id} data={short} />
                ))}
                <div
                  ref={shortsEndRef}
                  className="col-span-full py-2 flex justify-center"
                >
                  {shortsQuery.isFetchingNextPage && <LoadingSpinner />}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "saved" && isOwner && (
          <div className="text-center text-gray-400 py-12">
            <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Saved content will be displayed here</p>
          </div>
        )}

        {activeTab === "reposted" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {reposted.length === 0 && !repostedQuery.isLoading ? (
              <div className="col-span-full text-center text-gray-400 py-12">
                <Repeat2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No reposts yet</p>
              </div>
            ) : (
              <>
                {reposted.map((item) => (
                  <UserComponent data={item} key={item.id} />
                ))}
                <div
                  ref={repostedEndRef}
                  className="col-span-full py-2 flex justify-center"
                >
                  {repostedQuery.isFetchingNextPage && <LoadingSpinner />}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};
