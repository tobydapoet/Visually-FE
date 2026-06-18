import React, { useState, useEffect } from "react";
import { CircularProgress, Pagination } from "@mui/material";
import { User, Megaphone, FileText, Search } from "lucide-react";
import { useAuditLogs, type AuditService } from "../hooks/useAuditLogs";
import { useTranslation } from "../hooks/useTranslation";
import useDebounce from "../hooks/useDebounce";

type TranslationKey = string;

const serviceOptions: {
  value: AuditService;
  labelKey: TranslationKey;
  icon: React.ElementType;
}[] = [
  { value: "user", labelKey: "user_service", icon: User },
  { value: "ad", labelKey: "ad_service", icon: Megaphone },
  { value: "content", labelKey: "content_service", icon: FileText },
];

const actionColorMap: Record<string, string> = {
  LOGIN: "bg-green-500/10 text-green-400 border border-green-500/20",
  GOOGLE_LOGIN: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  UPDATE_STATUS: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  UPDATE_ROLE: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  RESET_PASSWORD:
    "bg-orange-500/10 text-orange-400 border border-orange-500/20",

  UPDATE_AD_STATUS: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
  UPDATE_AD_ACTIVE: "bg-green-500/10 text-green-400 border border-green-500/20",
  UPDATE_AD_INACTIVE:
    "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  UPDATE_AD_DISABLED: "bg-red-500/10 text-red-400 border border-red-500/20",

  POST_BANNED: "bg-red-500/10 text-red-400 border border-red-500/20",
  POST_ACTIVE: "bg-green-500/10 text-green-400 border border-green-500/20",
  POST_DELETED: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",

  SHORT_BANNED: "bg-red-500/10 text-red-400 border border-red-500/20",
  SHORT_ACTIVE: "bg-green-500/10 text-green-400 border border-green-500/20",
  SHORT_DELETED: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
};

const PAGE_SIZE = 20;

const AuditLogPage: React.FC = () => {
  const [service, setService] = useState<AuditService>("user");
  const [action, setAction] = useState("");
  const [actorUsername, setActorUsername] = useState("");
  const [page, setPage] = useState(1);
  const { t } = useTranslation();

  const debouncedAction = useDebounce(action, 500);
  const debouncedActorUsername = useDebounce(actorUsername, 500);

  useEffect(() => {
    setPage(1);
  }, [service, debouncedAction, debouncedActorUsername]);

  const { logs, total, loading, error } = useAuditLogs(service, {
    action: debouncedAction || undefined,
    actorUsername: debouncedActorUsername || undefined,
    page: page - 1,
    size: PAGE_SIZE,
  });

  const totalPages = Math.ceil((total || 0) / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-zinc-900 p-3 sm:p-4 md:p-6 w-full">
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {t("audit_log" as any)}
          </h1>
          <p className="text-neutral-400 text-sm">
            {t("audit_log_subtitle" as any)}
          </p>
        </div>
      </div>

      <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-2xl p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex gap-2">
          {serviceOptions.map(({ value, labelKey, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setService(value);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors
                ${
                  service === value
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
                }`}
            >
              <Icon size={14} />
              {t(labelKey as any)}
            </button>
          ))}
        </div>

        <div className="flex gap-2 ml-auto">
          <div className="relative">
            <input
              type="text"
              placeholder={t("action_placeholder" as any)}
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="bg-zinc-700/50 border border-zinc-600/50 text-zinc-200 text-xs rounded-xl px-3 py-1.5 w-44 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
            {action && action !== debouncedAction && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <div className="w-3 h-3 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="relative flex items-center">
            <Search size={13} className="absolute left-3 text-zinc-500" />
            <input
              type="text"
              placeholder={t("actor_id_placeholder" as any)}
              value={actorUsername}
              onChange={(e) => {
                setActorUsername(e.target.value);
              }}
              className="bg-zinc-700/50 border border-zinc-600/50 text-zinc-200 text-xs rounded-xl pl-8 pr-3 py-1.5 w-44 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-zinc-700/50">
          <p className="col-span-3 text-zinc-500 text-xs">
            {t("actor" as any)}
          </p>
          <p className="col-span-2 text-zinc-500 text-xs">
            {t("action" as any)}
          </p>
          <p className="col-span-3 text-zinc-500 text-xs">
            {t("target_id" as any)}
          </p>
          <p className="col-span-2 text-zinc-500 text-xs">
            {t("target_type" as any)}
          </p>
          <p className="col-span-2 text-zinc-500 text-xs text-right">
            {t("time" as any)}
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-48">
            <CircularProgress size={24} sx={{ color: "#71717a" }} />
          </div>
        )}

        {error && (
          <div className="p-4 text-red-400 text-sm text-center">{error}</div>
        )}

        {!loading && !error && (!logs || logs.length === 0) && (
          <div className="p-8 text-zinc-500 text-sm text-center">
            {t("no_logs" as any)}
          </div>
        )}

        {!loading && !error && logs && logs.length > 0 && (
          <>
            {logs.map((log) => {
              const colorClass =
                actionColorMap[log.action] ?? "bg-zinc-700 text-zinc-300";

              return (
                <div
                  key={log.id}
                  className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-zinc-700/30 hover:bg-zinc-700/20 transition-colors"
                >
                  <div className="col-span-3">
                    <p className="text-zinc-200 text-xs font-medium">
                      {log.actorUsername || "Unknown"}
                    </p>
                    <p className="text-zinc-500 text-xs truncate">
                      {log.actorId || "—"}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-lg font-medium ${colorClass}`}
                    >
                      {log.action}
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <p className="text-zinc-400 text-xs truncate">
                      {log.targetId ?? "—"}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-xs px-2 py-0.5 rounded-lg bg-zinc-700/50 text-zinc-300">
                      {log.targetType || "—"}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <p className="text-zinc-500 text-xs whitespace-nowrap">
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString(
                            document.documentElement.lang === "vi"
                              ? "vi-VN"
                              : "en-US",
                          )
                        : "—"}
                    </p>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, val) => setPage(val)}
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#71717a",
                borderColor: "#3f3f46",
                fontSize: "12px",
              },
              "& .Mui-selected": {
                backgroundColor: "#3f3f46 !important",
                color: "#ffffff",
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;
