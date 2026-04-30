import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Loader2,
  User,
  Flag,
  Trash2,
  CheckSquare,
  Square,
  X,
} from "lucide-react";
import { handleGetListReport, handleDeleteMany } from "../api/interaction.api";
import type { ReportListResponse } from "../types/api/interaction.type";
import { reasonConfig } from "../constants/ReportReasoConfig";
import type { ReportReason } from "../constants/reportReason.enum";
import useDebounce from "../hooks/useDebounce";
import Pagination from "../components/Pagination";
import ConfirmDialog from "../components/ConfirmDialog";

const ReportManagePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reports, setReports] = useState<ReportListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1"),
  );
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("keyword") || "",
  );
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  // Selection states
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 500);
  const pageSize = 20;

  const fetchReports = async (page: number, keyword: string) => {
    setLoading(true);
    try {
      const response = await handleGetListReport(page, pageSize, keyword);
      setReports(response.content);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  const updateURLParams = (page: number, keyword: string) => {
    const params: Record<string, string> = {};
    if (page > 1) params.page = page.toString();
    if (keyword) params.keyword = keyword;
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateURLParams(newPage, debouncedSearch);
    // Clear selection when changing page
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    setCurrentPage(1);
    updateURLParams(1, value);
    // Clear selection when searching
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedIds(new Set()); // Clear selection when exiting selection mode
    }
  };

  // Toggle single report selection
  const toggleSelectReport = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Toggle select all on current page
  const toggleSelectAll = () => {
    if (selectedIds.size === reports.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = reports.map((r) => r.id);
      setSelectedIds(new Set(allIds));
    }
  };

  // Handle delete many
  const handleDeleteManyReports = async () => {
    try {
      await handleDeleteMany(Array.from(selectedIds));
      // Refresh data
      await fetchReports(currentPage, debouncedSearch);
      // Clear selection
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting reports:", error);
    }
  };

  const getReasonIcon = (reason: ReportReason) => {
    const config = reasonConfig[reason];
    if (!config) return <Flag className="w-4 h-4" />;
    const Icon = config.icon;
    return <Icon className="w-4 h-4" />;
  };

  const getReasonLabel = (reason: ReportReason) => {
    return reasonConfig[reason]?.label || reason;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-zinc-900 p-6 w-screen md:w-[calc(100vw-10rem)]">
      <div className="mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Report Management
          </h1>
          <p className="text-neutral-400 text-sm">
            Manage all reported content from users
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by username, reason"
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-neutral-500 text-sm"
            />
          </div>

          <div className="flex gap-2">
            {!isSelectionMode ? (
              <button
                onClick={toggleSelectionMode}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium cursor-pointer transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                Select
              </button>
            ) : (
              <>
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium cursor-pointer transition-colors"
                >
                  {selectedIds.size === reports.length ? (
                    <>
                      <Square className="w-4 h-4" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-4 h-4" />
                      Select All
                    </>
                  )}
                </button>

                {selectedIds.size > 0 && (
                  <button
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedIds.size})
                  </button>
                )}

                <button
                  onClick={toggleSelectionMode}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-neutral-500">
            Total reports:{" "}
            <span className="text-white font-medium">{total}</span>
          </p>
          {isSelectionMode && selectedIds.size > 0 && (
            <p className="text-sm text-blue-400">
              Selected: {selectedIds.size} report(s)
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Filter className="w-12 h-12 text-neutral-700" />
            <p className="text-neutral-500 text-sm">No reports found</p>
            <p className="text-xs text-neutral-600">
              Try changing your search keyword
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => {
                const reason = reasonConfig[report.reason];
                const isSelected = selectedIds.has(report.id);

                return (
                  <div
                    key={report.id}
                    className={`bg-neutral-900 border rounded-xl p-4 transition-all duration-200 ${
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-500/50"
                        : "border-neutral-800 hover:border-neutral-700 hover:shadow-lg"
                    }`}
                    onClick={() => {
                      if (isSelectionMode) {
                        toggleSelectReport(report.id);
                      } else {
                        navigate(
                          `/manage/content?contentId=${report.targetId}&type=${report.targetType}`,
                        );
                      }
                    }}
                  >
                    {isSelectionMode && (
                      <div className="flex items-center justify-end mb-2">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? "bg-blue-500 border-blue-500"
                              : "border-neutral-600"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectReport(report.id);
                          }}
                        >
                          {isSelected && (
                            <CheckSquare className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500">
                          #{report.id}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-500">
                        {formatDate(report.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      {report.avatarUrl ? (
                        <img
                          src={report.avatarUrl}
                          alt={report.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-neutral-500" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">
                          {report.username}
                        </p>
                        <p className="text-xs text-neutral-500">Reported by</p>
                      </div>
                    </div>

                    <div className="border-t border-neutral-800 my-3" />

                    <div className="flex items-start gap-2">
                      <div className="p-1.5 rounded-lg bg-red-500/10 shrink-0">
                        {getReasonIcon(report.reason)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {getReasonLabel(report.reason)}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {reason?.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center mt-4">
              <Pagination
                currentPage={currentPage}
                onPageChange={handlePageChange}
                totalPages={totalPages}
              />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteManyReports}
        title="Delete Reports"
        message={`Are you sure you want to delete ${selectedIds.size} report(s)? This action cannot be undone.`}
      />
    </div>
  );
};

export default ReportManagePage;
