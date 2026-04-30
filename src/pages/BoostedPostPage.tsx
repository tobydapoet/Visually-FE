import React, { useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import AdPopUp from "../components/AdPopUp";
import { useAd } from "../contexts/ad.context";
import Pagination from "../components/Pagination";
import AdPostCard from "../components/AdPostCard";

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
                <AdPostCard
                  key={ad.id}
                  ad={ad}
                  updatingStatusId={updatingStatusId}
                  onSelect={selectAd}
                  onUpdateStatus={updateAdStatus}
                />
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
