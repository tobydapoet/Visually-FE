export interface AuditLogPage {
  content: AuditLog[];
  total: number;
  page: number;
  size: number;
}

export interface AuditLog {
  id: number;
  actorId: string;
  actorUsername: string;
  action: string;
  targetId: string | number;
  targetType?: string;
  createdAt: string;
}

export interface AuditLogParams {
  actorUsername?: string;
  targetUsername?: string;
  action?: string;
  page?: number;
  size?: number;
}
