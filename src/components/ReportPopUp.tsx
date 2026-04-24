import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type React from "react";
import { X } from "lucide-react";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { ReportTargetType } from "../constants/interaction.enum";
import { handleReport } from "../api/interaction.api";
import { toast } from "sonner";
import { reasonConfig } from "../constants/ReportReasoConfig";

export const ReportReason = {
  NOT_INTERESTED: "NOT_INTERESTED",
  BULLYING: "BULLYING",
  SELF_HARM: "SELF_HARM",
  VIOLENCE: "VIOLENCE",
  RESTRICTED_ITEMS: "RESTRICTED_ITEMS",
  NUDITY: "NUDITY",
  SPAM: "SPAM",
  FALSE_INFO: "FALSE_INFO",
} as const;
export type ReportReason = (typeof ReportReason)[keyof typeof ReportReason];

type Props = {
  open: boolean;
  onClose: () => void;
  targetId: number;
  targetType: ReportTargetType;
};

const ReportPopUp: React.FC<Props> = ({
  open,
  onClose,
  targetId,
  targetType,
}) => {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(
    null,
  );
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    if (isLoading) return;
    onClose();

    setTimeout(() => {
      setSelectedReason(null);
      setSubmitted(false);
    }, 300);
  };

  const handleSubmit = async () => {
    if (!selectedReason || isLoading) return;

    setIsLoading(true);

    try {
      const res = await handleReport({
        reason: selectedReason,
        targetId,
        targetType,
      });

      if (res.success) {
        setSubmitted(true);
        setIsLoading(false);
      } else {
        toast.error(res.message);
        console.log(res.message);
        setIsLoading(false);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-md rounded-xl bg-zinc-900 text-white duration-300 ease-out data-closed:scale-95 data-closed:opacity-0"
        >
          <DialogTitle className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <div className="text-md font-semibold text-white">
              {submitted ? "Report Sent" : "Report Content"}
            </div>
            {!submitted && !isLoading && (
              <button
                onClick={handleClose}
                className="w-9 h-9 flex items-center cursor-pointer justify-center rounded-full hover:bg-zinc-800 transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </DialogTitle>

          {!submitted ? (
            <>
              <div className="max-h-[60vh] overflow-y-auto">
                {Object.values(ReportReason).map((reason) => {
                  const {
                    label,
                    icon: Icon,
                    description,
                  } = reasonConfig[reason];
                  const isSelected = selectedReason === reason;

                  return (
                    <div
                      key={reason}
                      onClick={() => !isLoading && setSelectedReason(reason)}
                      className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-zinc-800 last:border-b-0 ${
                        isSelected ? "bg-red-900/30" : "hover:bg-zinc-800/50"
                      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Icon
                        size={18}
                        className="text-gray-400 mt-0.5 shrink-0"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">
                          {label}
                        </div>
                        <div className="text-xs text-gray-400">
                          {description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-zinc-800 flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={!selectedReason || isLoading}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 ${
                    !selectedReason || isLoading
                      ? "bg-zinc-700 text-gray-400 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
              <p className="font-medium text-white">
                Thank you for your report
              </p>
              <p className="text-sm text-gray-400 mt-1">
                We'll review it shortly
              </p>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ReportPopUp;
