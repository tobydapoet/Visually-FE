import { Pause, Play } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import type { MusicResponse } from "../types/api/music.type";

type Props = {
  music: MusicResponse;
  onTimeChange?: (time: number) => void;
};

export function StoryMusicCard({ music, onTimeChange }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      onTimeChange?.(audio.currentTime);
    };
    const onMeta = () => setDuration(audio.duration || 0);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
    };
  }, [music]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.src = music.url;
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    onTimeChange?.(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  return (
    <div className="p-3 bg-zinc-800 rounded-lg w-full space-y-3">
      <div className="flex flex-col items-center gap-1 text-zinc-400">
        <img src={music.img} className="w-10 h-10 object-cover rounded-full" />
        <span className="text-white text-sm font-medium">{music.title}</span>
        <span className="text-xs">{music.artist}</span>
      </div>
      <audio ref={audioRef} />
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            togglePlay();
          }}
          className="cursor-pointer rounded-full bg-blue-500 p-2 hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all"
        >
          {isPlaying ? (
            <Pause size={18} className="text-white" />
          ) : (
            <Play size={18} className="text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
