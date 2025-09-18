import { http } from '@/utils/axios';
import type { ApiResponse, UserProfile, UpdateProfileDto } from '@/types/api';

export const profileApi = {
  me: async (): Promise<UserProfile> => {
    const response = await http.get<ApiResponse<UserProfile>>('/profile/me');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch profile');
  },

  update: async (dto: UpdateProfileDto): Promise<UserProfile> => {
    const response = await http.put<ApiResponse<UserProfile>>('/profile/me', dto);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to update profile');
  },

  uploadAvatar: async (file: File): Promise<UserProfile> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await http.post<ApiResponse<UserProfile>>('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to upload avatar');
  },
};