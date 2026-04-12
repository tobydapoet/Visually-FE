import type React from "react";
import { useEffect, useRef, useState } from "react";
import { StoryResponse } from "../types/api/storage.type";
import { useParams } from "react-router-dom";
import { handleGetStoryInStorage } from "../api/story.api";
import {
  Heart,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatCount } from "../utils/formatCount";
import { useStoryInteraction } from "../hooks/useStoryInteraction";
import { useUser } from "../contexts/user.context";
import LikeListPopUp from "../components/LikeListPopUp";

const StoryHighlightPage: React.FC = () => {
  const [storyList, setStoryList] = useState<StoryResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const { highlight } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<number | null>(null);
  const [progressWidth, setProgressWidth] = useState(0);
  const mediaContainerRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useUser();
  const [isOpenLikeList, setIsOpenLikeList] = useState(false);

  useEffect(() => {
    const fetchStorage = async () => {
      if (!highlight) return;
      const res = await handleGetStoryInStorage(Number(highlight), page);
      if (res) {
        if (page === 1) {
          setStoryList(res.content);
        } else {
          setStoryList((prev) => [...prev, ...res.content]);
          setCurrentIndex((prev) => prev + 1);
        }
        setTotal(res.total);
      }
    };
    fetchStorage();
  }, [page]);
  const currentStory = storyList[currentIndex];

  console.log("STORY: ", currentStory);
  const { isLiked, likeCount, toggleLike } = useStoryInteraction(
    currentStory ?? null,
  );

  useEffect(() => {
    setProgressWidth(0);
  }, [currentIndex]);

  useEffect(() => {
    if (!currentStory || !audioRef.current) return;

    let isActive = true;

    const playAudio = async () => {
      if (!audioRef.current || !isActive) return;

      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;

        if (currentStory.musicUrl) {
          audioRef.current.src = currentStory.musicUrl;
          audioRef.current.currentTime = currentStory.startMusicTime ?? 0;
          audioRef.current.muted = isMuted;
          audioRef.current.loop = true;

          await audioRef.current.load();

          if (isActive && audioRef.current) {
            await audioRef.current.play();
          }
        } else {
          audioRef.current.src = "";
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.log("Audio play error:", error);
        }
      }
    };

    playAudio();

    return () => {
      isActive = false;
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentStory, isMuted]);

  const timeAgo = (date: Date | string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const stopProgress = () => {
    if (progressRef.current) {
      cancelAnimationFrame(progressRef.current);
      progressRef.current = null;
    }
  };

  const startProgress = (duration: number) => {
    stopProgress();
    if (isPaused) return;

    const start = performance.now();
    const step = (ts: number) => {
      if (isPaused) return;

      const pct = Math.min(((ts - start) / duration) * 100, 100);
      setProgressWidth(pct);
      if (pct < 100) {
        progressRef.current = requestAnimationFrame(step);
      } else {
        goNext();
      }
    };
    progressRef.current = requestAnimationFrame(step);
  };

  const goNext = () => {
    stopProgress();
    setIsPaused(false);
    if (currentIndex < storyList.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else if (storyList.length < total) {
      setPage((p) => p + 1);
    }
  };

  const goPrev = () => {
    stopProgress();
    setIsPaused(false);
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleLongPress = () => {
    setIsPaused(true);
    stopProgress();
    if (videoRef.current && isVideo(currentStory?.mediaUrl)) {
      videoRef.current.pause();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleRelease = () => {
    setIsPaused(false);
    if (videoRef.current && isVideo(currentStory?.mediaUrl)) {
      videoRef.current.play();
      const remainingTime =
        videoRef.current.duration - videoRef.current.currentTime;
      startProgress(remainingTime * 1000);
    } else if (currentStory && !isVideo(currentStory.mediaUrl)) {
      const remainingPercent = 100 - progressWidth;
      const remainingTime = (remainingPercent / 100) * 5000;
      startProgress(remainingTime);
    }
    if (audioRef.current && currentStory?.musicUrl) {
      audioRef.current.play();
    }
  };

  const isVideo = (url?: string) =>
    url?.includes(".mp4") || url?.includes("/video/");

  return (
    <>
      <div className="relative flex items-center justify-center min-h-screen bg-black">
        {currentIndex > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-4 z-20 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-all duration-200 backdrop-blur-sm"
            style={{ left: "calc(50% - 250px - 3rem)" }}
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
        )}

        {currentIndex < total - 1 && (
          <button
            onClick={goNext}
            className="absolute right-4 z-20 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-all duration-200 backdrop-blur-sm"
            style={{ right: "calc(50% - 250px - 3rem)" }}
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        )}

        <audio ref={audioRef} loop />

        <div className="relative w-full max-w-sm h-screen bg-black rounded-xl overflow-hidden">
          <div className="absolute top-2 left-0 right-0 z-10 flex gap-1 px-2">
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
                          ? `${progressWidth}%`
                          : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          <div className="absolute top-5 left-0 right-0 z-10 flex items-center justify-between px-3">
            <div className="flex items-center gap-2">
              <img
                src={currentStory?.avatarUrl}
                className="w-9 h-9 rounded-full border-2 border-white object-cover"
                alt="avatar"
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
              {currentStory?.musicUrl ? (
                <button
                  onClick={() => setIsMuted((m) => !m)}
                  className="text-white"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              ) : (
                isVideo(currentStory?.mediaUrl) && (
                  <button
                    onClick={() => setIsMuted((m) => !m)}
                    className="text-white"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                )
              )}
            </div>
          </div>

          <div
            ref={mediaContainerRef}
            className="relative w-full h-full"
            onMouseDown={handleLongPress}
            onMouseUp={handleRelease}
            onMouseLeave={handleRelease}
            onTouchStart={handleLongPress}
            onTouchEnd={handleRelease}
          >
            {isLoading && (
              <div className="absolute inset-0 z-5 flex items-center justify-center bg-black/50">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}

            {currentStory && isVideo(currentStory.mediaUrl) ? (
              <video
                ref={videoRef}
                key={currentStory.id}
                src={currentStory.mediaUrl}
                className="w-full h-full object-cover"
                muted={!!currentStory.musicUrl || isMuted}
                playsInline
                onCanPlay={() => {
                  setIsLoading(false);
                  videoRef.current?.play();
                  startProgress((videoRef.current?.duration || 10) * 1000);
                }}
                onLoadStart={() => setIsLoading(true)}
                onEnded={() => {
                  if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                  }
                  goNext();
                }}
                onPause={() => {
                  if (isPaused) return;
                  setIsPaused(true);
                  stopProgress();
                }}
                onPlay={() => {
                  if (!isPaused) return;
                  setIsPaused(false);
                  if (videoRef.current) {
                    const remainingTime =
                      videoRef.current.duration - videoRef.current.currentTime;
                    startProgress(remainingTime * 1000);
                  }
                }}
              />
            ) : (
              <img
                key={currentStory?.id}
                src={currentStory?.mediaUrl}
                className="w-full h-full object-cover"
                alt="story"
                onLoad={() => {
                  setIsLoading(false);
                  startProgress(5000);
                }}
                onLoadStart={() => setIsLoading(true)}
              />
            )}
          </div>

          <div className="absolute bottom-0 right-0 z-10 p-3 bg-linear-to-t from-black/60 to-transparent">
            <div className="flex items-end gap-2">
              <button
                onClick={toggleLike}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                className="cursor-pointer"
              >
                <Heart
                  size={22}
                  className={`transition-colors ${
                    isLiked ? "text-red-500 fill-red-500" : "text-white"
                  }`}
                />
              </button>
              <span
                className={`text-white text-sm ${currentUser && currentStory && currentUser?.id === currentStory?.userId ? "hover:underline cursor-pointer" : ""}`}
                onClick={
                  currentUser &&
                  currentStory &&
                  currentUser?.id === currentStory.userId
                    ? () => setIsOpenLikeList(true)
                    : undefined
                }
              >
                {formatCount(likeCount)} likes
              </span>
            </div>
          </div>
        </div>
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

export default StoryHighlightPage;
