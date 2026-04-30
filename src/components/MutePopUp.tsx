import { Dialog, DialogPanel } from "@headlessui/react";
import type React from "react";
import { useMessage } from "../contexts/message.context";

type MuteOption = "15m" | "1h" | "8h" | "24h" | "forever";

type Props = {
  open: boolean;
  onClose: () => void;
  converstationId: number;
  isMuted: boolean;
};

const MUTE_OPTIONS: { label: string; value: MuteOption }[] = [
  { label: "15 minutes", value: "15m" },
  { label: "1 hour", value: "1h" },
  { label: "8 hours", value: "8h" },
  { label: "24 hours", value: "24h" },
  { label: "Until I turn it back on", value: "forever" },
];

const MutePopUp: React.FC<Props> = ({
  open,
  onClose,
  converstationId,
  isMuted,
}) => {
  const { muteConversation, unmuteConversation } = useMessage();

  const handleMute = async (option: MuteOption) => {
    await muteConversation(converstationId, option);
    onClose();
  };

  const handleUnmute = async () => {
    await unmuteConversation(converstationId);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <DialogPanel className="w-full max-w-sm rounded-xl bg-zinc-900 text-white overflow-hidden">
          <div className="px-4 py-4 border-b border-zinc-700">
            <h2 className="text-center font-semibold text-base">
              {isMuted ? "Unmute Notifications" : "Mute Notifications"}
            </h2>
          </div>

          {isMuted ? (
            <button
              onClick={handleUnmute}
              className="w-full px-4 py-3 text-center cursor-pointer text-blue-400 hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              Turn on notifications
            </button>
          ) : (
            MUTE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleMute(opt.value)}
                className="w-full cursor-pointer text-center px-4 py-3 hover:bg-zinc-800 transition-colors disabled:opacity-50 border-b border-zinc-800 last:border-0"
              >
                {opt.label}
              </button>
            ))
          )}

          <div className="border-t border-zinc-700">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 text-center cursor-pointer text-red-400 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default MutePopUp;
