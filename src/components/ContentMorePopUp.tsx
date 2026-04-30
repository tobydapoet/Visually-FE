import { Dialog, DialogPanel } from "@headlessui/react";
import type React from "react";
import { useState } from "react";
import type { ReportTargetType } from "../constants/interaction.enum";
import { toast } from "sonner";
import ReportPopUp from "./ReportPopUp";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/user.context";

type Props = {
  open: boolean;
  onClose: () => void;
  targetId: number;
  targetType: ReportTargetType;
};

const ContentMorePopUp: React.FC<Props> = ({
  open,
  onClose,
  targetId,
  targetType,
}) => {
  const [isOpenReport, setIsOpenReport] = useState(false);
  const navigate = useNavigate();

  const handleCopyLink = () => {
    const url = `${window.location.origin}/content?contentId=${targetId}&type=${targetType}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
    onClose();
  };

  const { currentUser } = useUser();

  return (
    <>
      <Dialog open={open} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-sm rounded-2xl bg-zinc-900 text-white duration-300 ease-out data-closed:scale-95 data-closed:opacity-0 overflow-hidden"
          >
            <div className="flex flex-col ">
              <button
                onClick={() => {
                  setIsOpenReport(true);
                  onClose();
                }}
                className="px-4 py-3.5  hover:bg-zinc-800 transition-colors text-center cursor-pointer text-red-400 border-b border-zinc-800 text-sm font-medium"
              >
                Report
              </button>
              <button
                onClick={handleCopyLink}
                className="px-4 py-3.5 hover:bg-zinc-800 transition-colors text-center cursor-pointer text-white border-b border-zinc-800 text-sm font-medium"
              >
                Copy link
              </button>
              <button
                onClick={() => {
                  if (currentUser && currentUser.role !== "CLIENT") {
                    navigate(
                      `/manage/content?contentId=${targetId}&type=${targetType}`,
                    );
                  } else {
                    navigate(
                      `/content?contentId=${targetId}&type=${targetType}`,
                    );
                  }
                  onClose();
                }}
                className="px-4 py-3.5 hover:bg-zinc-800 transition-colors text-center cursor-pointer text-white border-b border-zinc-800 text-sm font-medium"
              >
                Go to post
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3.5 hover:bg-zinc-800 transition-colors text-center cursor-pointer text-zinc-400 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <ReportPopUp
        open={isOpenReport}
        onClose={() => setIsOpenReport(false)}
        targetId={targetId}
        targetType={targetType}
      />
    </>
  );
};
export default ContentMorePopUp;
