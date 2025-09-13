import React, { useState } from 'react';
import { ParsedRow, ImportError } from '@/schemas/importSchema';
import { ChevronDown, ChevronRight, AlertTriangle, Download, Eye, EyeOff } from 'lucide-react';

interface ImportErrorPanelProps {
  data: ParsedRow[];
  className?: string;
}

export const ImportErrorPanel: React.FC<ImportErrorPanelProps> = ({ data, className = '' }) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);

  const invalidRows = data.filter(row => !row.isValid);
  const displayRows = showOnlyErrors ? invalidRows : data;

  const toggleRowExpansion = (rowNumber: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowNumber)) {
      newExpanded.delete(rowNumber);
    } else {
      newExpanded.add(rowNumber);
    }
    setExpandedRows(newExpanded);
  };

  const expandAll = () => {
    setExpandedRows(new Set(invalidRows.map(row => row.row)));
  };

  const collapseAll = () => {
    setExpandedRows(new Set());
  };

  const downloadErrorReport = () => {
    const errorData = invalidRows.map(row => ({
      Row: row.row,
      Topic: row.parsed.Topic,
      Level: row.parsed.Level,
      Type: row.parsed.Type,
      Text: row.parsed.Text.substring(0, 50) + (row.parsed.Text.length > 50 ? '...' : ''),
      Errors: row.errors.map(err => `${err.field}: ${err.message}`).join('; ')
    }));

    const csvContent = [
      ['Row', 'Topic', 'Level', 'Type', 'Text', 'Errors'].join(','),
      ...errorData.map(row => [
        row.Row,
        `"${row.Topic}"`,
        row.Level,
        row.Type,
        `"${row.Text}"`,
        `"${row.Errors}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-errors-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (data.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">No data to validate yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Validation Results
          </h3>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
              {invalidRows.length} errors
            </span>
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              {data.filter(row => row.isValid).length} valid
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowOnlyErrors(!showOnlyErrors)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {showOnlyErrors ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
            {showOnlyErrors ? 'Show All' : 'Errors Only'}
          </button>

          {invalidRows.length > 0 && (
            <>
              <button
                onClick={expandAll}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Collapse All
              </button>
              <button
                onClick={downloadErrorReport}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
              >
                <Download className="h-3 w-3 mr-1" />
                Download Report
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error List */}
      {invalidRows.length === 0 ? (
        <div className="text-center py-8 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-green-800 font-medium">All rows are valid!</p>
            <p className="text-green-600 text-sm">Ready to proceed with import</p>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
          {displayRows.map((row) => (
            <div key={row.row} className={`p-4 ${row.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {!row.isValid && row.errors.length > 0 && (
                    <button
                      onClick={() => toggleRowExpansion(row.row)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {expandedRows.has(row.row) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-900">Row {row.row}</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-600">{row.parsed.Topic}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-600 capitalize">{row.parsed.Level}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-600">{row.parsed.Type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {row.isValid ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Valid
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      {row.errors.length} error{row.errors.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text Preview */}
              <div className="mt-2 text-sm text-gray-600 truncate">
                {row.parsed.Text}
              </div>

              {/* Expanded Error Details */}
              {expandedRows.has(row.row) && !row.isValid && (
                <div className="mt-4 pl-7 space-y-2">
                  {row.errors.map((error, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-red-800">{error.field}:</span>
                        <span className="text-sm text-red-700 ml-1">{error.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {showOnlyErrors && invalidRows.length === 0 && (
        <div className="text-center py-8">
          <p className="text-green-600 font-medium">No errors found!</p>
          <p className="text-green-500 text-sm">All rows passed validation</p>
        </div>
      )}
    </div>
  );
};