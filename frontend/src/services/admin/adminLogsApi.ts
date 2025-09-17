import { http } from '@/utils/axios';

export interface LogEntryDto {
  timestamp: string;
  level: string;
  message: string;
  exception?: string;
  source?: string;
}

export interface PagedLogsDto {
  items: LogEntryDto[];
  page: number;
  pageSize: number;
  total: number;
}

export interface LogFilterParams {
  level?: 'Information' | 'Warning' | 'Error';
  q?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

const normalizeLevel = (lvl: string) => {
  const v = (lvl || '').toUpperCase();
  if (v.startsWith('INF')) return 'Information';
  if (v.startsWith('WRN')) return 'Warning';
  if (v.startsWith('ERR')) return 'Error';
  if (v.startsWith('DBG')) return 'Debug';
  if (v.startsWith('FTL')) return 'Fatal';
  return lvl;
};

export const adminLogsApi = {
  list: async (params?: LogFilterParams): Promise<PagedLogsDto> => {
    const res = await http.get('/admin/logs', { params });
    // Backend shape: { success, data: { items, page, pageSize, total } }
    const payload = (res.data && res.data.data) || { items: [], page: 1, pageSize: 50, total: 0 };
    const items = (payload.items || []).map((it: any) => ({
      timestamp: it.timestamp,
      level: normalizeLevel(it.level),
      message: it.message,
      exception: it.exception,
      source: it.source,
    }));
    return { items, page: payload.page, pageSize: payload.pageSize, total: payload.total };
  },

  download: (date: string) =>
    http.get(`/admin/logs/download`, {
      params: { date },
      responseType: 'blob'
    }).then(r => r.data),
};
