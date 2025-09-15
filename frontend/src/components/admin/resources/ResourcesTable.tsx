import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table';
import { ResourceListItem, ResourceKind, ResourceDifficulty } from '@/types/resources';
import { 
  ChevronUp, 
  ChevronDown, 
  Edit, 
  Eye, 
  Trash2, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Book,
  Video,
  FileText,
  Star,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ResourcesTableProps {
  data: ResourceListItem[];
  loading?: boolean;
  onEdit: (resource: ResourceListItem) => void;
  onView: (resource: ResourceListItem) => void;
  onDelete: (resource: ResourceListItem) => void;
  onBulkDelete: (resources: ResourceListItem[]) => void;
  selectedRows: RowSelectionState;
  onSelectionChange: (selection: RowSelectionState) => void;
}

const kindIcons = {
  [ResourceKind.Book]: Book,
  [ResourceKind.Video]: Video,
  [ResourceKind.Article]: FileText,
};

const kindLabels = {
  [ResourceKind.Book]: 'Book',
  [ResourceKind.Video]: 'Video',
  [ResourceKind.Article]: 'Article',
};

const difficultyLabels = {
  [ResourceDifficulty.Basic]: 'Basic',
  [ResourceDifficulty.Medium]: 'Medium',
  [ResourceDifficulty.Hard]: 'Hard',
};

const difficultyColors = {
  [ResourceDifficulty.Basic]: 'bg-green-100 text-green-800 border-green-200',
  [ResourceDifficulty.Medium]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [ResourceDifficulty.Hard]: 'bg-red-100 text-red-800 border-red-200',
};

const KindBadge: React.FC<{ kind: string }> = ({ kind }) => {
  const kindEnum = kind as ResourceKind;
  const IconComponent = kindIcons[kindEnum];
  
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
      <IconComponent className="h-3 w-3" />
      {kindLabels[kindEnum] || kind}
    </div>
  );
};

const DifficultyBadge: React.FC<{ difficulty?: string }> = ({ difficulty }) => {
  if (!difficulty) return <span className="text-gray-400">-</span>;
  
  const difficultyEnum = difficulty as ResourceDifficulty;
  const colorClass = difficultyColors[difficultyEnum] || 'bg-gray-100 text-gray-800 border-gray-200';
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      {difficultyLabels[difficultyEnum] || difficulty}
    </span>
  );
};

const RatingDisplay: React.FC<{ rating?: number }> = ({ rating }) => {
  if (!rating) return <span className="text-gray-400">-</span>;
  
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < Math.floor(rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export const ResourcesTable: React.FC<ResourcesTableProps> = ({
  data,
  loading = false,
  onEdit,
  onView,
  onDelete,
  onBulkDelete,
  selectedRows,
  onSelectionChange,
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const columns = React.useMemo<ColumnDef<ResourceListItem>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'title',
        header: 'Resource',
        cell: ({ row }) => (
          <div className="min-w-0 max-w-xs">
            <div className="flex items-center gap-2">
              <a
                href={row.original.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 truncate"
                title={row.original.title}
              >
                <span className="truncate">{row.original.title}</span>
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
            </div>
            {row.original.author && (
              <div className="text-xs text-gray-500 mt-1 truncate" title={row.original.author}>
                by {row.original.author}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'kind',
        header: 'Type',
        cell: ({ row }) => <KindBadge kind={row.original.kind} />,
        filterFn: 'equals',
      },
      {
        accessorKey: 'difficulty',
        header: 'Difficulty',
        cell: ({ row }) => <DifficultyBadge difficulty={row.original.difficulty} />,
        filterFn: 'equals',
      },
      {
        accessorKey: 'rating',
        header: 'Rating',
        cell: ({ row }) => <RatingDisplay rating={row.original.rating} />,
      },
      {
        accessorKey: 'topics',
        header: 'Topics',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {row.original.topics.slice(0, 2).map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                title={topic}
              >
                {topic.length > 12 ? `${topic.substring(0, 12)}...` : topic}
              </span>
            ))}
            {row.original.topics.length > 2 && (
              <span className="text-xs text-gray-500" title={row.original.topics.slice(2).join(', ')}>
                +{row.original.topics.length - 2} more
              </span>
            )}
          </div>
        ),
        enableSorting: false,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="View Details"
              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              onClick={() => onView(row.original)}
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Edit Resource"
              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
              onClick={() => onEdit(row.original)}
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Delete Resource"
              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              onClick={() => onDelete(row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [onEdit, onView, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection: selectedRows,
    },
    enableRowSelection: true,
    onRowSelectionChange: onSelectionChange,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const selectedRowsCount = Object.keys(selectedRows).length;

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedRowsCount > 0 && (
        <div className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-md">
          <div className="text-sm text-blue-700">
            {selectedRowsCount} resource{selectedRowsCount === 1 ? '' : 's'} selected
          </div>
          <button
            type="button"
            onClick={() => {
              const selectedResources = table.getFilteredSelectedRowModel().rows.map(row => row.original);
              onBulkDelete(selectedResources);
            }}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700"
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center space-x-1 ${
                          header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ChevronUp className="h-4 w-4" />,
                          desc: <ChevronDown className="h-4 w-4" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center">
                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  No resources found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-gray-700">
          Showing <span className="font-medium">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to{' '}
          <span className="font-medium">
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getPreFilteredRowModel().rows.length)}
          </span>{' '}
          of <span className="font-medium">{table.getPreFilteredRowModel().rows.length}</span> results
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-700">
            Page <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> of{' '}
            <span className="font-medium">{table.getPageCount()}</span>
          </span>
          <button
            type="button"
            className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};