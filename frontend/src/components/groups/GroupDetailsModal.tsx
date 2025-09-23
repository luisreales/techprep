import React, { useState, useEffect } from 'react';
import { X, Users, Crown, Shield, Star, UserMinus, Mail, Download } from 'lucide-react';
import { Group, GroupDetail, GroupMember, groupsApi } from '@/services/groupsApi';

interface GroupDetailsModalProps {
  group: Group;
  onClose: () => void;
  onGroupUpdated: (group: Group) => void;
}

const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({
  group,
  onClose,
  onGroupUpdated
}) => {
  const [loading, setLoading] = useState(true);
  const [groupDetails, setGroupDetails] = useState<GroupDetail | null>(null);

  useEffect(() => {
    loadGroupDetails();
  }, [group.id]);

  const loadGroupDetails = async () => {
    try {
      setLoading(true);
      const response = await groupsApi.getGroup(group.id);
      if (response.success && response.data) {
        setGroupDetails(response.data);
      }
    } catch (error) {
      console.error('Failed to load group details:', error);
    } finally {
      setLoading(false);
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{group.name}</h2>
              <p className="text-gray-600 mt-1">{group.description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading group details...</span>
            </div>
          ) : groupDetails ? (
            <div className="space-y-6">
              {/* Group Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{groupDetails.memberCount}</div>
                  <div className="text-sm text-gray-600">Total Members</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {groupDetails.isActive ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Date(groupDetails.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">Created</div>
                </div>
              </div>

              {/* Members List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Members</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                      <Mail size={14} className="inline mr-1" />
                      Invite Members
                    </button>
                    <button className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                      <Download size={14} className="inline mr-1" />
                      Export
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Member
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Joined
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {groupDetails.members.map((member) => (
                        <tr key={member.userId}>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">{member.userName}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {getRoleIcon(member.role)}
                              <span className={`px-2 py-1 text-xs rounded-full capitalize ${getRoleBadgeColor(member.role)}`}>
                                {member.role}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Remove member"
                            >
                              <UserMinus size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500">Failed to load group details</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetailsModal;