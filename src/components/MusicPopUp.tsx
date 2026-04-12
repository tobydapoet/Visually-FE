import React, { useRef, useState, useEffect } from "react";
import type { MusicResponse } from "../types/api/music.type";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X, Upload, Music, Image, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  MusicCreateSchema,
  MusicUpdateSchema,
  type MusicCreateSchemaType,
  type MusicUpdateSchemaType,
} from "../types/schemas/music.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleCreateMusic, handleUpdateMusic } from "../api/media.api";
import { toast } from "sonner";
import { useMusic } from "../contexts/music.context";
import { useSearchParams } from "react-router-dom";
import { MusicStatus } from "../constants/music.enum";

type Props = {
  open: boolean;
  onClose: () => void;
  music?: MusicResponse;
};

const MusicPopUp: React.FC<Props> = ({ open, onClose, music }) => {
  const [submitting, setSubmitting] = useState(false);
  const [audioPreview, setAudioPreview] = useState<string | null>(
    music?.url ?? null,
  );
  const [imgPreview, setImgPreview] = useState<string | null>(
    music?.img ?? null,
  );
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const [searchParams] = useSearchParams();

  const currentPage = Number(searchParams.get("page") ?? 0);
  const currentSearch = searchParams.get("search") ?? "";
  const statusFilter =
    (searchParams.get("status") as MusicStatus) ?? MusicStatus.PENDING;
  const { getMusicList } = useMusic();

  const isEdit = !!music;

  const handleOnclose = () => {
    onClose();
    reset({
      title: music?.title ?? "",
      artist: music?.artist ?? "",
    });
    setAudioPreview(music?.url ?? null);
    setImgPreview(music?.img ?? null);
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<MusicCreateSchemaType | MusicUpdateSchemaType>({
    resolver: zodResolver(isEdit ? MusicUpdateSchema : MusicCreateSchema),
    mode: "onBlur",
    defaultValues: {
      title: music?.title ?? "",
      artist: music?.artist ?? "",
    },
  });

  useEffect(() => {
    reset({
      title: music?.title ?? "",
      artist: music?.artist ?? "",
    });
    setAudioPreview(music?.url ?? null);
    setImgPreview(music?.img ?? null);
  }, [music, reset]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "url" | "img",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValue(field, file as any, { shouldValidate: true });
    const url = URL.createObjectURL(file);
    field === "url" ? setAudioPreview(url) : setImgPreview(url);
  };

  const onFormSubmit = async (
    data: MusicCreateSchemaType | MusicUpdateSchemaType,
  ) => {
    try {
      setSubmitting(true);

      let response;

      if (music) {
        response = await handleUpdateMusic(
          music.id,
          data as MusicUpdateSchemaType,
        );
      } else {
        response = await handleCreateMusic(data as MusicCreateSchemaType);
      }

      if (response) {
        toast.success(response.message);
        await getMusicList(currentPage, 20, statusFilter, currentSearch);
        handleOnclose();
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioPreview && audioPreview !== music?.url) {
        URL.revokeObjectURL(audioPreview);
      }
      if (imgPreview && imgPreview !== music?.img) {
        URL.revokeObjectURL(imgPreview);
      }
    };
  }, []);

  return (
    <Dialog
      open={open}
      onClose={() => handleOnclose()}
      className="relative z-50"
    >
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-2xl rounded-2xl bg-zinc-900 text-white
            border border-zinc-800 shadow-2xl
            duration-300 ease-out data-closed:scale-95 data-closed:opacity-0"
        >
          <DialogTitle className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <span className="text-lg font-semibold">
              {isEdit ? "Edit Music" : "Add New Music"}
            </span>
            <button
              onClick={() => handleOnclose()}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </DialogTitle>

          <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                {...register("title")}
                type="text"
                placeholder="Enter song title"
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-white placeholder:text-zinc-500
                  ${
                    errors.title
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-zinc-700 focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
              />
              {errors.title && (
                <p className="text-xs text-red-400 mt-1">
                  {errors.title.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                Artist <span className="text-red-400">*</span>
              </label>
              <input
                {...register("artist")}
                type="text"
                placeholder="Enter artist name"
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-white placeholder:text-zinc-500
                  ${
                    errors.artist
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-zinc-700 focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
              />
              {errors.artist && (
                <p className="text-xs text-red-400 mt-1">
                  {errors.artist.message as string}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Cover Image
                </label>
                <div
                  onClick={() => imgInputRef.current?.click()}
                  className="relative w-40 aspect-square rounded-lg border-2 border-dashed border-zinc-700 hover:border-indigo-500 transition-colors cursor-pointer overflow-hidden bg-zinc-800/50"
                >
                  {imgPreview ? (
                    <img
                      src={imgPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-500">
                      <Image size={32} />
                      <span className="text-xs">Upload image</span>
                    </div>
                  )}
                  <input
                    ref={imgInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "img")}
                  />
                </div>
                {errors.img && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.img.message as string}
                  </p>
                )}
              </div>

              <div className="w-full h-40">
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Audio File <span className="text-red-400">*</span>
                </label>
                <div
                  onClick={() => audioInputRef.current?.click()}
                  className="relative w-full h-40 aspect-square rounded-lg border-2 border-dashed border-zinc-700 hover:border-indigo-500 transition-colors cursor-pointer bg-zinc-800/50 flex flex-col items-center justify-center p-4"
                >
                  {audioPreview ? (
                    <div className="w-full space-y-3">
                      <audio controls className="w-full" src={audioPreview}>
                        Your browser does not support the audio element.
                      </audio>
                      <p className="text-xs text-zinc-500 text-center">
                        Click to change
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
                      <Music size={32} />
                      <span className="text-xs">Upload audio</span>
                      <span className="text-xs text-zinc-600">
                        MP3, WAV, etc
                      </span>
                    </div>
                  )}
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "url")}
                  />
                </div>
                {errors.url && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.url.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => handleOnclose()}
                disabled={submitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>{isEdit ? "Update" : "Create"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default MusicPopUp;
