import React, { useState } from 'react';
import { X, Shield, ShieldOff, AlertTriangle } from 'lucide-react';
import { AdminUser } from '@/types/adminUsers';
import { useSetUserBlocked } from '@/hooks/useAdminUsers';

interface BlockUserModalProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
}

export const BlockUserModal: React.FC<BlockUserModalProps> = ({
  user,
  isOpen,
  onClose
}) => {
  const [reason, setReason] = useState('');
  const setUserBlockedMutation = useSetUserBlocked();

  const isBlocking = user.status === 'Active';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await setUserBlockedMutation.mutateAsync({
        id: user.id,
        blocked: isBlocking,
        reason: isBlocking ? reason.trim() || undefined : undefined
      });
      onClose();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isBlocking ? 'bg-red-100' : 'bg-green-100'}`}>
              {isBlocking ? (
                <ShieldOff className="w-5 h-5 text-red-600" />
              ) : (
                <Shield className="w-5 h-5 text-green-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isBlocking ? 'Block User' : 'Unblock User'}
              </h2>
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
            <div className={`flex items-start gap-2 p-4 rounded-lg ${
              isBlocking ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
            }`}>
              <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                isBlocking ? 'text-red-600' : 'text-green-600'
              }`} />
              <div className="text-sm">
                {isBlocking ? (
                  <div>
                    <p className="font-medium text-red-800">Block this user account?</p>
                    <p className="text-red-700 mt-1">
                      The user will be logged out immediately and won't be able to sign in until unblocked.
                      All active sessions will be terminated.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-green-800">Unblock this user account?</p>
                    <p className="text-green-700 mt-1">
                      The user will regain access to their account and be able to sign in normally.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {isBlocking && (
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for blocking (optional)
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="e.g., Policy violation, suspicious activity..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This reason will be logged for audit purposes.
                </p>
              </div>
            )}

            <div className="text-xs text-gray-500">
              <strong>User:</strong> {user.email} • <strong>Current Status:</strong> {user.status}
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
              disabled={setUserBlockedMutation.isPending}
              className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isBlocking 
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                  : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              }`}
            >
              {setUserBlockedMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isBlocking ? 'Blocking...' : 'Unblocking...'}
                </div>
              ) : (
                isBlocking ? 'Block User' : 'Unblock User'
              )}
            </button>
          </div>
        </form>

        {setUserBlockedMutation.error && (
          <div className="p-4 mx-6 mb-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              {setUserBlockedMutation.error.message || 'Failed to update user status'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};