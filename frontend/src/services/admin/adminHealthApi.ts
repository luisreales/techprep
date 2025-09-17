import { http } from '@/utils/axios';

export interface HealthStatusDto {
  status: string;
  dbOk: boolean;
  pendingMigrations: number;
  dbSizeBytes: number;
  freeDiskBytes: number;
  lastErrorAt?: string;
  environment: string;
}

export const adminHealthApi = {
  get: async () => {
    const res = await http.get('/admin/health');
    // Backend returns { success, data: {...} }
    return (res.data && res.data.data) as HealthStatusDto;
  },
};
