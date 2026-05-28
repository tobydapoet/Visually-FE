import { Dialog, DialogPanel } from "@headlessui/react";
import type React from "react";
import { useMessage } from "../contexts/message.context";
import { useTranslation } from "../hooks/useTranslation";

type MuteOption = "15m" | "1h" | "8h" | "24h" | "forever";

type Props = {
  open: boolean;
  onClose: () => void;
  converstationId: number;
  isMuted: boolean;
};

const MutePopUp: React.FC<Props> = ({
  open,
  onClose,
  converstationId,
  isMuted,
}) => {
  const { muteConversation, unmuteConversation } = useMessage();

  const { t } = useTranslation();

  const MUTE_OPTIONS: { label: string; value: MuteOption }[] = [
    { label: t("mute_15m"), value: "15m" },
    { label: t("mute_1h"), value: "1h" },
    { label: t("mute_8h"), value: "8h" },
    { label: t("mute_24h"), value: "24h" },
    { label: t("mute_forever"), value: "forever" },
  ];

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
              {isMuted ? t("unmute_notifications") : t("mute_notifications")}
            </h2>
          </div>

          {isMuted ? (
            <button
              onClick={handleUnmute}
              className="w-full px-4 py-3 text-center cursor-pointer text-blue-400 hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {t("turn_on_notifications")}
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
              {t("cancel")}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default MutePopUp;
