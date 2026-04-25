import "../css/shortpopup.css";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X, Trash2, Camera } from "lucide-react";
import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateShortSchema,
  type CreateShortType,
} from "../types/schemas/short.schema";
import { useUser } from "../contexts/user.context";
import { useFileUpload } from "../hooks/useFileUpload";
import { useVideoFrames } from "../hooks/useVideoFrames";
import { VideoFrameStrip } from "./VideoFrameStrip";
import HashTagsField from "./HashTagField";
import { CaptionField } from "./CaptionFiled";
import type { MentionItem } from "../types/api/mention.type";
import { handleCreateShort } from "../api/short.api";
import { toast } from "sonner";
import { useProgressBar } from "../hooks/useProgressBar";
import { ProgressBar } from "./ProgressBar";

type Props = { open: boolean; onClose: () => void };

const ShortPopUp: React.FC<Props> = ({ open, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [rightPanelMounted, setRightPanelMounted] = useState(false);
  const [rightPanelVisible, setRightPanelVisible] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentions, setMentions] = useState<MentionItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { currentUser } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captionRef = useRef<HTMLDivElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { frames, extractFrames } = useVideoFrames(12);
  const {
    progress,
    start,
    done,
    reset: resetProgress,
  } = useProgressBar({
    estimatedMs: 15000,
  });

  const {
    handleSubmit,
    setValue,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateShortType>({ resolver: zodResolver(CreateShortSchema) });
  const tags = watch("tagsName") ?? [];

  const video = useFileUpload({
    accept: "video/*",
    extractFrames: true,
    frameCount: 14,
    onChange: (file) => {
      if (file) {
        const url = URL.createObjectURL(file);
        const tempVideo = document.createElement("video");
        tempVideo.src = url;

        tempVideo.onloadedmetadata = () => {
          URL.revokeObjectURL(url);

          if (tempVideo.duration > 60) {
            toast.error("Video must be under 1 minute");
            video.handleRemove();
            setValue("fileVideo", undefined as any, { shouldValidate: true });
            return;
          }

          setValue("fileVideo", file, { shouldValidate: true });
        };
      } else {
        setValue("fileVideo", undefined as any, { shouldValidate: false });
      }
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
      handleRemoveVideo();
      resetProgress();
      setIsUploading(false);
    }
  }, [open]);

  const cover = useFileUpload({
    accept: "image/*",
    onChange: (file) => {
      setValue("fileThumbnail", file ?? (undefined as any), {
        shouldValidate: false,
      });
    },
  });

  useEffect(() => {
    if (video.file) {
      setRightPanelMounted(true);
      const t = setTimeout(() => setRightPanelVisible(true), 30);
      return () => clearTimeout(t);
    } else {
      setRightPanelVisible(false);
      const t = setTimeout(() => setRightPanelMounted(false), 350);
      return () => clearTimeout(t);
    }
  }, [video.file]);

  useEffect(() => {
    if (video.preview) extractFrames(video.preview);
  }, [video.preview]);

  useEffect(() => {
    if (video.frames.length > 0 && !cover.file) {
      fetch(video.frames[0])
        .then((r) => r.blob())
        .then((blob) => {
          const file = new File([blob], "cover.jpg", { type: "image/jpeg" });
          cover.handleSelect(file);
        });
    }
  }, [video.frames]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  const handleRemoveVideo = () => {
    video.handleRemove();
    cover.handleRemove();
  };

  const handleClose = () => {
    if (isUploading || isSubmitting) return;
    reset();
    handleRemoveVideo();
    resetProgress();
    onClose();
  };

  const onSubmit = async (data: CreateShortType) => {
    const payload = { ...data, mentions };

    const formData = new FormData();

    if (payload.caption) formData.append("caption", payload.caption);

    formData.append("fileVideo", payload.fileVideo);
    formData.append("fileThumbnail", payload.fileThumbnail);

    if (payload.mentions?.length) {
      formData.append("mentions", JSON.stringify(payload.mentions));
    }

    payload.tagsName?.forEach((tag) => formData.append("tagsName[]", tag));

    start();
    const res = await handleCreateShort(formData);
    done();
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsUploading(false);

    if (res.success) {
      toast.success(res.message);
      onClose();
      reset();
    } else {
      console.log(res.message);
      onClose();
      reset();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("video/")) video.handleSelect(file);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className="relative z-50 overflow-hidden"
    >
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm overflow-hidden"
        aria-hidden="true"
      />
      <div className="overflow-hidden fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <DialogPanel
          transition
          className={`relative w-full max-w-4xl rounded-2xl bg-zinc-900 text-white border
              scroll-ultra-thin border-zinc-800 shadow-2xl duration-300 ease-out
              data-closed:scale-95 data-closed:opacity-0 max-h-[90vh]
              ${isSubmitting ? "overflow-hidden" : "overflow-y-auto"}`}
        >
          {isSubmitting && (
            <div
              className="absolute inset-0 z-20 rounded-2xl
                   flex flex-col items-center justify-center gap-5
                   bg-zinc-900/70 backdrop-blur-sm"
            >
              <div className="w-72 space-y-3 text-center">
                <p className="text-sm font-medium text-white">
                  {progress < 100 ? "Is uploading..." : "Finish!"}
                </p>

                <ProgressBar
                  progress={progress}
                  color="blue"
                  showLabel
                  className="h-2 bg-zinc-700"
                />

                <p className="text-xs text-zinc-400">Don't drop this window</p>
              </div>
            </div>
          )}

          <DialogTitle className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
            <span className="text-lg font-semibold">Upload Short Video</span>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex cursor-pointer items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors duration-200"
            >
              <X size={18} />
            </button>
          </DialogTitle>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6">
              <div
                className={`grid gap-6 transition-[grid-template-columns] duration-300 ease-out ${rightPanelMounted ? "grid-cols-2" : "grid-cols-1"}`}
              >
                <div className="flex items-center">
                  {!video.preview ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => video.inputRef.current?.click()}
                      className={`w-full relative border-2 border-dashed rounded-xl flex flex-col items-center gap-4 justify-center min-h-100 cursor-pointer transition-all duration-200 ${isDragging ? "border-blue-500 bg-blue-500/10" : "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50 hover:scale-[1.01]"} ${errors.fileVideo ? "border-red-500" : ""}`}
                    >
                      <input
                        ref={video.inputRef}
                        type="file"
                        accept="video/*"
                        onChange={video.handleChange}
                        className="hidden"
                      />
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${isDragging ? "bg-blue-500/20 scale-110" : "bg-zinc-800"}`}
                      >
                        <Camera />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-medium">
                          {isDragging
                            ? "Drop your video here"
                            : "Upload a video"}
                        </p>
                        <p className="text-sm text-zinc-400">
                          Drag and drop or click to browse
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className={`animate-fade-in w-full `}>
                      <div className="relative rounded-xl overflow-hidden bg-black w-full h-full">
                        <video
                          ref={videoRef}
                          src={video.preview}
                          controls
                          className="w-full h-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={handleRemoveVideo}
                          className="absolute top-3 right-3 p-2 cursor-pointer rounded-full bg-black/70 backdrop-blur-sm transition-all duration-200 hover:bg-red-500/80 hover:scale-110"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {rightPanelMounted && (
                  <div
                    className={`space-y-4 transition-all duration-350 ease-out ${rightPanelVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"}`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <img
                          src={currentUser?.avatar}
                          className="w-8 h-8 object-cover rounded-2xl"
                        />
                        <div className="text-[12px] font-semibold">
                          {currentUser?.username}
                        </div>
                      </div>

                      <Controller
                        name="caption"
                        control={control}
                        render={({ field }) => (
                          <CaptionField
                            value={field.value}
                            onChange={field.onChange}
                            onMentionsExtracted={setMentions}
                            captionRef={captionRef}
                          />
                        )}
                      />

                      <div className="mt-2">
                        {frames.length > 0 && (
                          <VideoFrameStrip
                            frames={video.frames}
                            videoDuration={videoRef.current?.duration}
                            onSelect={(dataUrl) => {
                              fetch(dataUrl)
                                .then((r) => r.blob())
                                .then((blob) => {
                                  cover.handleSelect(
                                    new File([blob], "cover.jpg", {
                                      type: "image/jpeg",
                                    }),
                                  );
                                });
                            }}
                            onUpload={(file) => cover.handleSelect(file)}
                          />
                        )}
                      </div>

                      <div>
                        <Controller
                          name="tagsName"
                          control={control}
                          render={({ field }) => (
                            <HashTagsField
                              value={field.value || []}
                              onChange={(newValue) => {
                                field.onChange(newValue);
                                setValue("tagsName", newValue, {
                                  shouldValidate: true,
                                });
                              }}
                            />
                          )}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 cursor-pointer font-medium transition-colors duration-200"
                    >
                      Upload Short
                    </button>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ShortPopUp;
