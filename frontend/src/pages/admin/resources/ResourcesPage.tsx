import React, { useState, useMemo } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ResourcesTable } from '@/components/admin/resources/ResourcesTable';
import { ResourceFilters } from '@/components/admin/resources/ResourceFilters';
import { ResourceForm } from '@/components/admin/resources/ResourceForm';
import { adminResourcesApi } from '@/services/admin/resourcesApi';
import { topicsApi } from '@/services/admin/topicsApi';
import { ResourceFilters as ResourceFiltersType, ResourceDetail, ResourceListItem } from '@/types/resources';
import { ResourceFormData } from '@/schemas/resourceSchema';
import type { RowSelectionState } from '@tanstack/react-table';

export const ResourcesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ResourceFiltersType>({
    page: 1,
    pageSize: 10,
    sort: 'createdAt_desc',
  });
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceDetail | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  // Queries
  const { data: resourcesData, isLoading: resourcesLoading, error: resourcesError } = useQuery({
    queryKey: ['admin-resources', filters],
    queryFn: () => adminResourcesApi.getResources(filters),
  });

  const { data: topicsResponse } = useQuery({
    queryKey: ['admin-topics'],
    queryFn: () => topicsApi.list(),
  });

  const topics = topicsResponse?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: adminResourcesApi.createResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ResourceFormData }) => 
      adminResourcesApi.updateResource(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminResourcesApi.deleteResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => adminResourcesApi.bulkDeleteResources(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      setSelectedRows({});
    },
  });

  // Event handlers
  const handleFiltersChange = (newFilters: ResourceFiltersType) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      pageSize: 10,
      sort: 'createdAt_desc',
    });
  };

  const handleCreate = () => {
    setEditingResource(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  };

  const handleEdit = async (resource: ResourceListItem) => {
    try {
      // Fetch detailed resource data for editing
      const detailData = await adminResourcesApi.getResource(resource.id);
      setEditingResource(detailData);
      setIsViewMode(false);
      setIsFormOpen(true);
    } catch (error) {
      console.error('Failed to fetch resource details for editing:', error);
      // For now, use the list data as fallback
      setEditingResource(resource as any);
      setIsViewMode(false);
      setIsFormOpen(true);
    }
  };

  const handleView = async (resource: ResourceListItem) => {
    try {
      // Fetch detailed resource data for viewing
      const detailData = await adminResourcesApi.getResource(resource.id);
      setEditingResource(detailData);
      setIsViewMode(true);
      setIsFormOpen(true);
    } catch (error) {
      console.error('Failed to fetch resource details for viewing:', error);
      // For now, use the list data as fallback
      setEditingResource(resource as any);
      setIsViewMode(true);
      setIsFormOpen(true);
    }
  };

  const handleDelete = async (resource: ResourceListItem) => {
    if (window.confirm(`Are you sure you want to delete "${resource.title}"?`)) {
      try {
        await deleteMutation.mutateAsync(resource.id);
      } catch (error) {
        console.error('Failed to delete resource:', error);
      }
    }
  };

  const handleBulkDelete = async (resources: ResourceListItem[]) => {
    if (window.confirm(`Are you sure you want to delete ${resources.length} resource(s)?`)) {
      try {
        const ids = resources.map(r => r.id);
        await bulkDeleteMutation.mutateAsync(ids);
      } catch (error) {
        console.error('Failed to bulk delete resources:', error);
      }
    }
  };

  const handleFormSubmit = async (data: ResourceFormData) => {
    try {
      if (editingResource) {
        await updateMutation.mutateAsync({ id: editingResource.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setIsFormOpen(false);
      setEditingResource(null);
    } catch (error) {
      console.error('Failed to save resource:', error);
      throw error; // Re-throw to let form handle the error
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingResource(null);
    setIsViewMode(false);
  };

  if (resourcesError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-semibold text-red-700">Error Loading Resources</h2>
        </div>
        <p className="mt-2 text-red-600">
          Failed to load resources. Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage learning resources for questions and topics
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Resource
        </button>
      </div>

      {/* Filters */}
      <ResourceFilters
        filters={filters}
        topics={topics}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Resources Table */}
      <ResourcesTable
        data={resourcesData?.resources || []}
        loading={resourcesLoading}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
      />

      {/* Form Modal */}
      <ResourceForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        resource={editingResource}
        topics={topics}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
        viewMode={isViewMode}
      />
    </div>
  );
};