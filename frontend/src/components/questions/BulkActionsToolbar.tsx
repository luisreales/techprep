import React, { useState } from 'react';
import {
  Trash2,
  Download,
  Edit3,
  Tag,
  Folder,
  CheckCircle,
  X,
  ChevronDown
} from 'lucide-react';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onAction: (action: string, data?: any) => void;
}

const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  onAction
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showUpdateMenu, setShowUpdateMenu] = useState(false);

  const handleExport = (format: 'json' | 'excel' | 'csv') => {
    onAction('export', { format });
    setShowExportMenu(false);
  };

  const handleUpdate = (updates: any) => {
    onAction('update', updates);
    setShowUpdateMenu(false);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-blue-800">
          <CheckCircle size={16} />
          <span className="font-medium">{selectedCount} question{selectedCount !== 1 ? 's' : ''} selected</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Update Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUpdateMenu(!showUpdateMenu)}
            className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Edit3 size={16} />
            <span>Update</span>
            <ChevronDown size={16} />
          </button>

          {showUpdateMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={() => handleUpdate({ isActive: true })}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <CheckCircle size={14} />
                Mark as Active
              </button>
              <button
                onClick={() => handleUpdate({ isActive: false })}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <X size={14} />
                Mark as Inactive
              </button>
              <button
                onClick={() => handleUpdate({ isVerified: true })}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <CheckCircle size={14} />
                Mark as Verified
              </button>
              <hr className="my-1" />
              <button
                onClick={() => {
                  // Open category assignment modal
                  setShowUpdateMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Folder size={14} />
                Assign Category
              </button>
              <button
                onClick={() => {
                  // Open tag assignment modal
                  setShowUpdateMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Tag size={14} />
                Add Tags
              </button>
            </div>
          )}
        </div>

        {/* Export Menu */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 border border-green-300 rounded-lg hover:bg-green-200"
          >
            <Download size={16} />
            <span>Export</span>
            <ChevronDown size={16} />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={() => handleExport('json')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                JSON
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                Excel
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                CSV
              </button>
            </div>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={() => {
            if (confirm(`Are you sure you want to delete ${selectedCount} question${selectedCount !== 1 ? 's' : ''}?`)) {
              onAction('delete');
            }
          }}
          className="px-3 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 flex items-center gap-2"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
};

export default BulkActionsToolbar;