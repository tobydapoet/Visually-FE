import { Dialog, DialogPanel } from "@headlessui/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ShortDetailResponse } from "../types/api/short.type";
import type { PostDetailResponse } from "../types/api/post.type";
import { handleGetPost } from "../api/post.api";
import { handleGetShort } from "../api/short.api";
import { handleUpdateContent } from "../api/content.api";
import { X, Check } from "lucide-react";
import assets from "../assets";
import {
  UpdateContentSchema,
  type UpdateContentType,
} from "../types/schemas/content.schema";
import HashTagsField from "./HashTagField";
import { Chip, Box } from "@mui/material";
import { CaptionField } from "./CaptionFiled";
import { toast } from "sonner";

type Tag = { id: number; name: string };
type Mention = { userId: string; username: string };

type Props = {
  open: boolean;
  onClose: () => void;
  contentId: number;
  type: "POST" | "SHORT";
  onSuccess?: () => void;
};

const EditContentPopUp: React.FC<Props> = ({
  open,
  onClose,
  contentId,
  type,
  onSuccess,
}) => {
  const [currentContent, setCurrentContent] = useState<
    PostDetailResponse | ShortDetailResponse | null
  >(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [existingTags, setExistingTags] = useState<Tag[]>([]);
  const [tagsIdRemove, setTagsIdRemove] = useState<number[]>([]);
  const [newTags, setNewTags] = useState<string[]>([]);

  const [existingMentions, setExistingMentions] = useState<Mention[]>([]);
  const captionTouchedRef = useRef(false);

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateContentType>({
    resolver: zodResolver(UpdateContentSchema),
    defaultValues: {
      caption: "",
      tagsNameAdd: [],
      tagsIdRemove: [],
      mentionAdd: [],
      mentionUserIdRemove: [],
    },
  });

  const resetAll = () => {
    setExistingTags([]);
    setTagsIdRemove([]);
    setNewTags([]);
    setExistingMentions([]);
    setSubmitError(null);
    captionTouchedRef.current = false;
    reset();
  };

  const handleOnClose = () => {
    onClose();
    resetAll();
  };

  useEffect(() => {
    const fetchContent = async () => {
      if (!open) {
        setCurrentContent(null);
        return;
      }
      let res: PostDetailResponse | ShortDetailResponse | null = null;
      if (type === "POST") res = await handleGetPost(contentId);
      else if (type === "SHORT") res = await handleGetShort(contentId);
      setCurrentContent(res);
    };
    fetchContent();
  }, [open, contentId, type]);

  useEffect(() => {
    if (!currentContent) return;
    setExistingTags(currentContent.tags ?? []);
    setExistingMentions(currentContent.mentions ?? []);
    setTagsIdRemove([]);
    setNewTags([]);
    reset({
      caption: currentContent.caption ?? "",
      tagsNameAdd: [],
      tagsIdRemove: [],
      mentionAdd: [],
      mentionUserIdRemove: [],
    });
  }, [currentContent, reset]);

  const toggleTagRemove = (tagId: number) => {
    const updated = tagsIdRemove.includes(tagId)
      ? tagsIdRemove.filter((id) => id !== tagId)
      : [...tagsIdRemove, tagId];
    setTagsIdRemove(updated);
    setValue("tagsIdRemove", updated);
  };

  const onSubmit = async (data: UpdateContentType) => {
    setSubmitError(null);

    const result = await handleUpdateContent(data, contentId, type);
    if (!result.success) {
      setSubmitError(
        typeof result.message === "string"
          ? result.message
          : ((result.message as any)?.message ?? "An error occurred"),
      );
    } else {
      toast.success(result.message);
      handleOnClose();
      onSuccess?.();
    }
  };

  if (!currentContent) return null;

  return (
    <Dialog open={open} onClose={handleOnClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="relative w-fit bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
          <button
            onClick={handleOnClose}
            className="absolute cursor-pointer top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-100 flex flex-col bg-zinc-900 overflow-y-auto">
              {/* Header */}
              <div className="px-4 pt-4 pb-2 flex items-center gap-3">
                <img
                  src={currentContent.avatarUrl || assets.profile}
                  alt={currentContent.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <p className="font-semibold text-white flex-1">
                  {currentContent.username}
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="px-4 py-3 flex flex-col gap-5"
              >
                {/* Caption */}
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-400 text-xs">Caption</label>
                  <CaptionField
                    initialValue={currentContent.caption ?? ""}
                    initialMentions={currentContent.mentions ?? []}
                    onChange={(val) => setValue("caption", val)}
                    onMentionsExtracted={(mentions) => {
                      const currentUserIds = mentions.map((m) => m.userId);

                      const autoRemove = existingMentions
                        .filter((m) => !currentUserIds.includes(m.userId))
                        .map((m) => m.userId);

                      setValue("mentionUserIdRemove", autoRemove);

                      const existingUserIds = existingMentions.map(
                        (m) => m.userId,
                      );
                      const brandNew = mentions.filter(
                        (m) => !existingUserIds.includes(m.userId),
                      );
                      setValue(
                        "mentionAdd",
                        brandNew.map((m) => ({
                          userId: m.userId,
                          username: m.username,
                        })),
                      );
                    }}
                  />
                  {errors.caption && (
                    <p className="text-red-400 text-xs">
                      {errors.caption.message}
                    </p>
                  )}
                </div>

                {existingTags.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <label className="text-zinc-400 text-xs">
                      Tags
                      {tagsIdRemove.length > 0 && (
                        <span className="text-red-400 ml-1">
                          ({tagsIdRemove.length} will be removed)
                        </span>
                      )}
                    </label>
                    <Box className="flex flex-wrap gap-2">
                      {existingTags.map((tag) => {
                        const isMarked = tagsIdRemove.includes(tag.id);
                        return (
                          <Chip
                            key={tag.id}
                            label={`#${tag.name}`}
                            onClick={() => toggleTagRemove(tag.id)}
                            onDelete={
                              isMarked
                                ? () => toggleTagRemove(tag.id)
                                : undefined
                            }
                            sx={{
                              backgroundColor: isMarked ? "#7f1d1d" : "#3f3f46",
                              color: isMarked ? "#fca5a5" : "white",
                              fontSize: "0.75rem",
                              border: isMarked
                                ? "1px solid #ef4444"
                                : "1px solid transparent",
                              transition: "all 0.2s",
                              cursor: "pointer",
                              "& .MuiChip-deleteIcon": { color: "#fca5a5" },
                              "&:hover": {
                                backgroundColor: isMarked
                                  ? "#991b1b"
                                  : "#52525b",
                              },
                            }}
                          />
                        );
                      })}
                    </Box>
                  </div>
                )}

                {/* New tags — thêm mới */}
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-400 text-xs">Add new tags</label>
                  <HashTagsField
                    value={newTags}
                    onChange={(tags) => {
                      setNewTags(tags);
                      setValue("tagsNameAdd", tags);
                    }}
                  />
                </div>

                {submitError && (
                  <p className="text-red-400 text-sm">{submitError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {isSubmitting ? "Saving..." : "Save changes"}
                </button>
              </form>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default EditContentPopUp;
