import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type React from "react";
import type { ShortDetailResponse } from "../types/api/short.type";
import type { PostDetailResponse } from "../types/api/post.type";
import {
  Bookmark,
  Eye,
  Heart,
  ImageIcon,
  Loader2,
  MessageCircle,
  MousePointerClick,
  PlayCircle,
  Repeat,
  Target,
  Wallet,
  X,
  Play,
  Pause,
  Ban,
} from "lucide-react";
import { useEffect, useState } from "react";
import { handleGetShort } from "../api/short.api";
import { handleGetPost } from "../api/post.api";
import ConfirmDialog from "./ConfirmDialog";
import assets from "../assets";
import { ParsedContent } from "./ParseContent";
import { useAd } from "../contexts/ad.context";
import { AdStatus } from "../constants/adStatus.enum";

type ContentDetail = PostDetailResponse | ShortDetailResponse;

const AdPopUp: React.FC = () => {
  const {
    selectedAd: ad,
    isOpenAdPopUp: open,
    closePopUp,
    updateAdStatus,
    updatingStatusId,
    disableAd,
  } = useAd();

  const [contentDetail, setContentDetail] = useState<ContentDetail | null>(
    null,
  );
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  const fetchContentDetail = async () => {
    if (!ad) return;

    setLoadingDetail(true);
    try {
      let detail;
      if (ad.type === "POST") {
        detail = await handleGetPost(ad.content.id);
      } else if (ad.type === "SHORT") {
        detail = await handleGetShort(ad.content.id);
      }
      setContentDetail(detail || null);
    } catch (error) {
      console.error("Error fetching content detail:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (ad) {
      fetchContentDetail();
    }
  }, [ad]);

  const handleToggleStatus = () => {
    if (ad) {
      updateAdStatus(ad.id, ad.status);
    }
  };

  const confirmDisable = () => {
    if (ad) {
      disableAd(ad.id);
    }
    setShowDisableConfirm(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMediaUrls = (detail: ContentDetail | null) => {
    if (!detail) return [];

    if ("medias" in detail) {
      return detail.medias.map((m) => m.url);
    } else if ("mediaUrl" in detail) {
      return [detail.mediaUrl];
    }
    return [];
  };

  const getThumbnailUrl = (detail: ContentDetail | null) => {
    if (!detail) return null;

    if ("thumbnailUrl" in detail && detail.thumbnailUrl) {
      return detail.thumbnailUrl;
    } else if ("medias" in detail && detail.medias[0]?.url) {
      return detail.medias[0].url;
    }
    return null;
  };

  const getStatusColor = (status: AdStatus) => {
    switch (status) {
      case AdStatus.ACTIVE:
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case AdStatus.INACTIVE:
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case AdStatus.DISABLED:
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  const getStatusText = (status: AdStatus) => {
    switch (status) {
      case AdStatus.ACTIVE:
        return "Active";
      case AdStatus.INACTIVE:
        return "Inactive";
      case AdStatus.DISABLED:
        return "Disabled";
      default:
        return status;
    }
  };

  if (!ad) return null;

  const mediaUrls = getMediaUrls(contentDetail);
  const thumbnailUrl = getThumbnailUrl(contentDetail);
  const isVideo = ad.type === "SHORT";

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const calculateROI = (spent: number, views: number) => {
    if (spent === 0) return 0;
    const costPerView = spent / views;
    return costPerView.toFixed(0);
  };

  return (
    <>
      <Dialog open={open} onClose={closePopUp} className="relative z-50">
        <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center">
          <DialogPanel
            transition
            className="w-fit max-w-5xl rounded-xl bg-zinc-900 p-0
              text-white duration-300 ease-out
              data-closed:scale-95 data-closed:opacity-0"
          >
            <DialogTitle className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
              <div className="text-md font-semibold text-white">
                Campaign Details
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ad.status)}`}
                >
                  {getStatusText(ad.status)}
                </div>

                {ad.status !== AdStatus.DISABLED && (
                  <>
                    {ad.status === AdStatus.ACTIVE ? (
                      <button
                        onClick={handleToggleStatus}
                        disabled={updatingStatusId === ad.id}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors
                          disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Pause campaign"
                      >
                        {updatingStatusId === ad.id ? (
                          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                        ) : (
                          <Pause className="w-4 h-4 text-yellow-400" />
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleToggleStatus}
                        disabled={updatingStatusId === ad.id}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors
                          disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Activate campaign"
                      >
                        {updatingStatusId === ad.id ? (
                          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4 text-green-400" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => setShowDisableConfirm(true)}
                      disabled={updatingStatusId === ad.id}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Disable campaign"
                    >
                      <Ban className="w-4 h-4 text-red-400" />
                    </button>
                  </>
                )}

                <button
                  onClick={closePopUp}
                  className="w-9 h-9 flex items-center cursor-pointer justify-center rounded-full hover:bg-zinc-800 transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </DialogTitle>

            {loadingDetail ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="p-6">
                <div className="flex flex-row gap-6">
                  <div>
                    <div className="rounded-xl h-full overflow-hidden bg-zinc-800">
                      {mediaUrls.length > 0 ? (
                        isVideo ? (
                          <video
                            src={mediaUrls[0]}
                            controls
                            className="w-70 h-full object-contain"
                            poster={thumbnailUrl || undefined}
                          />
                        ) : (
                          <img
                            src={mediaUrls[0]}
                            alt={ad.content.caption}
                            className="rounded-xl w-70 h-full object-contain"
                          />
                        )
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center bg-zinc-800">
                          {isVideo ? (
                            <PlayCircle className="w-12 h-12 text-zinc-600" />
                          ) : (
                            <ImageIcon className="w-12 h-12 text-zinc-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <img
                        src={ad.content.avatarUrl || assets.profile}
                        className="w-10 h-10 rounded-full object-cover"
                        alt="avatar"
                      />
                      <div>
                        <p className="font-semibold text-white">
                          {ad.content.username}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {formatDate(ad.startDate)}
                        </p>
                      </div>
                    </div>

                    <div className="text-white mt-2 max-w-md">
                      <ParsedContent
                        caption={ad.content.caption}
                        mentions={ad.content.mentions}
                        classname="font-bold cursor-pointer"
                      />
                    </div>

                    {contentDetail &&
                      "tags" in contentDetail &&
                      contentDetail.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {contentDetail.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs"
                            >
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                      )}

                    <div className="bg-zinc-800/30 rounded-xl p-4 mb-6 w-90 mt-4">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        Budget Details
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Daily Budget:</span>
                          <span className="text-emerald-400 font-semibold">
                            {formatCurrency(ad.dailyBudget)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Total Spent:</span>
                          <span className="text-yellow-400 font-semibold">
                            {formatCurrency(ad.spentAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Remaining:</span>
                          <span className="text-blue-400 font-semibold">
                            {formatCurrency(
                              ad.dailyBudget * 30 - ad.spentAmount,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-zinc-700">
                          <span className="text-zinc-400">Cost per View:</span>
                          <span className="text-white">
                            {calculateROI(ad.spentAmount, ad.views)} VND
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-800/30 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        Targeting Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-zinc-500 mb-1">
                            Age Range
                          </p>
                          <p className="text-sm text-white">
                            {ad.ageMin} - {ad.ageMax} years
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 mb-1">Gender</p>
                          <p className="text-sm text-white">
                            {ad.gender === "ALL"
                              ? "All"
                              : ad.gender === "MALE"
                                ? "Male"
                                : "Female"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 mb-1">
                            Campaign Period
                          </p>
                          <p className="text-sm text-white">
                            {formatDate(ad.startDate)} -{" "}
                            {formatDate(ad.endDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-4 ml-1">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm text-zinc-300">
                          {ad.content.likeCount}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm text-zinc-300">
                          {ad.content.commentCount}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bookmark className="w-4 h-4" />
                        <span className="text-sm text-zinc-300">
                          {ad.content.saveCount}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Repeat className="w-4 h-4" />
                        <span className="text-sm text-zinc-300">
                          {ad.content.repostCount}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MousePointerClick className="w-4 h-4" />
                        <span className="text-sm text-zinc-300">
                          {ad.clicks}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm text-zinc-300">
                          {ad.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>

      <ConfirmDialog
        open={showDisableConfirm}
        onClose={() => setShowDisableConfirm(false)}
        onConfirm={confirmDisable}
        title="Disable Campaign"
        message={`Are you sure you want to disable this campaign? This action cannot be undone.`}
        confirmText="Disable"
        cancelText="Cancel"
      />
    </>
  );
};

export default AdPopUp;
