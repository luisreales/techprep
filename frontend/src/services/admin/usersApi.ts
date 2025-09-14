import { http } from '@/utils/axios';
import { ApiResponse } from '@/types/api';
import type {
  AdminUser,
  AdminUsersResponse,
  AdminUsersFilters,
  SetRolesRequest,
  BlockUserRequest,
  InviteUserRequest,
  ResetPasswordTokenResponse
} from '@/types/adminUsers';

export const adminUsersApi = {
  // List users with filters and pagination
  async getUsers(filters: AdminUsersFilters = {}): Promise<AdminUsersResponse> {
    const params = new URLSearchParams();
    
    if (filters.q) params.append('q', filters.q);
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.sort) params.append('sort', filters.sort);
    
    const { data } = await http.get<ApiResponse<AdminUsersResponse>>(
      `/admin/users?${params.toString()}`
    );
    
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to fetch users');
    }
    
    return data.data;
  },

  // Get detailed user information
  async getUserById(id: string): Promise<AdminUser> {
    const { data } = await http.get<ApiResponse<AdminUser>>(`/admin/users/${id}`);
    
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to fetch user details');
    }
    
    return data.data;
  },

  // Update user roles
  async setUserRoles(id: string, roles: string[]): Promise<void> {
    const payload: SetRolesRequest = { roles };
    
    const { data } = await http.put<ApiResponse<void>>(
      `/admin/users/${id}/roles`,
      payload
    );
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to update user roles');
    }
  },

  // Block or unblock a user
  async setUserBlocked(id: string, blocked: boolean, reason?: string): Promise<void> {
    const payload: BlockUserRequest = { blocked, reason };
    
    const { data } = await http.put<ApiResponse<void>>(
      `/admin/users/${id}/block`,
      payload
    );
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to update user status');
    }
  },

  // Generate password reset token
  async resetUserPassword(id: string): Promise<string> {
    const { data } = await http.post<ApiResponse<ResetPasswordTokenResponse>>(
      `/admin/users/${id}/reset-password`
    );
    
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to generate reset token');
    }
    
    return data.data.resetToken;
  },

  // Invite a new user
  async inviteUser(invite: InviteUserRequest): Promise<void> {
    const { data } = await http.post<ApiResponse<void>>(
      '/admin/users/invite',
      invite
    );
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to invite user');
    }
  }
};