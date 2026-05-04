import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X, ImagePlus, Trash2 } from "lucide-react";
import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "../contexts/user.context";
import HashTagsField from "./HashTagField";
import { CaptionField } from "./CaptionFiled";
import type { MentionItem } from "../types/api/mention.type";
import { useProgressBar } from "../hooks/useProgressBar";
import { ProgressBar } from "./ProgressBar";
import { useMultiFileUpload } from "../hooks/useMultifileUpload";
import {
  CreatePostSchema,
  type CreatePostType,
} from "../types/schemas/post.schema";
import { handleCreatePost } from "../api/post.api";
import { toast } from "sonner";
import assets from "../assets";

type Props = {
  open: boolean;
  onClose: () => void;
};

const PostPopUp: React.FC<Props> = ({ open, onClose }) => {
  const [rightPanelMounted, setRightPanelMounted] = useState(false);
  const [rightPanelVisible, setRightPanelVisible] = useState(false);
  const [mentions, setMentions] = useState<MentionItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const captionRef = useRef<HTMLDivElement | null>(null);

  const { currentUser } = useUser();
  const {
    progress,
    start,
    done,
    reset: resetProgress,
  } = useProgressBar({ estimatedMs: 8000 });

  const {
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostType>({ resolver: zodResolver(CreatePostSchema) });

  const {
    entries,
    inputRef,
    handleChange,
    handleDrop: onDrop,
    handleRemove,
    handleRemoveAll,
  } = useMultiFileUpload({
    accept: "image/*,video/*",
    maxFiles: 5,
    maxSizeMB: 100,
    maxVideoDurationSec: 60,
    onChange: (files) => {
      setValue("files", files, { shouldValidate: files.length > 0 });
    },
  });

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    onDrop(e);
  };

  useEffect(() => {
    if (entries.length > 0) {
      setRightPanelMounted(true);
      const t = setTimeout(() => setRightPanelVisible(true), 30);
      return () => clearTimeout(t);
    } else {
      setRightPanelVisible(false);
      setActiveIndex(0);
      const t = setTimeout(() => setRightPanelMounted(false), 350);
      return () => clearTimeout(t);
    }
  }, [entries.length]);

  useEffect(() => {
    if (activeIndex >= entries.length && entries.length > 0) {
      setActiveIndex(entries.length - 1);
    }
  }, [entries.length]);

  useEffect(() => {
    if (!open) {
      reset();
      handleRemoveAll();
      resetProgress();
      setIsUploading(false);
      setActiveIndex(0);
    }
  }, [open]);

  const handleClose = () => {
    if (isUploading || isSubmitting) return;
    reset();
    handleRemoveAll();
    resetProgress();
    setIsUploading(false);
    onClose();
  };

  const onSubmit = async (data: CreatePostType) => {
    const payload = { ...data, mentions };
    const formData = new FormData();

    if (payload.caption) formData.append("caption", payload.caption);
    payload.files.forEach((f) => formData.append("files", f));
    if (payload.mentions?.length)
      formData.append("mentions", JSON.stringify(payload.mentions));
    payload.tagsName?.forEach((tag) => formData.append("tagsName[]", tag));

    setIsUploading(true);
    start();
    const res = await handleCreatePost(formData);
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    done();
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsUploading(false);
    if (res.success) {
      toast.success(res.message);
      onClose();
      reset();
    } else {
      console.log(res.message);
    }
  };

  const activeEntry = entries[activeIndex];

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <DialogPanel
          transition
          className={`relative w-full max-w-4xl rounded-2xl bg-zinc-900 text-white border border-zinc-800 shadow-2xl duration-300 ease-out data-closed:scale-95 data-closed:opacity-0 max-h-[90vh] ${isUploading ? "overflow-hidden" : "overflow-y-auto"}`}
        >
          {isUploading && (
            <div className="absolute inset-0 z-20 rounded-2xl flex flex-col items-center justify-center gap-5 bg-zinc-900/70 backdrop-blur-sm">
              <div className="w-72 space-y-3 text-center">
                <p className="text-sm font-medium text-white">
                  {progress < 100 ? "Uploading..." : "Done!"}
                </p>
                <ProgressBar
                  progress={progress}
                  color="blue"
                  showLabel
                  className="h-2 bg-zinc-700"
                />
                <p className="text-xs text-zinc-400">
                  Please don't close this window
                </p>
              </div>
            </div>
          )}

          <DialogTitle className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
            <span className="text-lg font-semibold">Create Post</span>
            <button
              onClick={handleClose}
              disabled={isUploading || isSubmitting}
              className="w-8 h-8 flex cursor-pointer items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <X size={18} />
            </button>
          </DialogTitle>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6">
              <div
                className={`grid gap-6 transition-[grid-template-columns] duration-300 ease-out ${rightPanelMounted ? "grid-cols-2" : "grid-cols-1"}`}
              >
                <div className="flex flex-col gap-3">
                  {entries.length === 0 ? (
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => inputRef.current?.click()}
                      className={`w-full border-2 border-dashed rounded-xl flex flex-col items-center gap-4 justify-center min-h-80 cursor-pointer transition-all duration-200 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50 hover:scale-[1.01] ${errors.files ? "border-red-500" : ""}`}
                    >
                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleChange}
                        className="hidden"
                      />
                      <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                        <ImagePlus size={24} className="text-zinc-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-medium">
                          Upload photos & videos
                        </p>
                        <p className="text-sm text-zinc-400">
                          Drag and drop or click to browse
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          Up to 10 files · 100MB each
                        </p>
                      </div>
                      {errors.files && (
                        <p className="text-red-500 text-sm">
                          {errors.files.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="relative rounded-xl overflow-hidden bg-black aspect-square w-full">
                        {activeEntry?.file.type.startsWith("video/") ? (
                          <video
                            key={activeEntry.id}
                            src={activeEntry.preview}
                            controls
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <img
                            key={activeEntry?.id}
                            src={activeEntry?.preview}
                            className="w-full h-full object-contain"
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemove(activeEntry.id)}
                          className="absolute top-3 right-3 p-2 cursor-pointer rounded-full bg-black/70 backdrop-blur-sm transition-all duration-200 hover:bg-red-500/80 hover:scale-110"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-xs px-2 py-1 rounded-full">
                          {activeIndex + 1} / {entries.length}
                        </div>
                      </div>

                      <div className="flex gap-2 overflow-x-auto pb-1 scroll-ultra-thin">
                        {entries.map((entry, i) => (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() => setActiveIndex(i)}
                            className={`relative shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === activeIndex ? "border-blue-500" : "border-transparent opacity-60 hover:opacity-100"}`}
                          >
                            {entry.file.type.startsWith("video/") ? (
                              <video
                                src={entry.preview}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={entry.preview}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </button>
                        ))}

                        {entries.length < 10 && (
                          <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="shrink-0 w-14 h-14 rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center hover:border-zinc-500 transition-colors"
                          >
                            <input
                              ref={inputRef}
                              type="file"
                              accept="image/*,video/*"
                              multiple
                              onChange={handleChange}
                              className="hidden"
                            />
                            <ImagePlus size={16} className="text-zinc-500" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {rightPanelMounted && (
                  <div
                    className={`space-y-4 transition-all duration-350 ease-out ${rightPanelVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"}`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={currentUser?.avatar || assets.profile}
                        className="w-8 h-8 object-cover rounded-2xl"
                      />
                      <span className="text-[12px] font-semibold">
                        {currentUser?.username}
                      </span>
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

                    <Controller
                      name="tagsName"
                      control={control}
                      render={({ field }) => (
                        <HashTagsField
                          value={field.value || []}
                          onChange={(val) => {
                            field.onChange(val);
                            setValue("tagsName", val, { shouldValidate: true });
                          }}
                        />
                      )}
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting || isUploading}
                      className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Uploading..." : "Share Post"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default PostPopUp;
