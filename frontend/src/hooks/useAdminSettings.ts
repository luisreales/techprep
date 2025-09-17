import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSettingsApi, SettingUpdateDto } from '@/services/admin/adminSettingsApi';

export const useSettings = () =>
  useQuery({
    queryKey: ['adminSettings'],
    queryFn: adminSettingsApi.getAll,
  });

export const useSaveSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entries: SettingUpdateDto[]) => adminSettingsApi.upsert(entries),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
    },
  });
};