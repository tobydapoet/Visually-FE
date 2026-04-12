import { useEffect, useState } from "react";
import { handleLike, handleDislike } from "../api/interaction.api";
import type { LikeTargetType } from "../constants/interaction.enum";
import type { StoryResponse } from "../types/api/storage.type";

export const useStoryInteraction = (story: StoryResponse | null) => {
  const [isLiked, setIsLiked] = useState(story?.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(story?.likeCount ?? 0);

  useEffect(() => {
    setIsLiked(story?.isLiked ?? false);
    setLikeCount(story?.likeCount ?? 0);
  }, [story]);

  const toggleLike = async () => {
    if (!story) return;
    const prevLiked = isLiked;
    setIsLiked(!prevLiked);
    setLikeCount((prev) => (prevLiked ? prev - 1 : prev + 1));
    try {
      if (prevLiked) {
        await handleDislike({
          targetId: story.id,
          targetType: "STORY" as LikeTargetType,
        });
      } else {
        await handleLike({
          targetId: story.id,
          targetType: "STORY" as LikeTargetType,
        });
      }
    } catch {
      setIsLiked(prevLiked);
      setLikeCount((prev) => (prevLiked ? prev + 1 : prev - 1));
    }
  };

  return { isLiked, likeCount, toggleLike };
};
