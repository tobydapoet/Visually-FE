import {
  createContext,
  useContext,
  useState,
  useRef,
  type ReactNode,
} from "react";
import type { MusicPageResponse, MusicResponse } from "../types/api/music.type";
import { handleGetListMusic, handleGetMusic } from "../api/media.api";
import type { MusicStatus } from "../constants/music.enum";

type MusicContextType = {
  loading: boolean;
  musicList: MusicResponse[];
  selectedMusic: MusicResponse | null;
  currentPlayingId: number | null;
  getMusicList: (
    page: number,
    size: number,
    status: MusicStatus,
    search?: string,
  ) => Promise<MusicPageResponse>;
  getMusicById: (id: number) => Promise<MusicResponse | null>;
  playMusic: (music: MusicResponse) => void;
  stopMusic: () => void;
  totalPages: number;
};

const MusicContext = createContext<MusicContextType | null>(null);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [musicList, setMusicList] = useState<MusicResponse[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<MusicResponse | null>(
    null,
  );
  const [currentPlayingId, setCurrentPlayingId] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getMusicList = async (
    page: number,
    size: number = 20,
    status: MusicStatus = "ACTIVE",
    search?: string,
  ): Promise<MusicPageResponse> => {
    try {
      setLoading(true);
      const res = await handleGetListMusic(page, size, status, search);
      setMusicList(res.content);
      setTotalPages(res.totalPages);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const getMusicById = async (id: number): Promise<MusicResponse | null> => {
    try {
      const res = await handleGetMusic(id);
      setSelectedMusic(res);
      return res;
    } catch (error) {
      console.error("Failed to fetch music:", error);
      return null;
    }
  };

  const playMusic = (music: MusicResponse) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (currentPlayingId === music.id) {
      setCurrentPlayingId(null);
      return;
    }

    audioRef.current = new Audio(music.url);
    audioRef.current.play();
    audioRef.current.onended = () => setCurrentPlayingId(null);
    setCurrentPlayingId(music.id);
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setCurrentPlayingId(null);
  };

  return (
    <MusicContext.Provider
      value={{
        loading,
        musicList,
        selectedMusic,
        currentPlayingId,
        getMusicList,
        getMusicById,
        playMusic,
        stopMusic,
        totalPages,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
};
