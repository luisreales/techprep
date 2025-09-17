import { http } from '@/utils/axios';

export interface SettingUpdateDto {
  key: string;
  value: string | null;
  type?: string;
  description?: string;
}

export const adminSettingsApi = {
  getAll: () =>
    http.get<Record<string, string | null>>('/admin/settings').then(r => r.data),

  upsert: (entries: SettingUpdateDto[]) =>
    http.put('/admin/settings', entries).then(r => r.data),
};