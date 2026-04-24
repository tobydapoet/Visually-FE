import {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
  useState,
} from "react";
import { handleGetReport } from "../api/interaction.api";
import { User, Flag, AlertCircle, Calendar, Loader2 } from "lucide-react";
import type { CommentTargetType } from "../constants/interaction.enum";
import type { ReportResponse } from "../types/api/interaction.type";
import type { ReportReason } from "../constants/reportReason.enum";
import { reasonConfig } from "../constants/ReportReasoConfig";
import type { ContentType } from "../constants/contentType.enum";
import { ContentStatus } from "../constants/contentStatus.enum";
import { usePost } from "../contexts/post.context";
import { useShort } from "../contexts/short.context";
import ConfirmDialog from "./ConfirmDialog";

export interface ReportSidebarRef {
  refresh: () => void;
}

interface ReportSidebarProps {
  contentId: number;
  type: ContentType;
  status: ContentStatus;
}

const getReasonColor = (reason: ReportReason) => {
  switch (reason) {
    case "BULLYING":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "VIOLENCE":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "NUDITY":
      return "bg-pink-500/10 text-pink-500 border-pink-500/20";
    case "SELF_HARM":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    default:
      return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
  }
};

const ReportSidebar = forwardRef<ReportSidebarRef, ReportSidebarProps>(
  ({ contentId, type, status }, ref) => {
    const [reports, setReports] = useState<ReportResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [contentStatus, setContentStatus] = useState<ContentStatus>();
    const { updatePostStatus } = usePost();
    const { updateShortStatus } = useShort();
    const [isOpenDialog, setIsOpenDialog] = useState(false);

    useEffect(() => {
      setContentStatus(status);
    }, [status]);

    const sentinelRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchPage = async (pageNum: number, reset = false) => {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await handleGetReport(
          contentId,
          type as CommentTargetType,
          pageNum,
          10,
        );

        setReports((prev) => (reset ? res.content : [...prev, ...res.content]));
        setTotal(res.total);
        setHasMore(pageNum < res.totalPages);
        setPage(pageNum);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    useImperativeHandle(ref, () => ({
      refresh: () => fetchPage(1, true),
    }));

    useEffect(() => {
      fetchPage(1, true);
    }, [contentId, type]);

    useEffect(() => {
      if (!sentinelRef.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loadingMore) {
            fetchPage(page + 1);
          }
        },
        {
          root: scrollRef.current,
          threshold: 0.1,
        },
      );

      observer.observe(sentinelRef.current);
      return () => observer.disconnect();
    }, [hasMore, loadingMore, page]);

    const updateStatus = async () => {
      const isActive = contentStatus === "ACTIVE";
      const newStatus = isActive ? "BANNED" : "ACTIVE";

      try {
        if (type === "POST") {
          await updatePostStatus(contentId, newStatus);
        } else {
          await updateShortStatus(contentId, newStatus);
        }

        setContentStatus(newStatus);
      } catch (err) {
        console.error("Update status failed", err);
      }
    };

    return (
      <div className="w-full lg:w-80 xl:w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col max-h-[50vh] md:flex lg:max-h-full">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-white">Reports</h2>
            <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
              {total}
            </span>
          </div>
          <button
            onClick={() => setIsOpenDialog(true)}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
              contentStatus === ContentStatus.ACTIVE
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {contentStatus === ContentStatus.ACTIVE ? "Activate" : "Ban"}
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <AlertCircle className="w-12 h-12 text-zinc-700" />
              <p className="text-zinc-500 text-sm">No reports found</p>
              <p className="text-xs text-zinc-600 text-center px-4">
                This content has not been reported
              </p>
            </div>
          ) : (
            <div>
              {reports.map((report) => {
                const { description } = reasonConfig[report.reason];
                return (
                  <div key={report.id} className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      {report.avatarUrl ? (
                        <img
                          src={report.avatarUrl}
                          alt={report.username}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-zinc-500" />
                        </div>
                      )}
                      <p className="text-sm font-medium text-white truncate">
                        {report.username}
                      </p>
                    </div>

                    <div className="pl-10">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-lg border ${getReasonColor(report.reason)}`}
                      >
                        {description}
                      </span>
                    </div>

                    <div className="pl-10 flex items-center gap-1 text-xs text-zinc-500">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {new Date(report.createdAt).toLocaleString("en-US")}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div ref={sentinelRef} className="py-2 flex justify-center">
                {loadingMore && (
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
                )}
              </div>
            </div>
          )}
        </div>
        <ConfirmDialog
          message={`Do you want to ban #${contentId}?`}
          title="Banned post"
          onClose={() => setIsOpenDialog(false)}
          onConfirm={() => {
            updateStatus();
          }}
          open={isOpenDialog}
        />
      </div>
    );
  },
);

ReportSidebar.displayName = "ReportSidebar";
export default ReportSidebar;
