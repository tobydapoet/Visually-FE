import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Plus, Volume2, VolumeX } from "lucide-react";

import { handleGetStory, handleRemoveFromStorage } from "../api/story.api";
import type { StoryResponse } from "../types/api/storage.type";
import { useUser } from "../contexts/user.context";
import StoragePopUp from "../components/StoragePopUp";

const StoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [story, setStory] = useState<StoryResponse | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isOpenStorage, setIsOpenStorage] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaContainerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const { currentUser } = useUser();

  useEffect(() => {
    const fetchStory = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await handleGetStory(Number(id));
        setStory(data);
      } catch (error) {
        console.error("Failed to fetch story:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStory();
  }, [id, navigate]);

  useEffect(() => {
    if (!story || !audioRef.current) return;

    let isActive = true;

    const playAudio = async () => {
      if (!audioRef.current || !isActive) return;

      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;

        if (story.musicUrl) {
          audioRef.current.src = story.musicUrl;
          audioRef.current.muted = isMuted;
          audioRef.current.loop = true;

          await audioRef.current.load();

          const startTime = story.startMusicTime ?? 0;
          audioRef.current.currentTime = startTime;

          if (isActive && audioRef.current) {
            await audioRef.current.play();
          }
        } else {
          audioRef.current.src = "";
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
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
  }, [story, isMuted]);

  useEffect(() => {
    if (!story) return;

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    if (isPaused) return;

    const isVideoFile = isVideo(story.mediaUrl);

    if (isVideoFile && videoRef.current) {
      return;
    }

    const duration = 5000;
    const interval = 100;
    const step = (100 / duration) * interval;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + step;
        if (newProgress >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          handleClose();
          return 100;
        }
        return newProgress;
      });
    }, interval);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [story, isPaused]);

  useEffect(() => {
    if (!videoRef.current || !isVideo(story?.mediaUrl)) return;

    const video = videoRef.current;

    const updateProgress = () => {
      if (video.duration) {
        const percent = (video.currentTime / video.duration) * 100;
        setProgress(percent);
      }
    };

    const handleEnded = () => {
      handleClose();
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("ended", handleEnded);
    };
  }, [story]);

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    // navigate(-1);
  };

  const handleLongPress = () => {
    setIsPaused(true);
    if (videoRef.current && isVideo(story?.mediaUrl)) {
      videoRef.current.pause();
    }
  };

  const handleRelease = () => {
    setIsPaused(false);
    if (videoRef.current && isVideo(story?.mediaUrl)) {
      videoRef.current.play().catch((err) => console.log("Play error:", err));
    }
  };

  const timeAgo = (date: Date | string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const isVideo = (url?: string) =>
    url?.includes(".mp4") || url?.includes("/video/");

  if (!story && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Story not found
      </div>
    );
  }

  return (
    <>
      <div className="inset-0 z-50">
        <div className="flex min-h-screen">
          <audio ref={audioRef} loop />

          <div className="relative w-full max-w-sm">
            <div className="absolute top-2 left-0 right-0 z-10 px-2">
              <div className="h-0.5 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="absolute top-5 left-0 right-0 z-10 flex items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <img
                  src={story?.avatarUrl}
                  className="w-9 h-9 rounded-full border-2 border-white object-cover"
                />
                <div>
                  <p className="text-white text-sm font-semibold drop-shadow">
                    {story?.username}
                  </p>
                  <p className="text-white/70 text-xs drop-shadow">
                    {story?.createdAt ? timeAgo(story.createdAt) : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {story?.musicUrl ? (
                  <button
                    onClick={() => setIsMuted((m) => !m)}
                    className="text-white"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                ) : (
                  isVideo(story?.mediaUrl) && (
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
              className="relative w-auto h-screen"
              onMouseDown={handleLongPress}
              onMouseUp={handleRelease}
              onMouseLeave={handleRelease}
              onTouchStart={handleLongPress}
              onTouchEnd={handleRelease}
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}

              {story && isVideo(story.mediaUrl) ? (
                <video
                  ref={videoRef}
                  key={story.id}
                  src={story.mediaUrl}
                  className="w-auto h-screen object-cover"
                  muted={!!story.musicUrl || isMuted}
                  playsInline
                  autoPlay
                  onCanPlay={() => setIsLoading(false)}
                  onLoadStart={() => setIsLoading(true)}
                />
              ) : (
                <img
                  key={story?.id}
                  src={story?.mediaUrl}
                  className="w-full h-full object-cover"
                  onLoad={() => setIsLoading(false)}
                  onLoadStart={() => setIsLoading(true)}
                />
              )}
            </div>

            {currentUser && currentUser.id !== story?.userId ? (
              <div className="absolute bottom-0 left-0 right-0 z-10 p-3 bg-linear-to-t from-black/60 to-transparent">
                <div className="flex items-center gap-2">
                  <Heart size={22} className="text-white cursor-pointer" />
                </div>
              </div>
            ) : (
              <div className="absolute bottom-0 right-0 z-10 p-3 bg-linear-to-t cursor-pointer from-black/60 to-transparent">
                {story?.storageId ? (
                  <div
                    className="flex items-center gap-2 rounded-full bg-red-600 p-2 hover:bg-red-700 transition-colors"
                    onClick={() => {
                      if (!story.storageId) return;
                      handleRemoveFromStorage(story.id, story.storageId);
                    }}
                  >
                    <Plus size={22} className="text-white" />
                    <span>Remove from Highlight</span>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-2 rounded-full bg-blue-600 p-2 hover:bg-blue-700 transition-colors"
                    onClick={() => setIsOpenStorage(true)}
                  >
                    <Plus size={22} className="text-white" />
                    <span>Add to Highlight</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {story && (
          <StoragePopUp
            onClose={() => setIsOpenStorage(false)}
            open={isOpenStorage}
            storyId={story.id}
          />
        )}
      </div>
    </>
  );
};

export default StoryPage;
