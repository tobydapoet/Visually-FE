import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type React from "react";
import { X, Check } from "lucide-react";
import { useEffect, useState } from "react";
import type { StoryStorageResponse } from "../types/api/storage.type";
import { useUser } from "../contexts/user.context";
import { handleAddToStorage, handleGetStorageByUser } from "../api/story.api";
import { toast } from "sonner";
import { CircularProgress } from "@mui/material";
import { useStory } from "../contexts/story.context";

type Props = {
  open: boolean;
  onClose: () => void;
  storyId: number;
};

const StoragePopUp: React.FC<Props> = ({ open, onClose, storyId }) => {
  const [storageList, setStorageList] = useState<StoryStorageResponse[]>([]);
  const [selectedStorageId, setSelectedStorageId] = useState<number | null>(
    null,
  );
  const { updateCurrentStory } = useStory();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useUser();

  useEffect(() => {
    const fetchStorage = async () => {
      if (!currentUser || !open) return;

      setIsLoading(true);
      try {
        const res = await handleGetStorageByUser(currentUser.id);
        if (res) setStorageList(res);
      } catch (error) {
        console.error("Failed to fetch storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStorage();
  }, [open, currentUser]);

  useEffect(() => {
    if (open) {
      setSelectedStorageId(null);
    }
  }, [open]);

  const onSubmit = async () => {
    if (!selectedStorageId) {
      toast.warning("Select hight first!!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await handleAddToStorage(storyId, selectedStorageId);
      if (res.success) {
        toast.success(res.message);
        updateCurrentStory((s) => ({ ...s, storageId: selectedStorageId }));
        onClose();
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-lg rounded-xl bg-zinc-900 text-white duration-300 ease-out data-closed:scale-95 data-closed:opacity-0"
        >
          <DialogTitle className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <div className="text-md font-semibold text-white">
              Save to hightlight
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-9 h-9 flex items-center cursor-pointer justify-center rounded-full hover:bg-zinc-800 transition-colors text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-6 h-6" />
            </button>
          </DialogTitle>

          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <CircularProgress sx={{ color: "#3b82f6" }} size={40} />
              </div>
            ) : storageList.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">You don't have hightlight</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-100 overflow-y-auto custom-scrollbar">
                  {storageList.map((storage) => (
                    <div
                      key={storage.id}
                      className="flex flex-col items-center group cursor-pointer"
                      onClick={() => setSelectedStorageId(storage.id)}
                    >
                      <div className="relative w-fit">
                        <div
                          className={`rounded-full p-0.5 transition-all duration-300 ${
                            selectedStorageId === storage.id
                              ? "bg-linear-to-tr from-blue-400 via-cyan-500 to-indigo-600"
                              : "bg-transparent group-hover:bg-linear-to-tr group-hover:from-gray-600 group-hover:via-gray-500 group-hover:to-gray-600"
                          }`}
                        >
                          <div className="relative rounded-full bg-gray-900 transition-all duration-300 group-hover:scale-105">
                            <video
                              src={storage.url}
                              className="w-20 h-20 object-cover rounded-full"
                              muted
                              playsInline
                            />
                            {selectedStorageId === storage.id && (
                              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                <Check className="w-8 h-8 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-sm text-gray-400 mt-2 group-hover:text-blue-400 transition-colors line-clamp-1 max-w-20">
                        {storage.name}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={onSubmit}
                    disabled={!selectedStorageId || isSubmitting}
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <CircularProgress size={20} sx={{ color: "white" }} />
                      </>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default StoragePopUp;
