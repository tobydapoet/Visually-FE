import { createContext, useContext, useState, type ReactNode } from "react";

import type {
  ShortDetailResponse,
  ShortResponsePage,
} from "../types/api/short.type";
import type { ContentStatus } from "../constants/contentStatus.enum";
import type { ContentMangePageResponse } from "../types/api/content.type";
import {
  handleCreateShort,
  handleGetShort,
  handleGetShortByUser,
  handleUpdateShortStatus,
  hanleGetShortByStatus,
} from "../api/short.api";
import { toast } from "sonner";

type ShortContextType = {
  loading: boolean;

  shortDetail: ShortDetailResponse | null;
  shortByUser: ShortResponsePage | null;
  shortByStatus: ContentMangePageResponse | null;

  getShortDetail: (id: number) => Promise<void>;
  getShortByUser: (
    userId: string,
    page?: number,
    size?: number,
  ) => Promise<void>;
  getShortByStatus: (
    status: ContentStatus,
    page?: number,
    size?: number,
    keyword?: string,
  ) => Promise<void>;

  createShort: (formData: FormData) => Promise<boolean>;

  updateShortStatus: (
    shortId: number,
    status: ContentStatus,
    onSuccess?: () => void,
  ) => Promise<boolean>;
};

const ShortContext = createContext<ShortContextType | undefined>(undefined);

export const ShortProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);

  const [shortDetail, setShortDetail] = useState<ShortDetailResponse | null>(
    null,
  );
  const [shortByUser, setShortByUser] = useState<ShortResponsePage | null>(
    null,
  );
  const [shortByStatus, setShortByStatus] =
    useState<ContentMangePageResponse | null>(null);

  const getShortDetail = async (id: number) => {
    try {
      setLoading(true);
      const res = await handleGetShort(id);
      setShortDetail(res);
    } finally {
      setLoading(false);
    }
  };

  const getShortByUser = async (userId: string, page = 1, size = 10) => {
    try {
      setLoading(true);
      const res = await handleGetShortByUser(userId, page, size);
      setShortByUser(res);
    } finally {
      setLoading(false);
    }
  };

  const getShortByStatus = async (
    status: ContentStatus,
    page = 1,
    size = 10,
    keyword?: string,
  ) => {
    try {
      setLoading(true);
      const res = await hanleGetShortByStatus(status, page, size, keyword);
      setShortByStatus(res);
    } finally {
      setLoading(false);
    }
  };

  const createShort = async (formData: FormData): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await handleCreateShort(formData);
      return res.success;
    } finally {
      setLoading(false);
    }
  };

  const updateShortStatus = async (
    shortId: number,
    status: ContentStatus,
    onSuccess?: () => void,
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await handleUpdateShortStatus(shortId, status);

      if (res.success) {
        toast.success(res.data.message);
        onSuccess?.();
        return true;
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShortContext.Provider
      value={{
        loading,
        shortDetail,
        shortByUser,
        shortByStatus,
        getShortDetail,
        getShortByUser,
        getShortByStatus,
        createShort,
        updateShortStatus,
      }}
    >
      {children}
    </ShortContext.Provider>
  );
};

export const useShort = () => {
  const context = useContext(ShortContext);
  if (!context) {
    throw new Error("useShort must be used within ShortProvider");
  }
  return context;
};
