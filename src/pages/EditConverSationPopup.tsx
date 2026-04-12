import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type React from "react";
import { X, Camera } from "lucide-react";
import { useMessage } from "../contexts/message.context";
import assets from "../assets";
import { TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import {
  UpdateConversationSchema,
  type UpdateConversationType,
} from "../types/schemas/converstation.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { handleUpdateConversation } from "../api/message.api";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
};

const EditConversationPopUp: React.FC<Props> = ({ open, onClose }) => {
  const { selectedConversation, refetchConversations, loadConversationById } =
    useMessage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    reset,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateConversationType>({
    resolver: zodResolver(UpdateConversationSchema),
    mode: "onBlur",
    defaultValues: {
      name: selectedConversation?.name || "",
    },
  });

  if (!selectedConversation) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValue("file", file, { shouldValidate: true });
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setPreviewUrl(null);
      reset();
    }, 300);
  };

  const onSubmit = async (data: UpdateConversationType) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.file) formData.append("file", data.file);

      const res = await handleUpdateConversation(
        selectedConversation.id,
        formData,
      );
      if (res.success) {
        toast.success(res.message);
        refetchConversations();
        loadConversationById(selectedConversation.id);
        handleClose();
      } else {
        console.log(res.message);
      }
    } catch (err) {
      console.error("Failed to update conversation:", err);
    } finally {
      setIsSubmitting(false);
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
            <div className="text-md font-semibold text-white">
              Edit Conversation
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 flex items-center cursor-pointer justify-center rounded-full hover:bg-zinc-800 transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </DialogTitle>

          <form
            className="flex flex-col items-center p-4 gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="relative group">
              <img
                className="rounded-full w-32 h-32 object-cover"
                src={
                  previewUrl ||
                  selectedConversation.mediaUrl ||
                  assets.white_logo
                }
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center
                  opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="w-full">
              <TextField
                fullWidth
                {...register("name")}
                label="Name"
                variant="outlined"
                size="medium"
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{
                  "& .MuiInputLabel-root": { color: "#9ca3af" },
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "#4b5563" },
                    "&:hover fieldset": { borderColor: "#60a5fa" },
                  },
                  "& .MuiFormHelperText-root": { color: "#f87171" },
                }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </div>

            <div className="flex gap-2 w-full">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default EditConversationPopUp;
