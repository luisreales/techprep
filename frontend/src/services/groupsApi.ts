import { ApiResponse } from '@/types/api';
import { api } from './api';

// Groups Management Types
export interface Group {
  id: number;
  name: string;
  description?: string;
  organizationId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  memberCount: number;
  organization?: Organization;
}

export interface GroupDetail extends Group {
  members: GroupMember[];
}

export interface GroupMember {
  userId: string;
  userName: string;
  email: string;
  role: GroupRole;
  joinedAt: string;
  addedByUserId?: string;
  user?: User;
}

export interface Organization {
  id: number;
  name: string;
  description?: string;
  domain?: string;
  isActive: boolean;
  settings: OrganizationSettings;
  plan: SubscriptionPlan;
  usage: OrganizationUsage;
  createdAt: string;
  createdByUserId: string;
}

export interface OrganizationSettings {
  allowSelfRegistration: boolean;
  requireEmailVerification: boolean;
  enableSSOIntegration: boolean;
  defaultGroupRole: GroupRole;
  maxGroupsPerUser: number;
  enableBranding: boolean;
  customDomain?: string;
  logoUrl?: string;
  primaryColor?: string;
  features: {
    analytics: boolean;
    proctoring: boolean;
    certificates: boolean;
    api: boolean;
    webhooks: boolean;
  };
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  type: 'free' | 'starter' | 'professional' | 'enterprise';
  maxUsers: number;
  maxGroups: number;
  maxQuestionsPerMonth: number;
  features: string[];
  pricePerMonth: number;
  isActive: boolean;
}

export interface OrganizationUsage {
  currentUsers: number;
  currentGroups: number;
  questionsThisMonth: number;
  creditsUsed: number;
  creditsRemaining: number;
  lastResetDate: string;
}

export enum GroupRole {
  MEMBER = 'member',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  OWNER = 'owner'
}

export interface User {
  id: string;
  userName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  role: UserRole;
  joinedAt: string;
}

export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin'
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  organizationId?: number;
  initialMembers?: string[]; // User IDs
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface AddMembersRequest {
  userIds: string[];
  role?: GroupRole;
  sendInviteEmail?: boolean;
}

export interface UpdateMemberRoleRequest {
  userId: string;
  role: GroupRole;
}

export interface GroupFilters {
  organizationId?: number;
  isActive?: boolean;
  search?: string;
  createdBy?: string;
  hasMembers?: boolean;
  page?: number;
  pageSize?: number;
}

export interface GroupStats {
  totalGroups: number;
  activeGroups: number;
  totalMembers: number;
  averageMembersPerGroup: number;
  groupsByOrganization: Record<string, number>;
  recentActivity: GroupActivity[];
}

export interface GroupActivity {
  id: string;
  type: 'member_added' | 'member_removed' | 'role_changed' | 'group_created' | 'group_updated';
  groupId: number;
  groupName: string;
  userId?: string;
  userName?: string;
  details?: string;
  performedBy: string;
  performedAt: string;
}

export interface GroupInvitation {
  id: string;
  groupId: number;
  groupName: string;
  email: string;
  role: GroupRole;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  token: string;
}

