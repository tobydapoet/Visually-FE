import { useInfiniteQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import type { StoryUserResponse } from "../types/api/story.type";
import { handleGetNonExpiredStories } from "../api/story.api";
import { type FC } from "react";
import assets from "../assets";
import { useNavigate } from "react-router-dom";

const ValidUserStoryList: FC = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["stories"],
      queryFn: ({ pageParam = 1 }) => handleGetNonExpiredStories(pageParam, 20),
      getNextPageParam: (lastPage, pages) =>
        lastPage.content.length === 20 ? pages.length + 1 : undefined,
      initialPageParam: 1,
    });
  const navigate = useNavigate();

  const userStoryList: StoryUserResponse[] =
    data?.pages.flatMap((p) => p.content) ?? [];

  const handleSlideEnd = (swiper: any) => {
    if (swiper.isEnd && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="w-full p-4">
      <Swiper
        spaceBetween={16}
        slidesPerView="auto"
        grabCursor={true}
        onReachEnd={handleSlideEnd}
      >
        {userStoryList.map((story) => (
          <SwiperSlide key={story.id} style={{ width: "5.5rem" }}>
            <div className="flex flex-col gap-1 cursor-pointer">
              <div
                onClick={() =>
                  navigate(`/stories/${story.username}/${story.id}`)
                }
                className={`w-20 h-20 rounded-full p-1 ${
                  story.isViewed
                    ? "bg-gray-400"
                    : "bg-linear-to-tr from-blue-300 to-blue-800"
                }`}
              >
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <img
                    src={story.avatarUrl || assets.profile}
                    alt={story.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-xs text-gray-700">{story.username}</span>
            </div>
          </SwiperSlide>
        ))}
        {isFetchingNextPage && (
          <SwiperSlide style={{ width: "5.5rem" }}>
            <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  );
};

export default ValidUserStoryList;
