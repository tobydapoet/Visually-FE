import type React from "react";
import {
  BookmarkMinus,
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
  Heart,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useUser } from "../contexts/user.context";
import StoragePopUp from "../components/StoragePopUp";
import StoryMedia from "../components/StoryMedia";
import { handleRemoveFromStorage } from "../api/story.api";
import { useStory } from "../contexts/story.context";
import assets from "../assets";
import ConfirmDialog from "../components/ConfirmDialog";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStoryInteraction } from "../hooks/useStoryInteraction";
import LikeListPopUp from "../components/LikeListPopUp";
import { formatCount } from "../utils/formatCount";
import { handleView } from "../api/interaction.api";
import { timeAgo } from "../utils/timeAgot";

const StoryPage: React.FC = () => {
  const {
    currentStory,
    currentIndex,
    total,
    isMuted,
    progress,
    mediaWidth,
    isOpenStorage,
    audioRef,
    setIsMuted,
    setIsOpenStorage,
    handleLongPress,
    handleRelease,
    goNext,
    goPrev,
  } = useStory();
  const { currentUser } = useUser();
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const { updateCurrentStory } = useStory();
  const { isLiked, likeCount, toggleLike } = useStoryInteraction(
    currentStory ?? null,
  );
  const [isOpenLikeList, setIsOpenLikeList] = useState(false);
  const viewStartRef = useRef<number>(Date.now());
  const hasSentViewRef = useRef<boolean>(false);

  const flushView = useCallback(() => {
    if (!currentStory || hasSentViewRef.current) return;

    const watchTime = Math.floor((Date.now() - viewStartRef.current) / 1000);
    hasSentViewRef.current = true;
    handleView(currentStory.id, "STORY", watchTime);
  }, [currentStory]);

  useEffect(() => {
    viewStartRef.current = Date.now();
    hasSentViewRef.current = false;
  }, [currentIndex]);

  useEffect(() => {
    return () => {
      flushView();
    };
  }, [currentIndex, flushView]);

  const isVideo = (url?: string) =>
    url?.includes(".mp4") || url?.includes("/video/");

  return (
    <>
      <div className="relative flex items-center justify-center h-[calc(100vh-4rem)] md:min-h-screen bg-black">
        {currentIndex > 0 && (
          <button
            onClick={goPrev}
            className="hidden md:flex absolute z-20 p-3 rounded-full cursor-pointer bg-black/50 hover:bg-black/70 transition-all"
            style={{ left: `calc(50% - ${mediaWidth / 2}px - 4.5rem)` }}
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
        )}

        {currentIndex < total - 1 && (
          <button
            onClick={goNext}
            className="hidden md:flex absolute z-20 p-3 rounded-full cursor-pointer bg-black/50 hover:bg-black/70 transition-all"
            style={{ right: `calc(50% - ${mediaWidth / 2}px - 4.5rem)` }}
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        )}

        <div
          className="flex h-[calc(100vh-4rem)] md:min-h-screen w-full md:w-auto"
          style={{ width: undefined }}
        >
          <audio ref={audioRef} loop />
          <div className="relative w-full">
            <div className="absolute top-2 left-0 right-0 z-10 px-2">
              <div className="flex gap-1">
                {Array.from({ length: total }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
                  >
                    <div
                      className="h-full bg-white transition-none"
                      style={{
                        width:
                          i < currentIndex
                            ? "100%"
                            : i === currentIndex
                              ? `${progress}%`
                              : "0%",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute top-5 left-0 right-0 z-10 flex items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <img
                  src={currentStory?.avatarUrl || assets.profile}
                  className="w-9 h-9 rounded-full border-2 border-white object-cover"
                />
                <div>
                  <p className="text-white text-sm font-semibold drop-shadow">
                    {currentStory?.username}
                  </p>
                  <p className="text-white/70 text-xs drop-shadow">
                    {currentStory?.createdAt
                      ? timeAgo(currentStory.createdAt)
                      : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {(currentStory?.musicUrl ||
                  isVideo(currentStory?.mediaUrl)) && (
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                )}
              </div>
            </div>

            <div
              className="relative h-[calc(100vh-4rem)] md:h-screen"
              onMouseDown={handleLongPress}
              onMouseUp={handleRelease}
              onMouseLeave={handleRelease}
              onTouchStart={handleLongPress}
              onTouchEnd={handleRelease}
            >
              <StoryMedia />
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-linear-to-t from-black/80 via-black/40 to-transparent">
              <div className="flex items-center justify-between">
                {currentUser && currentUser.id === currentStory?.userId ? (
                  currentStory?.storageId ? (
                    <button
                      onClick={() => setOpenRemoveDialog(true)}
                      className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-red-500/80 hover:border-red-400 transition-all duration-200 group"
                    >
                      <BookmarkMinus
                        size={18}
                        className="text-white/80 group-hover:text-white"
                      />
                      <span className="text-sm font-medium text-white/90 group-hover:text-white">
                        Remove
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsOpenStorage(true)}
                      className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-blue-500/80 hover:border-blue-400 transition-all duration-200 group"
                    >
                      <BookmarkPlus
                        size={18}
                        className="text-white/80 group-hover:text-white"
                      />
                      <span className="text-sm font-medium text-white/90 group-hover:text-white">
                        Highlight
                      </span>
                    </button>
                  )
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={toggleLike}
                    disabled={currentUser?.id === currentStory?.userId}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    className={`p-1.5 rounded-full transition-transform ${
                      currentUser?.id === currentStory?.userId
                        ? "pointer-events-none"
                        : "active:scale-90 hover:scale-105"
                    }`}
                  >
                    <Heart
                      size={24}
                      className={`transition-all duration-200 cursor-pointer ${
                        isLiked
                          ? "text-red-500 fill-red-500 drop-shadow-lg"
                          : "text-white/90 hover:text-red-400"
                      }`}
                    />
                  </button>
                  <button
                    onClick={
                      currentUser?.id === currentStory?.userId
                        ? () => setIsOpenLikeList(true)
                        : undefined
                    }
                    className={`text-sm font-medium transition-colors ${
                      currentUser?.id === currentStory?.userId
                        ? "hover:underline cursor-pointer text-white/80 hover:text-white"
                        : "text-white/80 cursor-default"
                    }`}
                  >
                    {formatCount(likeCount)}{" "}
                    {likeCount === 1 ? "like" : "likes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {currentStory && (
          <StoragePopUp
            onClose={() => setIsOpenStorage(false)}
            open={isOpenStorage}
            storyId={currentStory.id}
          />
        )}

        <ConfirmDialog
          message="Do you want to remove this story from highlight?"
          onClose={() => setOpenRemoveDialog(false)}
          onConfirm={async () => {
            if (currentStory && currentStory.storageId)
              await handleRemoveFromStorage(
                currentStory.id,
                currentStory.storageId,
              );
            updateCurrentStory((s) => ({ ...s, storageId: undefined }));
          }}
          open={openRemoveDialog}
          title="Remove from highlight"
        />
      </div>

      {currentStory && (
        <LikeListPopUp
          onClose={() => setIsOpenLikeList(false)}
          open={isOpenLikeList}
          targetId={currentStory.id}
          targetType="STORY"
        />
      )}
    </>
  );
};

export default StoryPage;
