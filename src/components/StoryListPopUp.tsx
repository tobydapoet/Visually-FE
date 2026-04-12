import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type React from "react";
import { X, CheckCircle } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateStorageSchema,
  type CreateStorageType,
} from "../types/schemas/storage.schema";
import { TextField } from "@mui/material";
import { useUser } from "../contexts/user.context";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef } from "react";
import type { StoryResponse } from "../types/api/story.type";
import { handleCreateStorage, handleGetStoryByUser } from "../api/story.api";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
};

const StoryListPopUp: React.FC<Props> = ({ open, onClose }) => {
  const { currentUser } = useUser();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["stories", currentUser?.id],
      queryFn: async ({ pageParam = 1 }) => {
        if (!currentUser?.id)
          return { content: [], page: 1, total: 0, size: 8 };
        return handleGetStoryByUser(currentUser.id, pageParam, 8, true);
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.page + 1;
        return nextPage * lastPage.size <= lastPage.total
          ? nextPage
          : undefined;
      },
      enabled: !!currentUser?.id,
      refetchOnMount: true,
    });

  const storyList: StoryResponse[] =
    data?.pages.flatMap((page) => page.content) || [];
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    control,
    formState: { errors },
    register,
    handleSubmit,
    watch,
    reset,
    clearErrors,
  } = useForm<CreateStorageType>({
    resolver: zodResolver(CreateStorageSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      storyIds: [],
    },
  });

  const handleOnclose = () => {
    onClose();
    setTimeout(() => {
      clearErrors();
      reset();
    }, 300);
  };

  const selectedIds = watch("storyIds");

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const bottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
    if (bottom && hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const onSubmit = async (data: CreateStorageType) => {
    const res = await handleCreateStorage(data);
    if (res.success) {
      toast.success(res.message);
    } else {
      console.log(res.message);
    }
    handleOnclose();
  };

  return (
    <Dialog open={open} onClose={handleOnclose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center">
        <DialogPanel
          transition
          className="w-full max-w-lg rounded-xl bg-zinc-900 p-0 text-white duration-300 ease-out data-closed:scale-95 data-closed:opacity-0"
        >
          <DialogTitle className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
            <div className="text-md font-semibold text-white">Stories</div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center cursor-pointer justify-center rounded-full hover:bg-zinc-800 transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </DialogTitle>

          <form className="px-4 py-2" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              size="small"
              {...register("name")}
              placeholder="Add name"
              variant="outlined"
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  backgroundColor: "#27272a",
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "#3f3f46" },
                  "&:hover fieldset": { borderColor: "#52525b" },
                  "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "#a1a1aa",
                  opacity: 1,
                  fontSize: "0.875rem",
                },
                "& .MuiFormHelperText-root": { color: "#f87171" },
              }}
            />

            <Controller
              control={control}
              name="storyIds"
              render={({ field }) => (
                <div
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="my-5 max-h-79 overflow-y-auto"
                >
                  <div className="grid grid-cols-4 gap-4 p-1">
                    {storyList.map((story) => {
                      const isSelected = field.value.includes(story.id);

                      const toggleStory = () => {
                        if (isSelected) {
                          field.onChange(
                            field.value.filter((id) => id !== story.id),
                          );
                        } else {
                          field.onChange([...field.value, story.id]);
                        }
                      };

                      return (
                        <div
                          key={story.id}
                          onClick={toggleStory}
                          className="relative cursor-pointer"
                        >
                          <video
                            src={story.mediaUrl}
                            className={`h-40 w-full object-cover rounded-lg transition-all duration-150 ${
                              isSelected
                                ? "ring-2 ring-blue-500 brightness-75"
                                : "hover:brightness-90"
                            }`}
                            muted
                          />
                          {isSelected && (
                            <CheckCircle className="absolute top-1.5 right-1.5 w-5 h-5 text-blue-400 fill-blue-900" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {isFetchingNextPage && (
                    <div className="text-center text-gray-400 py-2">
                      Loading more...
                    </div>
                  )}
                </div>
              )}
            />

            {errors.storyIds && (
              <p className="text-red-400 text-xs mb-2 -mt-3">
                {errors.storyIds.message}
              </p>
            )}

            {selectedIds?.length > 0 && (
              <p className="text-zinc-400 text-xs mb-2">
                {selectedIds.length} story selected
              </p>
            )}

            <button
              type="submit"
              className="w-full cursor-pointer py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default StoryListPopUp;
