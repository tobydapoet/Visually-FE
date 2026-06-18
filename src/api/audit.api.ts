import type { AuditLogPage, AuditLogParams } from "../types/api/audit.type";
import axiosInstance from "../utils/axiosInstance";

export const handleGetUserAuditLogs = async (
  params: AuditLogParams,
): Promise<AuditLogPage> => {
  const base = import.meta.env.VITE_API_URL;
  const res = await axiosInstance.get(`${base}users/audit-log`, {
    params,
  });
  return res.data;
};

export const handleGetAdAuditLogs = async (
  params: AuditLogParams,
): Promise<AuditLogPage> => {
  const base = import.meta.env.VITE_API_URL;
  const res = await axiosInstance.get(`${base}ads/audit-log`, {
    params,
  });
  return res.data;
};

export const handleGetContentAuditLogs = async (
  params: AuditLogParams,
): Promise<AuditLogPage> => {
  const base = import.meta.env.VITE_API_URL;
  const res = await axiosInstance.get(`${base}contents/audit-log`, {
    params,
  });
  return res.data;
};
