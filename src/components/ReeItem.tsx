import { useEffect, useRef, useState } from "react";
import { VolumeX, Volume2, Pause, Play } from "lucide-react";

export const isVideo = (url: string): boolean =>
  /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);

interface ReelItemProps {
  url: string;
  isActive: boolean;
  isCurrent: boolean;
}

export function ReelItem({ url, isActive, isCurrent }: ReelItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [showIcon, setShowIcon] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive && isCurrent) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive, isCurrent]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (paused) {
      videoRef.current.play();
      setPaused(false);
    } else {
      videoRef.current.pause();
      setPaused(true);
    }
    setShowIcon(true);
    setTimeout(() => setShowIcon(false), 800);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) videoRef.current.muted = !muted;
    setMuted((m) => !m);
  };

  if (!isVideo(url)) {
    return (
      <img
        src={url}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.88)" }}
      />
    );
  }

  return (
    <>
      <video
        ref={videoRef}
        src={url}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted={muted}
        playsInline
        onClick={togglePlay}
        style={{ filter: "brightness(0.88)" }}
      />

      {showIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 72,
              height: 72,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(6px)",
              animation: "iconFade 0.8s ease forwards",
            }}
          >
            {paused ? (
              <Pause size={30} fill="white" color="white" />
            ) : (
              <Play size={30} fill="white" color="white" />
            )}
          </div>
        </div>
      )}

      <button
        onClick={toggleMute}
        className="absolute bottom-2 cursor-pointer right-4 z-30 flex items-center justify-center rounded-full"
        style={{
          width: 32,
          height: 32,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
        }}
      >
        {muted ? (
          <VolumeX size={15} color="white" />
        ) : (
          <Volume2 size={15} color="white" />
        )}
      </button>
    </>
  );
}
export default ReelItem;