// API Functions
export const groupsApi = {
  // Groups CRUD
  async getGroups(filters?: GroupFilters): Promise<ApiResponse<{ groups: Group[]; totalCount: number }>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    return api.get(`/api/groups?${params.toString()}`);
  },

  async getGroup(id: number): Promise<ApiResponse<GroupDetail>> {
    return api.get(`/api/groups/${id}`);
  },

  async createGroup(data: CreateGroupRequest): Promise<ApiResponse<Group>> {
    return api.post('/api/groups', data);
  },

  async updateGroup(id: number, data: UpdateGroupRequest): Promise<ApiResponse<Group>> {
    return api.put(`/api/groups/${id}`, data);
  },

  async deleteGroup(id: number): Promise<ApiResponse<void>> {
    return api.delete(`/api/groups/${id}`);
  },

  // Member Management
  async addMembers(groupId: number, data: AddMembersRequest): Promise<ApiResponse<GroupMember[]>> {
    return api.post(`/api/groups/${groupId}/members`, data);
  },

  async removeMembers(groupId: number, userIds: string[]): Promise<ApiResponse<void>> {
    return api.delete(`/api/groups/${groupId}/members`, { data: { userIds } });
  },

  async updateMemberRole(groupId: number, data: UpdateMemberRoleRequest): Promise<ApiResponse<GroupMember>> {
    return api.put(`/api/groups/${groupId}/members/${data.userId}/role`, { role: data.role });
  },

  async getGroupMembers(groupId: number): Promise<ApiResponse<GroupMember[]>> {
    return api.get(`/api/groups/${groupId}/members`);
  },

  // User's Groups
  async getMyGroups(): Promise<ApiResponse<Group[]>> {
    return api.get('/api/groups/my-groups');
  },

  async leaveGroup(groupId: number): Promise<ApiResponse<void>> {
    return api.delete(`/api/groups/${groupId}/leave`);
  },

  // Invitations
  async inviteMembers(groupId: number, emails: string[], role: GroupRole = GroupRole.MEMBER): Promise<ApiResponse<GroupInvitation[]>> {
    return api.post(`/api/groups/${groupId}/invite`, { emails, role });
  },

  async getGroupInvitations(groupId: number): Promise<ApiResponse<GroupInvitation[]>> {
    return api.get(`/api/groups/${groupId}/invitations`);
  },

  async resendInvitation(invitationId: string): Promise<ApiResponse<void>> {
    return api.post(`/api/groups/invitations/${invitationId}/resend`);
  },

  async cancelInvitation(invitationId: string): Promise<ApiResponse<void>> {
    return api.delete(`/api/groups/invitations/${invitationId}`);
  },

  async acceptInvitation(token: string): Promise<ApiResponse<Group>> {
    return api.post(`/api/groups/invitations/accept`, { token });
  },

  async declineInvitation(token: string): Promise<ApiResponse<void>> {
    return api.post(`/api/groups/invitations/decline`, { token });
  },

  // Organizations
  async getOrganizations(): Promise<ApiResponse<Organization[]>> {
    return api.get('/api/organizations');
  },

  async getOrganization(id: number): Promise<ApiResponse<Organization>> {
    return api.get(`/api/organizations/${id}`);
  },

  async createOrganization(data: Partial<Organization>): Promise<ApiResponse<Organization>> {
    return api.post('/api/organizations', data);
  },

  async updateOrganization(id: number, data: Partial<Organization>): Promise<ApiResponse<Organization>> {
    return api.put(`/api/organizations/${id}`, data);
  },

  // Analytics
  async getGroupStats(): Promise<ApiResponse<GroupStats>> {
    return api.get('/api/groups/stats');
  },

  async getGroupActivity(groupId?: number, limit: number = 20): Promise<ApiResponse<GroupActivity[]>> {
    const params = new URLSearchParams();
    if (groupId) params.append('groupId', groupId.toString());
    params.append('limit', limit.toString());

    return api.get(`/api/groups/activity?${params.toString()}`);
  },

  // Bulk Operations
  async bulkAddMembers(groupIds: number[], userIds: string[], role: GroupRole = GroupRole.MEMBER): Promise<ApiResponse<void>> {
    return api.post('/api/groups/bulk/add-members', { groupIds, userIds, role });
  },

  async bulkRemoveMembers(groupIds: number[], userIds: string[]): Promise<ApiResponse<void>> {
    return api.post('/api/groups/bulk/remove-members', { groupIds, userIds });
  },

  async exportGroupMembers(groupId: number, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await fetch(`/api/groups/${groupId}/export?format=${format}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },

  // Search Users
  async searchUsers(query: string, excludeGroupId?: number): Promise<ApiResponse<User[]>> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (excludeGroupId) params.append('excludeGroup', excludeGroupId.toString());

    return api.get(`/api/users/search?${params.toString()}`);
  }
};