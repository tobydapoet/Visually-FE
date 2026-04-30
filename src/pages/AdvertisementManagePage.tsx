import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@mui/material";
import { handleGetAdUsers } from "../api/ad.api";
import AdUserList from "../components/AdUserLists";
import AdPostCard from "../components/AdPostCard";
import { useAd } from "../contexts/ad.context";
import type { UserSummaryType } from "../types/api/user.type";
import Pagination from "../components/Pagination";
import AdPopUp from "../components/AdPopUp";
import useDebounce from "../hooks/useDebounce";

const BoostedPostManagePage = () => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [selectedUser, setSelectedUser] = useState<UserSummaryType | null>(
    null,
  );
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 500);

  const {
    ads,
    loading: adsLoading,
    totalPages,
    currentPage,
    updatingStatusId,
    setCurrentPage,
    selectAd,
    updateAdStatus,
    fetchAds,
  } = useAd();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["ad-users", debouncedKeyword],
    queryFn: ({ pageParam = 0 }) =>
      handleGetAdUsers(pageParam, 10, debouncedKeyword || undefined),
    getNextPageParam: (lastPage) => {
      if (!lastPage.last) return lastPage.number + 1;
      return undefined;
    },
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
    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    setSelectedUser(null); // Reset selected user when searching
  };

  const handleSelectUser = (user: UserSummaryType) => {
    setSelectedUser(user);
    fetchAds(1, user.id);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (selectedUser) fetchAds(newPage, selectedUser.id);
  };

  const allUsers = data?.pages.flatMap((page) => page.content) || [];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900">
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-lg">
          <p className="font-semibold">Something went wrong!</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-zinc-900 flex flex-col md:flex-row">
      <div
        className="md:w-68 md:shrink-0 md:border-r md:border-zinc-800 md:overflow-y-auto md:h-screen md:sticky md:top-0
                    border-b border-zinc-800 overflow-x-auto"
      >
        {/* Search Input */}
        <div className="p-3 md:p-4 border-b border-zinc-800">
          <input
            type="text"
            value={keyword}
            onChange={handleSearch}
            placeholder="Search users..."
            className="w-full bg-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm
                       border border-zinc-700 rounded-lg px-3 py-2
                       focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        {isLoading ? (
          <div className="flex md:flex-col gap-3 p-3 md:p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-zinc-800 rounded-lg p-3 border border-zinc-700 min-w-45 md:min-w-0"
              >
                <div className="flex items-center gap-2">
                  <Skeleton
                    variant="circular"
                    width={32}
                    height={32}
                    sx={{ bgcolor: "#3f3f46", flexShrink: 0 }}
                  />
                  <div className="flex-1">
                    <Skeleton
                      variant="text"
                      width="60%"
                      height={20}
                      sx={{ bgcolor: "#3f3f46" }}
                    />
                    <Skeleton
                      variant="text"
                      width="40%"
                      height={16}
                      sx={{ bgcolor: "#3f3f46" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : allUsers.length === 0 ? (
          <div className="flex items-center justify-center p-6 text-zinc-500 text-sm">
            No users found
          </div>
        ) : (
          <AdUserList
            users={allUsers}
            loadMoreRef={loadMoreRef}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            selectedUserId={selectedUser?.id}
            onSelectUser={handleSelectUser}
            horizontal
          />
        )}
      </div>

      {/* Right panel unchanged */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto min-h-0">
        {!selectedUser ? (
          <div className="flex items-center justify-center h-full min-h-50 text-zinc-500 text-sm">
            Select a user to view their boosted posts
          </div>
        ) : adsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-zinc-800 rounded-xl p-5 border border-zinc-700 space-y-3"
              >
                <Skeleton
                  variant="text"
                  width="40%"
                  height={24}
                  sx={{ bgcolor: "#3f3f46" }}
                />
                <Skeleton
                  variant="rectangular"
                  height={60}
                  sx={{ bgcolor: "#3f3f46", borderRadius: 1 }}
                />
                <Skeleton
                  variant="text"
                  width="80%"
                  sx={{ bgcolor: "#3f3f46" }}
                />
                <Skeleton
                  variant="text"
                  width="60%"
                  sx={{ bgcolor: "#3f3f46" }}
                />
              </div>
            ))}
          </div>
        ) : ads.length === 0 ? (
          <div className="flex items-center justify-center min-h-50 text-zinc-500 text-sm">
            This user has no boosted posts
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="text-white font-semibold text-sm md:text-base">
                {selectedUser.fullName || selectedUser.username}'s Boosted Posts
              </h2>
              <p className="text-zinc-500 text-xs mt-0.5">
                @{selectedUser.username}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {ads.map((ad) => (
                <AdPostCard
                  key={ad.id}
                  ad={ad}
                  updatingStatusId={updatingStatusId}
                  onSelect={selectAd}
                  onUpdateStatus={updateAdStatus}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-4 md:mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      <AdPopUp />
    </div>
  );
};

export default BoostedPostManagePage;
