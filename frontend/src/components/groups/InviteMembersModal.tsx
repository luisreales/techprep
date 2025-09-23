import React, { useState } from 'react';
import { X, Mail, UserPlus } from 'lucide-react';
import { Group, GroupRole, groupsApi } from '@/services/groupsApi';

interface InviteMembersModalProps {
  group: Group;
  onClose: () => void;
  onMembersAdded: () => void;
}

const InviteMembersModal: React.FC<InviteMembersModalProps> = ({
  group,
  onClose,
  onMembersAdded
}) => {
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<string>('');
  const [role, setRole] = useState<GroupRole>(GroupRole.MEMBER);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emails.trim()) return;

    setLoading(true);
    try {
      const emailList = emails.split(',').map(email => email.trim()).filter(Boolean);
      const response = await groupsApi.inviteMembers(group.id, emailList, role);

      if (response.success) {
        onMembersAdded();
        onClose();
      }
    } catch (error) {
      console.error('Failed to invite members:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <UserPlus size={20} />
                Invite Members to {group.name}
              </h2>
              <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Addresses *
              </label>
              <textarea
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Enter email addresses separated by commas..."
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Separate multiple email addresses with commas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as GroupRole)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={GroupRole.MEMBER}>Member</option>
                <option value={GroupRole.MODERATOR}>Moderator</option>
                <option value={GroupRole.ADMIN}>Admin</option>
              </select>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !emails.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Invitations'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMembersModal;