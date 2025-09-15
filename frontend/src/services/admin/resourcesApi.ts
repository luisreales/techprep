import { http } from '@/utils/axios';
import { ApiResponse } from '@/types/api';
import type {
  ResourceDetail,
  ResourceListItem,
  ResourceCreateDto,
  ResourceUpdateDto,
  ResourceFilters
} from '@/types/resources';

interface ResourcesListResponse {
  items: ResourceListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const adminResourcesApi = {
  // List resources with filters and pagination
  async getResources(filters: ResourceFilters = {}): Promise<ResourcesListResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.kind) params.append('kind', filters.kind);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.topicId) params.append('topicId', filters.topicId.toString());
    if (filters.minRating) params.append('minRating', filters.minRating.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.sort) params.append('sort', filters.sort);
    
    const { data } = await http.get<ApiResponse<ResourcesListResponse>>(
      `/admin/resources?${params.toString()}`
    );
    
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to fetch resources');
    }
    
    return data.data;
  },

  // Get detailed resource information
  async getResourceById(id: number): Promise<ResourceDetail> {
    const { data } = await http.get<ApiResponse<ResourceDetail>>(`/admin/resources/${id}`);
    
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to fetch resource details');
    }
    
    return data.data;
  },

  // Create a new resource
  async createResource(resource: ResourceCreateDto): Promise<ResourceDetail> {
    const { data } = await http.post<ApiResponse<ResourceDetail>>(
      '/admin/resources',
      resource
    );
    
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to create resource');
    }
    
    return data.data;
  },

  // Update an existing resource
  async updateResource(id: number, resource: ResourceUpdateDto): Promise<ResourceDetail> {
    const { data } = await http.put<ApiResponse<ResourceDetail>>(
      `/admin/resources/${id}`,
      resource
    );
    
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to update resource');
    }
    
    return data.data;
  },

  // Delete a resource
  async deleteResource(id: number): Promise<void> {
    const { data } = await http.delete<ApiResponse<void>>(`/admin/resources/${id}`);
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete resource');
    }
  },

  // Associate resource with questions
  async associateWithQuestions(resourceId: number, questionIds: string[]): Promise<void> {
    const { data } = await http.post<ApiResponse<void>>(
      `/admin/resources/${resourceId}/questions`,
      { questionIds }
    );
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to associate resource with questions');
    }
  },

  // Remove resource association with questions
  async removeFromQuestions(resourceId: number, questionIds: string[]): Promise<void> {
    const { data } = await http.delete<ApiResponse<void>>(
      `/admin/resources/${resourceId}/questions`,
      { data: { questionIds } }
    );
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to remove resource associations');
    }
  },

  // Bulk delete resources
  async bulkDeleteResources(ids: number[]): Promise<void> {
    const { data } = await http.delete<ApiResponse<void>>('/admin/resources/bulk', {
      data: { ids }
    });
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to bulk delete resources');
    }
  },

  // Alias for getResourceById to maintain compatibility
  getResource: function(id: number) {
    return this.getResourceById(id);
  }
};