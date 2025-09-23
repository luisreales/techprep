import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Shield,
  Eye,
  Building,
  Crown,
  Star,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { Group, GroupDetail, GroupStats, GroupFilters, groupsApi } from '@/services/groupsApi';
import { useNotification } from '@/hooks/useNotification';
import CreateGroupModal from '@/components/groups/CreateGroupModal';
import GroupDetailsModal from '@/components/groups/GroupDetailsModal';
import InviteMembersModal from '@/components/groups/InviteMembersModal';
import GroupStatsPanel from '@/components/groups/GroupStatsPanel';

const GroupsManagement: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<GroupStats | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [filters, setFilters] = useState<GroupFilters>({
    page: 1,
    pageSize: 20
  });

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroupForDetails, setSelectedGroupForDetails] = useState<Group | null>(null);
  const [selectedGroupForInvite, setSelectedGroupForInvite] = useState<Group | null>(null);

  // Menu states
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const { showNotification } = useNotification();

  useEffect(() => {
    loadGroups();
    loadStats();
  }, [filters]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await groupsApi.getGroups(filters);
      if (response.success && response.data) {
        setGroups(response.data.groups);
        setTotalCount(response.data.totalCount);
      } else {
        showNotification('Error loading groups', 'error');
      }
    } catch (error) {
      showNotification('Failed to load groups', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await groupsApi.getGroupStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  const handleFilterChange = (newFilters: Partial<GroupFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }));
  };

  const handleGroupCreated = (newGroup: Group) => {
    setGroups(prev => [newGroup, ...prev]);
    setTotalCount(prev => prev + 1);
    showNotification('Group created successfully', 'success');
    loadStats();
  };

  const handleGroupUpdated = (updatedGroup: Group) => {
    setGroups(prev =>
      prev.map(g => g.id === updatedGroup.id ? updatedGroup : g)
    );
    showNotification('Group updated successfully', 'success');
  };

  const handleGroupDeleted = async (groupId: number) => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      await groupsApi.deleteGroup(groupId);
      setGroups(prev => prev.filter(g => g.id !== groupId));
      setTotalCount(prev => prev - 1);
      showNotification('Group deleted successfully', 'success');
      loadStats();
    } catch (error) {
      showNotification('Failed to delete group', 'error');
    }
  };

  const handleExportMembers = async (groupId: number, format: 'csv' | 'excel') => {
    try {
      const blob = await groupsApi.exportGroupMembers(groupId, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `group-${groupId}-members.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('Members exported successfully', 'success');
    } catch (error) {
      showNotification('Failed to export members', 'error');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown size={16} className="text-yellow-600" />;
      case 'admin': return <Shield size={16} className="text-red-600" />;
      case 'moderator': return <Star size={16} className="text-blue-600" />;
      default: return <Users size={16} className="text-gray-600" />;
    }
  };

  const totalPages = Math.ceil(totalCount / (filters.pageSize || 20));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Groups Management</h1>
          <p className="text-gray-600">
            Organize users into groups for collaborative learning and assessment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
          >
            <BarChart3 size={16} />
            {showStats ? 'Hide' : 'Show'} Stats
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Create Group
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && stats && (
        <GroupStatsPanel stats={stats} />
      )}

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search groups by name or description..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleFilterChange({ isActive: undefined })}
              className={`px-3 py-1 rounded text-sm ${
                filters.isActive === undefined ? 'bg-white shadow-sm' : ''
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange({ isActive: true })}
              className={`px-3 py-1 rounded text-sm ${
                filters.isActive === true ? 'bg-white shadow-sm' : ''
              }`}
            >
              Active
            </button>
            <button
              onClick={() => handleFilterChange({ isActive: false })}
              className={`px-3 py-1 rounded text-sm ${
                filters.isActive === false ? 'bg-white shadow-sm' : ''
              }`}
            >
              Inactive
            </button>
          </div>

          <button
            onClick={loadGroups}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Groups Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="animate-spin" size={24} />
            <span className="ml-2">Loading groups...</span>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search
                ? 'Try adjusting your search terms'
                : 'Get started by creating your first group'
              }
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Group
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Group
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Members
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {groups.map((group) => (
                    <tr key={group.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{group.name}</h3>
                          {group.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {group.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {group.organization ? (
                          <div className="flex items-center gap-2">
                            <Building size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-900">{group.organization.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No organization</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {group.memberCount}
                          </span>
                          <span className="text-sm text-gray-500">
                            member{group.memberCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          group.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {group.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(group.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(group.createdAt).toLocaleTimeString()}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === group.id ? null : group.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {openMenuId === group.id && (
                            <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button
                                onClick={() => {
                                  setSelectedGroupForDetails(group);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye size={14} />
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  // Handle edit
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit size={14} />
                                Edit Group
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedGroupForInvite(group);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <UserPlus size={14} />
                                Add Members
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedGroupForInvite(group);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Mail size={14} />
                                Send Invites
                              </button>
                              <hr className="my-1" />
                              <button
                                onClick={() => {
                                  handleExportMembers(group.id, 'csv');
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Download size={14} />
                                Export Members
                              </button>
                              <hr className="my-1" />
                              <button
                                onClick={() => {
                                  handleGroupDeleted(group.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 size={14} />
                                Delete Group
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {((filters.page || 1) - 1) * (filters.pageSize || 20) + 1} to{' '}
                  {Math.min((filters.page || 1) * (filters.pageSize || 20), totalCount)} of{' '}
                  {totalCount} groups
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                    disabled={(filters.page || 1) <= 1}
                    className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <span className="px-3 py-1">
                    Page {filters.page || 1} of {totalPages}
                  </span>

                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                    disabled={(filters.page || 1) >= totalPages}
                    className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}

      {selectedGroupForDetails && (
        <GroupDetailsModal
          group={selectedGroupForDetails}
          onClose={() => setSelectedGroupForDetails(null)}
          onGroupUpdated={handleGroupUpdated}
        />
      )}

      {selectedGroupForInvite && (
        <InviteMembersModal
          group={selectedGroupForInvite}
          onClose={() => setSelectedGroupForInvite(null)}
          onMembersAdded={() => {
            loadGroups();
            loadStats();
          }}
        />
      )}
    </div>
  );
};

export default GroupsManagement;