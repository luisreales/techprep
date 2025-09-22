import { api } from '../api';
import {
  TemplateDto,
  CreateTemplateDto,
  UpdateTemplateDto,
  GroupDto,
  GroupDetailDto,
  CreateGroupDto,
  UpdateGroupDto,
  AssignmentDto,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  PaginatedResponse,
  ApiResponse,
  TemplateKind
} from '@/types/practiceInterview';

// Template Management API
export const practiceInterviewAdminApi = {
  // Templates
  async getTemplates(params: { page?: number; pageSize?: number; kind?: TemplateKind | string } = {}) {
    const { page = 1, pageSize = 10, kind } = params;
    const searchParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });

    if (kind) {
      searchParams.append('kind', kind.toString());
    }

    const response = await api.get<ApiResponse<PaginatedResponse<TemplateDto>>>(
      `/templates?${searchParams.toString()}`
    );
    return response.data;
  },

  async getTemplate(id: number) {
    const response = await api.get<ApiResponse<TemplateDto>>(`/templates/${id}`);
    return response.data;
  },

  async createTemplate(data: CreateTemplateDto) {
    const response = await api.post<ApiResponse<TemplateDto>>('/templates', data);
    return response.data;
  },

  async updateTemplate(id: number, data: UpdateTemplateDto) {
    const response = await api.put<ApiResponse<TemplateDto>>(`/templates/${id}`, data);
    return response.data;
  },

  async deleteTemplate(id: number) {
    const response = await api.delete<ApiResponse<object>>(`/templates/${id}`);
    return response.data;
  },

  async cloneTemplate(id: number, name: string) {
    const response = await api.post<ApiResponse<TemplateDto>>(
      `/templates/${id}/clone`,
      JSON.stringify(name),
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  },

  async previewTemplate(id: number) {
    const response = await api.get<ApiResponse<number>>(`/templates/${id}/preview`);
    return response.data;
  },

  // Groups
  async getGroups(page = 1, pageSize = 10) {
    const response = await api.get<ApiResponse<PaginatedResponse<GroupDto>>>(
      `/admin/groups?page=${page}&pageSize=${pageSize}`
    );
    return response.data;
  },

  async getGroup(id: number) {
    const response = await api.get<ApiResponse<GroupDetailDto>>(`/admin/groups/${id}`);
    return response.data;
  },

  async createGroup(data: CreateGroupDto) {
    const response = await api.post<ApiResponse<GroupDto>>('/admin/groups', data);
    return response.data;
  },

  async updateGroup(id: number, data: UpdateGroupDto) {
    const response = await api.put<ApiResponse<GroupDto>>(`/admin/groups/${id}`, data);
    return response.data;
  },

  async deleteGroup(id: number) {
    const response = await api.delete<ApiResponse<object>>(`/admin/groups/${id}`);
    return response.data;
  },

  async addUserToGroup(groupId: number, userId: string) {
    const response = await api.post<ApiResponse<object>>(`/admin/groups/${groupId}/members`, { userId });
    return response.data;
  },

  async removeUserFromGroup(groupId: number, userId: string) {
    const response = await api.delete<ApiResponse<object>>(`/admin/groups/${groupId}/members/${userId}`);
    return response.data;
  },

  // Assignments
  async getAssignments(params: { page?: number; pageSize?: number; templateId?: number; groupId?: number } = {}) {
    const { page = 1, pageSize = 10, templateId, groupId } = params;
    const searchParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    if (templateId) searchParams.append('templateId', templateId.toString());
    if (groupId) searchParams.append('groupId', groupId.toString());

    const response = await api.get<ApiResponse<PaginatedResponse<AssignmentDto>>>(
      `/admin/assignments?${searchParams.toString()}`
    );
    return response.data;
  },

  async getAssignment(id: number) {
    const response = await api.get<ApiResponse<AssignmentDto>>(`/admin/assignments/${id}`);
    return response.data;
  },

  async createAssignment(data: CreateAssignmentDto) {
    const response = await api.post<ApiResponse<AssignmentDto>>('/admin/assignments', data);
    return response.data;
  },

  async updateAssignment(id: number, data: UpdateAssignmentDto) {
    const response = await api.put<ApiResponse<AssignmentDto>>(`/admin/assignments/${id}`, data);
    return response.data;
  },

  async deleteAssignment(id: number) {
    const response = await api.delete<ApiResponse<object>>(`/admin/assignments/${id}`);
    return response.data;
  }
};

export default practiceInterviewAdminApi;
