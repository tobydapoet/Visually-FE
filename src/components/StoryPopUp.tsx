import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X, ImagePlus } from "lucide-react";
import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stage, Layer, Transformer, Image as KonvaImage } from "react-konva";
import Konva from "konva";

import { StoryMusicCard } from "./StoryMusicCard";
import { toast } from "sonner";
import type { MusicResponse } from "../types/api/music.type";
import {
  CreateStorySchema,
  type CreateStoryType,
} from "../types/schemas/story.schema";
import { useStoryMention } from "../hooks/useStoryMention";
import { useFileUpload } from "../hooks/useFileUpload";
import { useProgressBar } from "../hooks/useProgressBar";
import { ProgressBar } from "./ProgressBar";
import { StoryToolbar } from "./StoryToolBar";
import { StoryMusicPicker } from "./StoryMusicPicker";
import { handleCreateStory } from "../api/story.api";

type Props = { open: boolean; onClose: () => void };

const STAGE_W = 300;
const STAGE_H = 450;

const StoryPopUp: React.FC<Props> = ({ open, onClose }) => {
  const [activePanel, setActivePanel] = useState<"text" | null>(null);
  const [rightPanelMounted, setRightPanelMounted] = useState(false);
  const [rightPanelVisible, setRightPanelVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [openMusicDialog, setOpenMusicDialog] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<MusicResponse>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [musicStartTime, setMusicStartTime] = useState(0);

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const {
    progress,
    start,
    done,
    reset: resetProgress,
  } = useProgressBar({ estimatedMs: 5000 });
  const {
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateStoryType>({
    resolver: zodResolver(CreateStorySchema),
  });

  const mention = useStoryMention();

  const file = useFileUpload({
    accept: "image/*,video/*",
    onChange: (f) =>
      setValue("file", f ?? (undefined as any), { shouldValidate: !!f }),
  });

  useEffect(() => {
    if (file.file) {
      setRightPanelMounted(true);
      const t = setTimeout(() => setRightPanelVisible(true), 30);
      return () => clearTimeout(t);
    } else {
      setRightPanelVisible(false);
      const t = setTimeout(() => setRightPanelMounted(false), 350);
      return () => clearTimeout(t);
    }
  }, [file.file]);

  useEffect(() => {
    if (!file.preview || !file.file?.type.startsWith("image/")) {
      setBgImage(null);
      return;
    }
    const img = new window.Image();
    img.src = file.preview;
    img.onload = () => setBgImage(img);
  }, [file.preview]);

  useEffect(() => {
    if (!open) {
      reset();
      file.handleRemove();
      mention.reset();
      setSelectedId(null);
      setBgImage(null);
      setActivePanel(null);
      setSelectedMusic(undefined);
      setOpenMusicDialog(false);
      resetProgress();
      setIsUploading(false);
    }
  }, [open]);

  const handleClose = () => {
    if (isUploading || isSubmitting || activePanel) return;
    reset();
    file.handleRemove();
    mention.reset();
    setSelectedId(null);
    setBgImage(null);
    setActivePanel(null);
    setSelectedMusic(undefined);
    resetProgress();
    onClose();
  };

  const handleRemoveFile = () => {
    file.handleRemove();
    setSelectedId(null);
    setBgImage(null);
    setActivePanel(null);
    setSelectedMusic(undefined);
    setOpenMusicDialog(false);
  };

  const onSubmit = async (data: CreateStoryType) => {
    const formData = new FormData();
    formData.append("file", data.file);
    if (selectedMusic) {
      formData.append("musicId", String(selectedMusic.id));
      formData.append("startMusicTime", String(Math.floor(musicStartTime)));
      setValue("musicId", selectedMusic.id);
      setValue("startMusicTime", Math.floor(musicStartTime));
    }

    setIsUploading(true);
    start();
    const res = await handleCreateStory(formData);
    done();
    await new Promise((r) => setTimeout(r, 600));
    setIsUploading(false);
    if (res.success) {
      toast.success(res.message);
      setIsUploading(false);
      onClose();
      reset();
    } else {
      console.log(res.message);
      setIsUploading(false);
      onClose();
      reset();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <DialogPanel
          transition
          className={`relative w-fit rounded-2xl bg-zinc-900 text-white border border-zinc-800 shadow-2xl duration-300 ease-out data-closed:scale-95 data-closed:opacity-0 max-h-[90vh] ${isUploading ? "overflow-hidden" : "overflow-y-auto"}`}
        >
          {isUploading && (
            <div className="absolute inset-0 z-30 rounded-2xl flex flex-col items-center justify-center gap-5 bg-zinc-900/70 backdrop-blur-sm">
              <div className="w-72 space-y-3 text-center">
                <p className="text-sm font-medium">
                  {progress < 100 ? "Uploading story..." : "Done!"}
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
            <span className="text-lg font-semibold">Create Story</span>
            <button
              onClick={handleClose}
              disabled={isUploading || isSubmitting}
              className="w-8 h-8 flex cursor-pointer items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <X size={18} />
            </button>
          </DialogTitle>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 flex flex-row">
              <div className="flex flex-col gap-3 items-center">
                {!file.preview ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files?.[0];
                      if (f) file.handleSelect(f);
                    }}
                    onClick={() => file.inputRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl flex flex-col items-center gap-4 justify-center min-h-96 cursor-pointer transition-all duration-200 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50 hover:scale-[1.01] ${errors.file ? "border-red-500" : ""}`}
                  >
                    <input
                      ref={file.inputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={file.handleChange}
                      className="hidden"
                    />
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                      <ImagePlus size={24} className="text-zinc-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-medium">
                        Upload photo or video
                      </p>
                      <p className="text-sm text-zinc-400">
                        Drag and drop or click to browse
                      </p>
                    </div>
                    {errors.file && (
                      <p className="text-red-400 text-sm">
                        {errors.file.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 w-full items-center animate-fade-in">
                    <div
                      className="relative rounded-xl overflow-hidden bg-black"
                      style={{ width: STAGE_W, height: STAGE_H }}
                    >
                      {file.file?.type.startsWith("video/") && (
                        <video
                          src={file.preview}
                          autoPlay
                          muted
                          loop
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}

                      <Stage
                        ref={stageRef}
                        width={STAGE_W}
                        height={STAGE_H}
                        onMouseDown={(e) => {
                          if (e.target === e.target.getStage())
                            setSelectedId(null);
                        }}
                      >
                        <Layer>
                          {bgImage && (
                            <KonvaImage
                              image={bgImage}
                              width={STAGE_W}
                              height={STAGE_H}
                              listening={false}
                            />
                          )}

                          <Transformer
                            ref={transformerRef}
                            boundBoxFunc={(old, nb) =>
                              nb.width < 20 ? old : nb
                            }
                          />
                        </Layer>
                      </Stage>

                      <StoryToolbar
                        onText={() => setActivePanel("text")}
                        onMusic={() => setOpenMusicDialog((v) => !v)}
                        onRemove={handleRemoveFile}
                      />
                    </div>

                    {selectedMusic && (
                      <StoryMusicCard
                        music={selectedMusic}
                        onTimeChange={setMusicStartTime}
                      />
                    )}

                    {rightPanelMounted && (
                      <div
                        className={`w-full transition-all duration-300 ease-out ${rightPanelVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"}`}
                      >
                        <button
                          type="submit"
                          disabled={isSubmitting || isUploading}
                          className="w-full py-2 rounded-lg cursor-pointer bg-blue-600 hover:bg-blue-700 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Share Story
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {openMusicDialog && (
                <StoryMusicPicker
                  isOpen={openMusicDialog}
                  onClose={() => setOpenMusicDialog(false)}
                  onSelect={(music) => {
                    setSelectedMusic(music);
                    setOpenMusicDialog(false);
                  }}
                />
              )}
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default StoryPopUp;
