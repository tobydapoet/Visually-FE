import { useState, useCallback } from "react";

export function useVideoFrames(frameCount = 12) {
  const [frames, setFrames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const extractFrames = useCallback(
    async (videoSrc: string) => {
      setLoading(true);
      const video = document.createElement("video");
      video.src = videoSrc;
      video.muted = true;
      video.crossOrigin = "anonymous";

      await new Promise<void>((res) => {
        video.onloadedmetadata = () => res();
      });

      const duration = video.duration;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = 60;
      canvas.height = 80;

      const results: string[] = [];

      for (let i = 0; i < frameCount; i++) {
        const time = (i / (frameCount - 1)) * duration;
        video.currentTime = time;

        await new Promise<void>((res) => {
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            results.push(canvas.toDataURL("image/jpeg", 0.7));
            res();
          };
        });
      }

      setFrames(results);
      setLoading(false);
    },
    [frameCount],
  );

  return { frames, loading, extractFrames };
}
