import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ChangeEvent,
} from "react";
import { toast } from "sonner";

type UseFileUploadProps = {
  accept: string;
  onChange: (file: File | null) => void;
  extractFrames?: boolean;
  frameCount?: number;
};

export function useFileUpload({
  accept,
  onChange,
  extractFrames = false,
  frameCount = 12,
}: UseFileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [frames, setFrames] = useState<string[]>([]);
  const [framesLoading, setFramesLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValid = (file: File) => {
    if (accept === "*") return true;
    return accept.split(",").some((a) => {
      const trimmed = a.trim();
      if (trimmed.endsWith("/*")) {
        return file.type.startsWith(trimmed.replace("/*", "/"));
      }
      return file.type === trimmed;
    });
  };

  const doExtractFrames = useCallback(
    async (objectUrl: string, duration?: number) => {
      setFramesLoading(true);
      const video = document.createElement("video");
      video.src = objectUrl;
      video.muted = true;
      video.crossOrigin = "anonymous";
      video.preload = "metadata";

      await new Promise<void>((res) => {
        video.onloadedmetadata = () => res();
      });

      const total = duration ?? video.duration;
      const canvas = document.createElement("canvas");
      canvas.width = 120;
      canvas.height = 160;
      const ctx = canvas.getContext("2d")!;
      const results: string[] = [];

      for (let i = 0; i < frameCount; i++) {
        video.currentTime = (i / (frameCount - 1)) * total;
        await new Promise<void>((res) => {
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            results.push(canvas.toDataURL("image/jpeg", 0.75));
            res();
          };
        });
      }

      setFrames(results);
      setFramesLoading(false);
    },
    [frameCount],
  );

  const handleSelect = (f: File) => {
    if (!isValid(f)) {
      toast.error("Invalid file type");
      return;
    }

    setFile(f);
    onChange?.(f);

    if (f.type.startsWith("image/") || f.type.startsWith("video/")) {
      const url = URL.createObjectURL(f);
      setPreview(url);

      if (extractFrames && f.type.startsWith("video/")) {
        doExtractFrames(url);
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleSelect(f);
  };

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setFrames([]);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return {
    file,
    preview,
    frames,
    framesLoading,
    inputRef,
    handleChange,
    handleSelect,
    handleRemove,
  };
}
