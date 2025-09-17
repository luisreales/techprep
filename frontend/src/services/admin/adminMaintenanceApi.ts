import { http } from '@/utils/axios';

export interface BackupInfoDto {
  fileName: string;
  sizeBytes: number;
  createdAt: string;
}

export interface BackupResultDto {
  fileName: string;
  sizeBytes: number;
  createdAt: string;
}

export interface RestoreResultDto {
  status: string;
  message?: string;
}

export const adminMaintenanceApi = {
  backup: async (): Promise<BackupResultDto> => {
    const res = await http.post('/admin/maintenance/backup', {});
    // Backend returns { success, data: { fileName, sizeBytes, createdAt } }
    return res.data?.data as BackupResultDto;
  },

  listBackups: async (): Promise<BackupInfoDto[]> => {
    const res = await http.get('/admin/maintenance/backups');
    return (res.data?.data as BackupInfoDto[]) || [];
  },

  downloadBackup: async (fileName: string): Promise<Blob> => {
    const res = await http.get(`/admin/maintenance/backups/${encodeURIComponent(fileName)}/download`, {
      responseType: 'blob'
    });
    return res.data as Blob;
  },

  restore: async (file: File): Promise<RestoreResultDto> => {
    const form = new FormData();
    // Backend expects parameter name 'backupFile'
    form.append('backupFile', file);
    const res = await http.post('/admin/maintenance/restore', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data?.data as RestoreResultDto;
  },
};
