import React, { useState, useEffect } from "react";
import {
  Music,
  Search,
  X,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useMusic } from "../contexts/music.context";
import { MusicStatus } from "../constants/music.enum";
import { useSearchParams } from "react-router-dom";
import MusicItem from "../components/MusicItem";
import MusicPopUp from "../components/MusicPopUp";
import useDebounce from "../hooks/useDebounce";

const MusicLibraryPage: React.FC = () => {
  const { getMusicList, musicList, totalPages, loading } = useMusic();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDialog, setOpenDialog] = useState(false);

  const currentPage = Number(searchParams.get("page") ?? 0);
  const currentSearch = searchParams.get("search") ?? "";
  const statusFilter =
    (searchParams.get("status") as MusicStatus) ?? MusicStatus.ACTIVE;

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    getMusicList(currentPage, 20, statusFilter, currentSearch || undefined);
  }, [currentPage, currentSearch, statusFilter]);

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchParams({ page: "0", status: statusFilter });
  };

  const handleTabChange = (status: MusicStatus) => {
    setSearchParams({ page: "0", search: "", status });
    setSearchInput("");
  };

  const handlePageChange = (page: number) => {
    setSearchParams({
      page: String(page),
      search: currentSearch,
      status: statusFilter,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    setSearchParams({
      page: "0",
      search: debouncedSearch,
      status: statusFilter,
    });
  }, [debouncedSearch]);

  const getPageNumbers = () => {
    const delta = 2;
    const range: (number | "...")[] = [];
    const left = Math.max(0, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    if (left > 0) {
      range.push(0);
      if (left > 1) range.push("...");
    }

    for (let i = left; i <= right; i++) range.push(i);

    if (right < totalPages - 1) {
      if (right < totalPages - 2) range.push("...");
      range.push(totalPages - 1);
    }

    return range;
  };

  const tabs = [
    { key: MusicStatus.ACTIVE, label: "Active", color: "green" },
    { key: MusicStatus.PENDING, label: "Pending", color: "yellow" },
    { key: MusicStatus.SUSPENDED, label: "Suspended", color: "gray" },
  ];

  return (
    <>
      <div className="py-6 w-full min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">Music Library</h1>
            </div>
            <button
              onClick={() => setOpenDialog(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 transition-colors"
            >
              <Plus size={16} />
              <span>Add</span>
            </button>
          </div>

          <div className="flex gap-1 border-b border-gray-700 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  statusFilter === tab.key
                    ? `border-b-2 border-${tab.color}-500 text-${tab.color}-400`
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative mb-4">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder={`Search ${statusFilter.toLowerCase()} songs...`}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-neutral-500 text-sm"
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X size={14} className="text-gray-500 hover:text-gray-400" />
              </button>
            )}
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={28} className="animate-spin text-indigo-400" />
              </div>
            ) : musicList?.length > 0 ? (
              musicList.map((music) => (
                <MusicItem key={music.id} music={music} />
              ))
            ) : (
              <div className="text-center py-12 rounded-lg">
                <Music size={48} className="mx-auto text-gray-600 mb-2" />
                <p className="text-gray-400 text-sm">
                  {currentSearch
                    ? "No results found"
                    : `No ${statusFilter.toLowerCase()} songs`}
                </p>
              </div>
            )}
          </div>

          {totalPages > 1 && !loading && (
            <div className="flex items-center justify-center gap-1 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {getPageNumbers().map((page, idx) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-gray-500 text-sm"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-indigo-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                    }`}
                  >
                    {(page as number) + 1}
                  </button>
                ),
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <MusicPopUp open={openDialog} onClose={() => setOpenDialog(false)} />
    </>
  );
};

export default MusicLibraryPage;
