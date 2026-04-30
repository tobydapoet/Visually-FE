import { useEffect } from "react";
import { getSocket } from "../utils/socket";

type AdPaymentEvent = {
  success: boolean;
  message: string;
  userId?: number;
};

type Props = {
  userId: string | null;
  onSuccess?: (event: AdPaymentEvent) => void;
  onFailed?: (event: AdPaymentEvent) => void;
};

export const useAdPayment = ({ userId, onSuccess, onFailed }: Props) => {
  useEffect(() => {
    if (!userId) return;

    const socket = getSocket(userId);

    const handler = (event: AdPaymentEvent) => {
      console.log("FE received ad_register:", JSON.stringify(event));
      if (event.success) {
        onSuccess?.(event);
      } else {
        onFailed?.(event);
      }
    };

    socket.on("ad_register", handler);

    return () => {
      socket.off("ad_register", handler);
    };
  }, [userId]);
};
