import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from "react";
import type { StoryResponse } from "../types/api/storage.type";

interface StoryStorageContextType {
  storyList: StoryResponse[];
  currentStory: StoryResponse | null;
  currentIndex: number;
  total: number;
  isMuted: boolean;
  isLoading: boolean;
  isPaused: boolean;
  progress: number;
  mediaWidth: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  setIsMuted: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  setMediaWidth: (v: number) => void;
  goNext: () => void;
  goPrev: () => void;
  handleLongPress: () => void;
  handleRelease: () => void;
}

const StoryStorageContext = createContext<StoryStorageContextType | null>(null);

interface StoryStorageProviderProps {
  children: ReactNode;
  fetchFn: () => Promise<StoryResponse[]>;
  initialStoryId?: number;
}

export const StoryStorageProvider: FC<StoryStorageProviderProps> = ({
  children,
  fetchFn,
  initialStoryId,
}) => {
  const [storyList, setStoryList] = useState<StoryResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [total, setTotal] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, _setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mediaWidth, setMediaWidth] = useState(window.innerHeight * (9 / 16));

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const currentIndexRef = useRef(0);
  const storyListRef = useRef<StoryResponse[]>([]);
  const goNextRef = useRef(() => {});

  const setIsPaused = (v: boolean) => {
    isPausedRef.current = v;
    _setIsPaused(v);
  };

  const currentStory = storyList[currentIndex] ?? null;

  const isVideo = (url?: string) =>
    url?.includes(".mp4") || url?.includes("/video/");

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);
  useEffect(() => {
    storyListRef.current = storyList;
  }, [storyList]);

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const res = await fetchFn();
        setStoryList(res);
        setTotal(res.length);
        storyListRef.current = res;
        if (initialStoryId) {
          const index = res.findIndex((s) => s.id === initialStoryId);
          setCurrentIndex(index >= 0 ? index : 0);
          currentIndexRef.current = index >= 0 ? index : 0;
        }
      } catch (error) {
        console.error("Failed to fetch stories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

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
        } else if (isVideo(currentStory.mediaUrl)) {
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
          goNextRef.current();
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
    const handleEnded = () => goNextRef.current();
    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("ended", handleEnded);
    };
  }, [currentStory]);

  const goNext = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (currentIndexRef.current < storyListRef.current.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(0);
      setProgress(0);
    }
  };
  goNextRef.current = goNext;

  const goPrev = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (currentIndexRef.current > 0) setCurrentIndex((i) => i - 1);
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

  return (
    <StoryStorageContext.Provider
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
        videoRef,
        audioRef,
        setIsMuted,
        setIsLoading,
        setMediaWidth,
        goNext,
        goPrev,
        handleLongPress,
        handleRelease,
      }}
    >
      {children}
    </StoryStorageContext.Provider>
  );
};

export const useStoryStorage = () => {
  const ctx = useContext(StoryStorageContext);
  if (!ctx)
    throw new Error("useStoryStorage must be used within StoryStorageProvider");
  return ctx;
};
