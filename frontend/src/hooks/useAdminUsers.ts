import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUsersApi } from '@/services/admin/usersApi';
import type { AdminUsersFilters, InviteUserRequest } from '@/types/adminUsers';

// Query keys
export const adminUsersQueryKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...adminUsersQueryKeys.all, 'list'] as const,
  list: (filters: AdminUsersFilters) => [...adminUsersQueryKeys.lists(), filters] as const,
  details: () => [...adminUsersQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminUsersQueryKeys.details(), id] as const,
};

// List users query
export const useAdminUsersList = (filters: AdminUsersFilters = {}) => {
  return useQuery({
    queryKey: adminUsersQueryKeys.list(filters),
    queryFn: () => adminUsersApi.getUsers(filters),
    keepPreviousData: true,
  });
};

// User detail query
export const useAdminUserDetail = (id: string, enabled = true) => {
  return useQuery({
    queryKey: adminUsersQueryKeys.detail(id),
    queryFn: () => adminUsersApi.getUserById(id),
    enabled: enabled && !!id,
  });
};

// Set user roles mutation
export const useSetUserRoles = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: string[] }) =>
      adminUsersApi.setUserRoles(id, roles),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch user lists
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.lists() });
      // Invalidate specific user detail
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.detail(id) });
    },
  });
};

// Block/unblock user mutation
export const useSetUserBlocked = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, blocked, reason }: { id: string; blocked: boolean; reason?: string }) =>
      adminUsersApi.setUserBlocked(id, blocked, reason),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch user lists
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.lists() });
      // Invalidate specific user detail
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.detail(id) });
    },
  });
};

// Reset password mutation
export const useResetUserPassword = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminUsersApi.resetUserPassword(id),
    onSuccess: (_, id) => {
      // Invalidate specific user detail
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.detail(id) });
    },
  });
};

// Invite user mutation
export const useInviteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (invite: InviteUserRequest) => adminUsersApi.inviteUser(invite),
    onSuccess: () => {
      // Invalidate and refetch user lists to show new user
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.lists() });
    },
  });
};