import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  handleGetStory,
  handleGetStoryInStorage,
  handleValidStoryByUser,
} from "../api/story.api";
import type { StoryResponse } from "../types/api/storage.type";

interface StoryContextType {
  storyList: StoryResponse[];
  currentStory: StoryResponse | null;
  currentIndex: number;
  total: number;
  isMuted: boolean;
  isLoading: boolean;
  isPaused: boolean;
  progress: number;
  mediaWidth: number;
  isOpenStorage: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  setIsMuted: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  setIsOpenStorage: (v: boolean) => void;
  setMediaWidth: (v: number) => void;
  goNext: () => void;
  goPrev: () => void;
  handleLongPress: () => void;
  handleRelease: () => void;
  updateCurrentStory: (
    updater: (story: StoryResponse) => StoryResponse,
  ) => void;
}

const StoryContext = createContext<StoryContextType | null>(null);

export const StoryProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { username, storyId, highlight } = useParams<{
    username?: string;
    storyId?: string;
    highlight?: string;
  }>();
  const navigate = useNavigate();
  const [storyList, setStoryList] = useState<StoryResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [total, setTotal] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, _setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mediaWidth, setMediaWidth] = useState(window.innerHeight * (9 / 16));
  const [isOpenStorage, setIsOpenStorage] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);

  const setIsPaused = (v: boolean) => {
    isPausedRef.current = v;
    _setIsPaused(v);
  };

  const currentStory = storyList[currentIndex] ?? null;

  const isVideo = (url?: string) =>
    url?.includes(".mp4") || url?.includes("/video/");

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        let res: StoryResponse[] = [];

        if (username) {
          res = await handleValidStoryByUser(username);
          const index = res.findIndex((s) => s.id === Number(storyId));
          setCurrentIndex(index >= 0 ? index : 0);
        } else if (highlight) {
          res = await handleGetStoryInStorage(Number(highlight));
        } else {
          const story = await handleGetStory(Number(storyId));
          res = [story];
        }

        setStoryList(res);
        setTotal(res.length);
      } catch (error) {
        console.error("Failed to fetch stories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [username, highlight]);

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
          audioRef.current.muted = isMuted;
          audioRef.current.loop = true;
          await audioRef.current.load();
          audioRef.current.currentTime = currentStory.startMusicTime ?? 0;
          if (isActive) await audioRef.current.play();
        } else if (!currentStory.musicUrl && isVideo(currentStory.mediaUrl)) {
          if (videoRef.current) videoRef.current.muted = isMuted;
        } else {
          audioRef.current.src = "";
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
        }
      }
    };

    const timer = setTimeout(playAudio, 50);

    return () => {
      isActive = false;
      clearTimeout(timer);
      audioRef.current?.pause();
    };
  }, [currentStory]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = isMuted;
    if (!isMuted && currentStory?.musicUrl) {
      audioRef.current.currentTime = currentStory.startMusicTime ?? 0;
      audioRef.current.play().catch(console.log);
    } else if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    setProgress(0);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (!currentStory) return;
    if (isVideo(currentStory.mediaUrl) && videoRef.current) return;

    const step = (100 / 5000) * 100;
    progressIntervalRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(progressIntervalRef.current!);
          goNext();
          return 0;
        }
        return next;
      });
    }, 100);

    return () => {
      clearInterval(progressIntervalRef.current!);
    };
  }, [currentStory]);

  useEffect(() => {
    if (!videoRef.current || !isVideo(currentStory?.mediaUrl)) return;
    const video = videoRef.current;
    const updateProgress = () => {
      if (video.duration)
        setProgress((video.currentTime / video.duration) * 100);
    };
    const handleEnded = () => goNext();
    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("ended", handleEnded);
    };
  }, [currentStory]);

  const goNext = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (currentIndex < storyList.length - 1) {
      setCurrentIndex((i) => {
        const nextIndex = i < storyList.length - 1 ? i + 1 : 0;
        const nextStory = storyList[nextIndex];

        navigate(`/stories/${nextStory.username}/${nextStory.id}`, {
          replace: true,
        });

        return nextIndex;
      });
    } else {
      setCurrentIndex(0);
    }
  };

  const goPrev = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    setCurrentIndex((i) => {
      if (i === 0) return i;

      const prevIndex = i - 1;
      const prevStory = storyList[prevIndex];

      navigate(`/stories/${prevStory.username}/${prevStory.id}`, {
        replace: true,
      });

      return prevIndex;
    });
  };
  const handleLongPress = () => {
    setIsPaused(true);
    if (videoRef.current && isVideo(currentStory?.mediaUrl))
      videoRef.current.pause();
    audioRef.current?.pause();
  };

  const handleRelease = () => {
    setIsPaused(false);
    if (videoRef.current && isVideo(currentStory?.mediaUrl)) {
      videoRef.current.play().catch(console.log);
    }
    if (audioRef.current && currentStory?.musicUrl) {
      audioRef.current.play().catch(console.log);
    }
  };

  const updateCurrentStory = (
    updater: (story: StoryResponse) => StoryResponse,
  ) => {
    setStoryList((prev) =>
      prev.map((s, i) => (i === currentIndex ? updater(s) : s)),
    );
  };

  return (
    <StoryContext.Provider
      value={{
        storyList,
        currentStory,
        currentIndex,
        total,
        isMuted,
        isLoading,
        isPaused,
        progress,
        mediaWidth,
        isOpenStorage,
        videoRef,
        audioRef,
        setIsMuted,
        setIsLoading,
        setIsOpenStorage,
        setMediaWidth,
        goNext,
        goPrev,
        handleLongPress,
        handleRelease,
        updateCurrentStory,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
};

export const useStory = () => {
  const ctx = useContext(StoryContext);
  if (!ctx) throw new Error("useStory must be used within StoryProvider");
  return ctx;
};
