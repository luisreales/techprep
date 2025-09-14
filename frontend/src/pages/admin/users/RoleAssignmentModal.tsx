import React, { useState, useEffect } from 'react';
import { X, Settings, AlertTriangle } from 'lucide-react';
import { AdminUser } from '@/types/adminUsers';
import { useSetUserRoles } from '@/hooks/useAdminUsers';

interface RoleAssignmentModalProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_ROLES = ['Admin', 'Student'];

export const RoleAssignmentModal: React.FC<RoleAssignmentModalProps> = ({
  user,
  isOpen,
  onClose
}) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles);
  const setUserRolesMutation = useSetUserRoles();

  useEffect(() => {
    if (isOpen) {
      setSelectedRoles(user.roles);
    }
  }, [isOpen, user.roles]);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRoles.length === 0) {
      return; // Don't allow users with no roles
    }

    try {
      await setUserRolesMutation.mutateAsync({
        id: user.id,
        roles: selectedRoles
      });
      onClose();
    } catch (error) {
      console.error('Failed to update user roles:', error);
    }
  };

  const hasChanges = JSON.stringify(selectedRoles.sort()) !== JSON.stringify(user.roles.sort());
  const removingAdmin = user.roles.includes('Admin') && !selectedRoles.includes('Admin');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Manage User Roles</h2>
              <p className="text-sm text-gray-600">{user.firstName} {user.lastName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Assign Roles
              </label>
              <div className="space-y-2">
                {AVAILABLE_ROLES.map((role) => (
                  <label
                    key={role}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role)}
                      onChange={() => handleRoleToggle(role)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{role}</div>
                      <div className="text-xs text-gray-500">
                        {role === 'Admin' 
                          ? 'Full access to admin panel and user management'
                          : 'Access to learning resources and practice sessions'
                        }
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {selectedRoles.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">
                  Users must have at least one role assigned.
                </p>
              </div>
            )}

            {removingAdmin && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  You are removing Admin role from this user. They will lose access to the admin panel.
                </p>
              </div>
            )}

            <div className="text-xs text-gray-500">
              Current roles: {user.roles.join(', ')}
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hasChanges || selectedRoles.length === 0 || setUserRolesMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {setUserRolesMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </div>
              ) : (
                'Update Roles'
              )}
            </button>
          </div>
        </form>

        {setUserRolesMutation.error && (
          <div className="p-4 mx-6 mb-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              {setUserRolesMutation.error.message || 'Failed to update user roles'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};