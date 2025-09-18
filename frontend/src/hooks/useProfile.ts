import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/services/profileApi';
import { useAuthStore } from '@/stores/authStore';
import type { UserProfile, UpdateProfileDto } from '@/types/api';

export const useProfile = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery<UserProfile>({
    queryKey: ['profile', 'me'],
    queryFn: profileApi.me,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated, // Only run query when authenticated
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => profileApi.update(dto),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', 'me'], data);
      // Optionally update auth store if needed
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', 'me'], data);
    },
  });
};