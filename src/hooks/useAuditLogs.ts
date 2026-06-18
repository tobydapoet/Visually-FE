import { useState, useEffect } from "react";
import {
  handleGetUserAuditLogs,
  handleGetAdAuditLogs,
  handleGetContentAuditLogs,
} from "../api/audit.api";
import type { AuditLog, AuditLogParams } from "../types/api/audit.type";

export type AuditService = "user" | "ad" | "content";

interface UseAuditLogsResult {
  logs: AuditLog[];
  total: number;
  loading: boolean;
  error: string | null;
}

export const useAuditLogs = (
  service: AuditService,
  params: AuditLogParams,
): UseAuditLogsResult => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const handler =
          service === "user"
            ? handleGetUserAuditLogs
            : service === "ad"
              ? handleGetAdAuditLogs
              : handleGetContentAuditLogs;

        const res = await handler(params);
        setLogs(res.content);
        setTotal(res.total);
      } catch {
        setError("Không thể tải audit log");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [
    service,
    params.page,
    params.action,
    params.actorUsername,
    params.targetUsername,
  ]);

  return { logs, total, loading, error };
};
