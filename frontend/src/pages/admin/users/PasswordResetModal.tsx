import React, { useState } from 'react';
import { X, Key, Copy, Check, AlertTriangle } from 'lucide-react';
import { AdminUser } from '@/types/adminUsers';
import { useResetUserPassword } from '@/hooks/useAdminUsers';

interface PasswordResetModalProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  user,
  isOpen,
  onClose
}) => {
  const [resetToken, setResetToken] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const resetPasswordMutation = useResetUserPassword();

  const handleGenerateToken = async () => {
    try {
      const token = await resetPasswordMutation.mutateAsync(user.id);
      setResetToken(token);
    } catch (error) {
      console.error('Failed to generate reset token:', error);
    }
  };

  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(resetToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy token:', error);
    }
  };

  const handleClose = () => {
    setResetToken('');
    setCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Reset Password</h2>
              <p className="text-sm text-gray-600">{user.firstName} {user.lastName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Generate Password Reset Token</p>
              <p className="text-amber-700 mt-1">
                This will generate a secure token that can be used to reset the user's password.
                The token should be shared securely with the user.
              </p>
            </div>
          </div>

          {!resetToken ? (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                Click the button below to generate a password reset token for this user.
              </p>
              <button
                onClick={handleGenerateToken}
                disabled={resetPasswordMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetPasswordMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </div>
                ) : (
                  'Generate Reset Token'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-2">
                  Password reset token generated successfully!
                </p>
                <p className="text-xs text-green-700">
                  Share this token securely with the user. They can use it to reset their password.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reset Token
                </label>
                <div className="flex items-center gap-2">
                  <textarea
                    value={resetToken}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleCopyToken}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check size={20} className="text-green-600" />
                    ) : (
                      <Copy size={20} />
                    )}
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 mt-1">Token copied to clipboard!</p>
                )}
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Important:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>This token is valid for a limited time</li>
                  <li>The user will need to use this token along with their email to reset their password</li>
                  <li>Keep this token secure and only share it through safe channels</li>
                </ul>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500">
            <strong>User:</strong> {user.email}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {resetToken ? 'Done' : 'Cancel'}
          </button>
        </div>

        {resetPasswordMutation.error && (
          <div className="p-4 mx-6 mb-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              {resetPasswordMutation.error.message || 'Failed to generate reset token'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};