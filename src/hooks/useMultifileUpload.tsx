import { useRef, useState, useCallback, type ChangeEvent } from "react";
import { toast } from "sonner";
import { getVideoDuration } from "../utils/videoDuration";

type UseMultiFileUploadProps = {
  accept: string;
  onChange?: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  maxVideoDurationSec?: number;
};

type FileEntry = {
  id: string;
  file: File;
  preview: string;
};

export function useMultiFileUpload({
  accept,
  onChange,
  maxFiles = 10,
  maxSizeMB = 50,
  maxVideoDurationSec,
}: UseMultiFileUploadProps) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
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

  const addFiles = useCallback(
    async (incoming: File[]) => {
      const results: FileEntry[] = [];

      for (const file of incoming) {
        if (!isValid(file)) {
          toast.error(`"${file.name}" is an invalid file type`);
          continue;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
          toast.error(`"${file.name}" exceeds ${maxSizeMB}MB`);
          continue;
        }

        if (maxVideoDurationSec && file.type.startsWith("video/")) {
          const duration = await getVideoDuration(file);
          if (duration > maxVideoDurationSec) {
            toast.error(`"${file.name}" must be under ${maxVideoDurationSec}s`);
            continue;
          }
        }

        results.push({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
        });
      }

      setEntries((prev) => {
        const combined = [...prev, ...results];
        if (combined.length > maxFiles) {
          toast.error(`Max ${maxFiles} files allowed`);
          combined
            .slice(maxFiles)
            .forEach((e) => URL.revokeObjectURL(e.preview));
          const trimmed = combined.slice(0, maxFiles);
          onChange?.(trimmed.map((e) => e.file));
          return trimmed;
        }
        onChange?.(combined.map((e) => e.file));
        return combined;
      });
    },
    [accept, maxFiles, maxSizeMB, maxVideoDurationSec, onChange],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) addFiles(files);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = (id: string) => {
    setEntries((prev) => {
      const target = prev.find((e) => e.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      const next = prev.filter((e) => e.id !== id);
      onChange?.(next.map((e) => e.file));
      return next;
    });
  };

  const handleRemoveAll = () => {
    setEntries((prev) => {
      prev.forEach((e) => URL.revokeObjectURL(e.preview));
      return [];
    });
    onChange?.([]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length) addFiles(files);
  };

  return {
    entries,
    inputRef,
    handleChange,
    handleDrop,
    handleRemove,
    handleRemoveAll,
    addFiles,
  };
}
