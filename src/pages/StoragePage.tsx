import { ArrowLeft, SquareStar } from "lucide-react";
import { useEffect, useRef } from "react";
import { useUser } from "../contexts/user.context";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { handleGetStoryByUser } from "../api/story.api";

const StoragePage: React.FC = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["stories", currentUser?.id],

      queryFn: async () => {
        if (!currentUser?.id) {
          return {
            content: [],
            page: 1,
            total: 0,
            size: 10,
          };
        }

        const response = await handleGetStoryByUser(currentUser.id);

        return {
          content: response.content,
          page: response.page,
          total: response.total,
          size: response.size || 10,
        };
      },

      initialPageParam: 1,

      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.page + 1;
        return nextPage * lastPage.size <= lastPage.total
          ? nextPage
          : undefined;
      },

      enabled: !!currentUser?.id,
    });

  const storyList = data?.pages.flatMap((page) => page.content) || [];

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleStoryClick = (storyId: number) => {
    navigate(`/story/${storyId}`);
  };

  return (
    <div className="w-full max-w-272 pt-10">
      <div
        className="flex gap-3 cursor-pointer items-center mb-4"
        onClick={() => navigate(`/${currentUser?.username}`)}
      >
        <ArrowLeft size={20} />
        <span className="text-lg font-semibold">Storage</span>
      </div>

      <div className="flex gap-2 items-center justify-center border-b border-gray-700 mx-auto">
        <div className="border-b flex pb-2 gap-2 items-center">
          <SquareStar size={18} />
          <span>Stories</span>
        </div>
      </div>

      {storyList.length === 0 && !isFetchingNextPage ? (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <SquareStar size={48} className="mb-4 opacity-50" />
          <p>No stories yet</p>
          <p className="text-sm">Share your first story!</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 mt-5">
          {storyList.map((story) => (
            <div
              key={story.id}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleStoryClick(story.id)}
            >
              {story.mediaUrl?.includes(".mp4") ||
              story.mediaUrl?.includes("/video/") ? (
                <video
                  src={story.mediaUrl}
                  className="h-90 w-68 object-cover rounded-lg"
                  muted
                />
              ) : (
                <img
                  src={story.mediaUrl}
                  alt={story.username}
                  className="h-90 w-68 object-cover rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div
        ref={loadMoreRef}
        className="h-15 pb-10 flex justify-center items-center"
      >
        {isFetchingNextPage && (
          <Box sx={{ display: "flex", gap: 1, mt: 4 }}>
            {[0, 1, 2].map((dot) => (
              <Box
                key={dot}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "white",
                  animation: `bounce 1.5s ease-in-out ${dot * 0.2}s infinite`,
                  "@keyframes bounce": {
                    "0%, 100%": { transform: "scale(1)", opacity: 0.5 },
                    "50%": { transform: "scale(1.5)", opacity: 1 },
                  },
                }}
              />
            ))}
          </Box>
        )}
      </div>
    </div>
  );
};

export default StoragePage;
