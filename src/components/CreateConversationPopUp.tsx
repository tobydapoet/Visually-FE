import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type React from "react";
import { Search, X } from "lucide-react";
import { CircularProgress, InputAdornment, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import {
  CreateConversationSchema,
  type CreateConversationType,
} from "../types/schemas/converstation.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import type { FollowType } from "../types/api/follow.type";
import { handleSearchMutualRelationship } from "../api/follow.api";
import assets from "../assets";
import { useUser } from "../contexts/user.context";
import { useMessage } from "../contexts/message.context";
import { toast } from "sonner";
import { handleCreateConversation } from "../api/message.api";

type Props = {
  open: boolean;
  onClose: () => void;
};

const CreateConversationPopup: React.FC<Props> = ({ open, onClose }) => {
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<CreateConversationType>({
    resolver: zodResolver(CreateConversationSchema),
    mode: "onBlur",
  });

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [follows, setFollows] = useState<FollowType[]>();
  const { currentUser } = useUser();
  const { refetchConversations } = useMessage();

  useEffect(() => {
    const fetchFollow = async () => {
      setLoading(true);
      try {
        const res = await handleSearchMutualRelationship(debouncedSearch);
        setFollows(res.content);
      } finally {
        setLoading(false);
      }
    };

    if (open) fetchFollow();
  }, [open, debouncedSearch]);

  useEffect(() => {
    if (currentUser?.id) {
      setValue("memberIds", [currentUser.id]);
    }
  }, [currentUser]);

  const memberIds = watch("memberIds");

  const toggleUser = (memberId: string) => {
    const current = memberIds ?? [];
    const isSelected = current.includes(memberId);
    const updated = isSelected
      ? current.filter((id) => id !== memberId)
      : [...current, memberId];
    setValue("memberIds", updated, { shouldValidate: true });
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  const onSubmit = async (data: CreateConversationType) => {
    const res = await handleCreateConversation(data);
    if (res.success) {
      toast.success(res.message);
      refetchConversations();
      handleClose();
    } else {
      console.log(res.message);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center">
        <DialogPanel
          transition
          className="w-full max-w-lg rounded-xl bg-zinc-900 p-0
            text-white duration-300 ease-out
            data-closed:scale-95 data-closed:opacity-0"
        >
          <DialogTitle className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
            <div className="text-md font-semibold text-white">Create box</div>
            <button
              onClick={handleClose}
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

            <div className="mt-2">
              <TextField
                fullWidth
                size="small"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                placeholder="Search user"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "8px",
                    "& fieldset": { borderColor: "#3f3f46" },
                    "&:hover fieldset": { borderColor: "#52525b" },
                    "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
                  },
                  "& .MuiInputBase-input": { padding: "8px 12px" },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {loading && search ? (
                        <CircularProgress size={14} sx={{ color: "#71717a" }} />
                      ) : (
                        <Search className="w-4 h-4 text-zinc-500" />
                      )}
                    </InputAdornment>
                  ),
                }}
              />

              <div className="flex flex-col gap-2 mt-2">
                {follows?.map((follow) => {
                  const isSelected = memberIds?.includes(follow.user.id);
                  return (
                    <div
                      key={follow.user.id}
                      onClick={() => toggleUser(follow.user.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-600/20 border border-blue-500"
                          : "hover:bg-zinc-800"
                      }`}
                    >
                      <img
                        className="w-10 h-10 object-cover rounded-full"
                        src={follow.user.avatar || assets.profile}
                      />
                      <div className="flex-1">{follow.user.username}</div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <X size={12} className="text-white rotate-45" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={(memberIds && memberIds.length <= 0) || isSubmitting}
              className="flex-1 px-4 py-2 w-full mt-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} sx={{ color: "white" }} />
                </>
              ) : (
                "Save"
              )}
            </button>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default CreateConversationPopup;
