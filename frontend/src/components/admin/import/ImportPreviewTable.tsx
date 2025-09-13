import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ParsedRow } from '@/schemas/importSchema';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';

interface ImportPreviewTableProps {
  data: ParsedRow[];
  loading?: boolean;
  maxRows?: number;
}

export const ImportPreviewTable: React.FC<ImportPreviewTableProps> = ({
  data,
  loading = false,
  maxRows = 50
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Limit data for preview
  const previewData = data.slice(0, maxRows);

  const columns = React.useMemo<ColumnDef<ParsedRow>[]>(
    () => [
      {
        accessorKey: 'row',
        header: '#',
        size: 60,
        cell: ({ row }) => (
          <div className="font-medium text-gray-900">
            {row.original.row}
          </div>
        ),
      },
      {
        accessorKey: 'parsed.Topic',
        header: 'Topic',
        cell: ({ row }) => (
          <div className="max-w-32 truncate" title={row.original.parsed.Topic}>
            {row.original.parsed.Topic}
          </div>
        ),
      },
      {
        accessorKey: 'parsed.Level',
        header: 'Level',
        size: 100,
        cell: ({ row }) => (
          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
            row.original.parsed.Level === 'basic' ? 'bg-gray-100 text-gray-800' :
            row.original.parsed.Level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {row.original.parsed.Level}
          </span>
        ),
      },
      {
        accessorKey: 'parsed.Type',
        header: 'Type',
        size: 120,
        cell: ({ row }) => (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            row.original.parsed.Type === 'single_choice' ? 'bg-blue-100 text-blue-800' :
            row.original.parsed.Type === 'multi_choice' ? 'bg-purple-100 text-purple-800' :
            'bg-green-100 text-green-800'
          }`}>
            {row.original.parsed.Type.replace('_', ' ')}
          </span>
        ),
      },
      {
        accessorKey: 'parsed.Text',
        header: 'Question Text',
        cell: ({ row }) => (
          <div className="max-w-md truncate" title={row.original.parsed.Text}>
            {row.original.parsed.Text}
          </div>
        ),
      },
      {
        accessorKey: 'parsed.Options',
        header: 'Options',
        size: 100,
        cell: ({ row }) => {
          const optionsCount = row.original.parsed.Options
            ? row.original.parsed.Options.split(';').filter(Boolean).length
            : 0;
          
          if (row.original.parsed.Type === 'written') {
            return <span className="text-gray-400 text-xs">N/A</span>;
          }
          
          return (
            <div className="text-center">
              <span className="text-sm font-medium text-gray-900">{optionsCount}</span>
              <span className="text-xs text-gray-500 ml-1">opts</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'parsed.Correct',
        header: 'Correct',
        size: 100,
        cell: ({ row }) => {
          if (row.original.parsed.Type === 'written') {
            return <span className="text-gray-400 text-xs">N/A</span>;
          }
          
          const correct = row.original.parsed.Correct || '';
          return (
            <div className="text-center">
              <span className="text-sm font-medium text-gray-900">{correct}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'parsed.OfficialAnswer',
        header: 'Official Answer',
        size: 120,
        cell: ({ row }) => {
          if (row.original.parsed.Type !== 'written') {
            return <span className="text-gray-400 text-xs">N/A</span>;
          }
          
          const answer = row.original.parsed.OfficialAnswer || '';
          return (
            <div className="max-w-32 truncate text-xs" title={answer}>
              {answer.length > 0 ? answer : <span className="text-red-500">Missing</span>}
            </div>
          );
        },
      },
      {
        accessorKey: 'isValid',
        header: 'Status',
        size: 80,
        cell: ({ row }) => {
          const isValid = row.original.isValid;
          const errorCount = row.original.errors.length;
          
          return (
            <div className="flex items-center justify-center">
              {isValid ? (
                <div className="flex items-center text-green-600" title="Valid">
                  <CheckCircle className="h-4 w-4" />
                </div>
              ) : (
                <div className="flex items-center text-red-600" title={`${errorCount} error${errorCount !== 1 ? 's' : ''}`}>
                  <XCircle className="h-4 w-4" />
                  {errorCount > 1 && (
                    <span className="ml-1 text-xs font-medium">{errorCount}</span>
                  )}
                </div>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: previewData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-500">Processing Excel file...</p>
        </div>
      </div>
    );
  }

  if (previewData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          <p className="text-gray-500">No data to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Data Preview</h3>
            <p className="text-sm text-gray-500">
              Showing {Math.min(data.length, maxRows)} of {data.length} rows
              {data.length > maxRows && ` (limited to first ${maxRows} for preview)`}
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              {previewData.filter(row => row.isValid).length} valid
            </div>
            <div className="flex items-center">
              <XCircle className="h-4 w-4 text-red-600 mr-1" />
              {previewData.filter(row => !row.isValid).length} invalid
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200 bg-gray-50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-2 ${
                          header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="flex flex-col">
                            <ChevronUp
                              className={`h-3 w-3 ${
                                header.column.getIsSorted() === 'asc' ? 'text-gray-900' : 'text-gray-400'
                              }`}
                            />
                            <ChevronDown
                              className={`h-3 w-3 -mt-1 ${
                                header.column.getIsSorted() === 'desc' ? 'text-gray-900' : 'text-gray-400'
                              }`}
                            />
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr 
                key={row.id} 
                className={`hover:bg-gray-50 ${
                  !row.original.isValid ? 'bg-red-50' : ''
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4 whitespace-nowrap text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  previewData.length
                )}
              </span>{' '}
              of{' '}
              <span className="font-medium">{previewData.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};