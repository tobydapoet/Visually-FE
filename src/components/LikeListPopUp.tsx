import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type React from "react";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { handleGetLikeByTarget } from "../api/interaction.api";
import assets from "../assets";
import type { LikeTargetType } from "../constants/interaction.enum";

type Props = {
  open: boolean;
  onClose: () => void;
  targetId: number;
  targetType: LikeTargetType;
};

const LikeListPopUp: React.FC<Props> = ({
  open,
  onClose,
  targetId,
  targetType,
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["likes", targetId, targetType],
      queryFn: ({ pageParam = 1 }) =>
        handleGetLikeByTarget(targetId, targetType, pageParam, 15),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
      enabled: open && !!targetId,
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

  const allLikes = data?.pages.flatMap((page) => page.content) ?? [];

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center">
        <DialogPanel
          transition
          className="w-full max-w-lg rounded-xl bg-zinc-900 p-0 text-white duration-300 ease-out data-closed:scale-95 data-closed:opacity-0"
        >
          <DialogTitle className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
            <div className="text-md font-semibold text-white">Likes</div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center cursor-pointer justify-center rounded-full hover:bg-zinc-800 transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </DialogTitle>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300" />
              </div>
            ) : allLikes.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-8">
                No likes yet
              </div>
            ) : (
              allLikes.map((like: any) => (
                <div
                  key={like.userId}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors"
                >
                  <img
                    src={like.avatarUrl || assets.profile}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <span className="text-sm text-white">{like.username}</span>
                </div>
              ))
            )}

            {hasNextPage && <div ref={loadMoreRef} className="h-2" />}
            {isFetchingNextPage && (
              <div className="flex justify-center py-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-300" />
              </div>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default LikeListPopUp;
