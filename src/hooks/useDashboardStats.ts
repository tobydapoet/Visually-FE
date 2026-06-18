import { useState, useEffect } from "react";
import type { DashboardStats, Period } from "../types/api/stats.type";
import { handleGetDashboardStats } from "../api/dashboard.api";

export const useDashboardStats = (period: Period) => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await handleGetDashboardStats(period);
        setData(res);
      } catch {
        setError("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [period]);

  return { data, loading, error };
};
