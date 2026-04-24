import React, { useEffect } from "react";
import { TrendingUp, Eye, MousePointerClick, Play, Pause } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { ParsedContent } from "../components/ParseContent";
import AdPopUp from "../components/AdPopUp";
import { useAd } from "../contexts/ad.context";
import { AdStatus } from "../constants/adStatus.enum";
import Pagination from "../components/Pagination";

const BoostedPostPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    ads,
    totalPages,
    currentPage,
    updatingStatusId,
    setCurrentPage,
    selectAd,
    updateAdStatus,
  } = useAd();

  useEffect(() => {
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    if (pageParam !== currentPage) {
      setCurrentPage(pageParam);
    }
  }, []);

  useEffect(() => {
    setSearchParams({ page: currentPage.toString() }, { replace: true });
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSelectAd = (ad: any) => {
    selectAd(ad);
  };

  const handleUpdateStatus = (adId: number, currentStatus: AdStatus) => {
    updateAdStatus(adId, currentStatus);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCTR = (views: number, clicks: number) => {
    if (views === 0) return 0;
    return ((clicks / views) * 100).toFixed(1);
  };

  const getStatusColor = (status: AdStatus) => {
    switch (status) {
      case AdStatus.ACTIVE:
        return "text-green-400 bg-green-400/10";
      case AdStatus.INACTIVE:
        return "text-yellow-400 bg-yellow-400/10";
      case AdStatus.DISABLED:
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
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

  const PostCard = ({ ad }: { ad: any }) => (
    <div
      className="group bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden 
        hover:border-zinc-700 transition-all duration-300
        hover:shadow-lg hover:shadow-blue-500/5"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}
          >
            {getStatusText(ad.status)}
          </div>

          {ad.status !== AdStatus.DISABLED && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateStatus(ad.id, ad.status);
              }}
              disabled={updatingStatusId === ad.id}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                ad.status === AdStatus.ACTIVE
                  ? "Pause campaign"
                  : "Activate campaign"
              }
            >
              {updatingStatusId === ad.id ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : ad.status === AdStatus.ACTIVE ? (
                <Pause className="w-4 h-4 text-yellow-400" />
              ) : (
                <Play className="w-4 h-4 text-green-400" />
              )}
            </button>
          )}
        </div>

        <div onClick={() => handleSelectAd(ad)} className="cursor-pointer">
          <div className="text-sm text-white line-clamp-2 mb-3 font-bold">
            <ParsedContent
              caption={ad.content.caption}
              mentions={ad.content.mentions}
              classname="font-bold"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800">
            <div className="text-center">
              <Eye className="w-3 h-3 text-blue-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-white">
                {ad.views.toLocaleString()}
              </p>
              <p className="text-[10px] text-zinc-500">Views</p>
            </div>
            <div className="text-center">
              <MousePointerClick className="w-3 h-3 text-emerald-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-white">
                {ad.clicks.toLocaleString()}
              </p>
              <p className="text-[10px] text-zinc-500">Clicks</p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-3 h-3 text-purple-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-white">
                {getCTR(ad.views, ad.clicks)}%
              </p>
              <p className="text-[10px] text-zinc-500">CTR</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-zinc-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Daily Budget:</span>
              <span className="text-emerald-400 font-semibold">
                {formatCurrency(ad.dailyBudget)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs mt-1">
              <span className="text-zinc-500">Spent:</span>
              <span className="text-yellow-400">
                {formatCurrency(ad.spentAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-screen">
      <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-500 bg-clip-text">
                Boosted Posts
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                Manage and track your advertising campaigns
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {ads.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-12 h-12 text-zinc-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No boosted posts yet
            </h3>
            <p className="text-zinc-400">
              Start boosting your content to reach more audience
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
                <PostCard key={ad.id} ad={ad} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Pagination
                  onPageChange={handlePageChange}
                  currentPage={currentPage}
                  totalPages={totalPages}
                />
              </div>
            )}
          </>
        )}
      </div>

      <AdPopUp />
    </div>
  );
};

export default BoostedPostPage;
