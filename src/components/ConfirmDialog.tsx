import React from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirmClose?: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  onConfirmClose,
  confirmText = "Yes",
  cancelText = "Cancel",
}) => {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/80
          transition-opacity duration-300 ease-out
          data-closed:opacity-0"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-md rounded-xl bg-zinc-900 p-6 text-white
            transition-all duration-300 ease-out
            data-closed:opacity-0 data-closed:scale-95 data-closed:translate-y-2"
        >
          <DialogTitle className="text-lg font-semibold mb-2">
            {title}
          </DialogTitle>

          <p className="text-gray-300 mb-6">{message}</p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 cursor-pointer rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                (onConfirmClose ?? onClose)?.();
              }}
              className="px-4 py-2 rounded-lg cursor-pointer bg-red-600 hover:bg-red-700 transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ConfirmDialog;
