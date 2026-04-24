import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { handleGetAdByUser, handleUpdateAdStatus } from "../api/ad.api";
import type { AdResponse } from "../types/api/ad.type";
import { useUser } from "./user.context";
import { AdStatus } from "../constants/adStatus.enum";

type AdContextType = {
  ads: AdResponse[];
  loading: boolean;
  totalPages: number;
  currentPage: number;
  selectedAd: AdResponse | null;
  isOpenAdPopUp: boolean;
  updatingStatusId: number | null;

  fetchAds: (page?: number) => Promise<void>;
  setCurrentPage: (page: number) => void;
  selectAd: (ad: AdResponse | null) => void;
  closePopUp: () => void;
  updateAdStatus: (adId: number, currentStatus: AdStatus) => Promise<boolean>;
  disableAd: (adId: number) => Promise<boolean>;
  refreshAds: () => Promise<void>;
};

const AdContext = createContext<AdContextType | undefined>(undefined);

type AdProviderProps = {
  children: React.ReactNode;
  pageSize?: number;
};

export const AdProvider: React.FC<AdProviderProps> = ({
  children,
  pageSize = 10,
}) => {
  const [ads, setAds] = useState<AdResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAd, setSelectedAd] = useState<AdResponse | null>(null);
  const [isOpenAdPopUp, setIsOpenAdPopUp] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  const { currentUser } = useUser();

  const fetchAds = useCallback(
    async (page?: number) => {
      const pageToFetch = page ?? currentPage;
      setLoading(true);
      try {
        if (!currentUser) return;
        const response = await handleGetAdByUser(
          currentUser.id!,
          pageToFetch - 1,
          pageSize,
        );
        setAds(response.content);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error("Error fetching boosted posts:", error);
      } finally {
        setLoading(false);
      }
    },
    [currentUser, pageSize],
  );

  const refreshAds = useCallback(async () => {
    await fetchAds(currentPage);
  }, [fetchAds, currentPage]);

  const selectAd = (ad: AdResponse | null) => {
    setSelectedAd(ad);
    if (ad) {
      setIsOpenAdPopUp(true);
    }
  };

  const closePopUp = () => {
    setIsOpenAdPopUp(false);
    setSelectedAd(null);
  };

  const updateAdStatus = useCallback(
    async (adId: number, currentStatus: AdStatus) => {
      if (currentStatus === AdStatus.DISABLED) return false;

      const newStatus =
        currentStatus === AdStatus.ACTIVE ? AdStatus.INACTIVE : AdStatus.ACTIVE;

      setUpdatingStatusId(adId);
      try {
        const result = await handleUpdateAdStatus(adId, newStatus);
        if (result.success) {
          setAds((prevAds) =>
            prevAds.map((ad) =>
              ad.id === adId ? { ...ad, status: newStatus } : ad,
            ),
          );

          if (selectedAd?.id === adId) {
            setSelectedAd((prev) =>
              prev ? { ...prev, status: newStatus } : null,
            );
          }

          return true;
        }
        return false;
      } catch (error) {
        console.error("Error updating ad status:", error);
        return false;
      } finally {
        setUpdatingStatusId(null);
      }
    },
    [selectedAd],
  );

  const disableAd = useCallback(
    async (adId: number) => {
      const currentAd = ads.find((ad) => ad.id === adId);
      if (!currentAd) return false;
      if (currentAd.status === AdStatus.DISABLED) return false;

      setUpdatingStatusId(adId);
      try {
        const result = await handleUpdateAdStatus(adId, AdStatus.DISABLED);
        if (result.success) {
          setAds((prevAds) =>
            prevAds.map((ad) =>
              ad.id === adId ? { ...ad, status: AdStatus.DISABLED } : ad,
            ),
          );

          if (selectedAd?.id === adId) {
            setSelectedAd((prev) =>
              prev ? { ...prev, status: AdStatus.DISABLED } : null,
            );
            closePopUp();
          }

          return true;
        }
        return false;
      } catch (error) {
        console.error("Error disabling ad:", error);
        return false;
      } finally {
        setUpdatingStatusId(null);
      }
    },
    [ads, selectedAd],
  );

  useEffect(() => {
    if (currentUser) {
      fetchAds(currentPage);
    }
  }, [currentUser, currentPage]);

  return (
    <AdContext.Provider
      value={{
        ads,
        loading,
        totalPages,
        currentPage,
        selectedAd,
        isOpenAdPopUp,
        updatingStatusId,

        fetchAds,
        setCurrentPage,
        selectAd,
        closePopUp,
        updateAdStatus,
        disableAd,
        refreshAds,
      }}
    >
      {children}
    </AdContext.Provider>
  );
};

export const useAd = () => {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error("useAd must be used within an AdProvider");
  }
  return context;
};
