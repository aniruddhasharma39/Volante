import React, { useEffect, useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import api from '../../../services/api';

interface PreviewConsoleProps {
  reportId?: string;
  previewConfig?: any;
  onClose: () => void;
}

export const PreviewConsole: React.FC<PreviewConsoleProps> = ({ reportId, previewConfig, onClose }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [reportInfo, setReportInfo] = useState<any>(null);

  // Runtime Filters State
  const [runtimeFilters, setRuntimeFilters] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [savingFilters, setSavingFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, [reportId, previewConfig]);

  const fetchData = async (currentFilters = runtimeFilters) => {
    setLoading(true);
    try {
      let res;
      if (previewConfig) {
        // We inject the filters directly for live preview
        const combinedConfig = { ...previewConfig, filters: [...(previewConfig.filters || []), ...currentFilters] };
        res = await api.post('/execute/preview', combinedConfig);
        if (res.data.success) {
          setData(res.data.data.data);
          setReportInfo({ reportName: 'Unsaved Live Preview', columns: combinedConfig.columns });
        }
      } else if (reportId) {
        res = await api.post(`/execute/${reportId}`, { runtimeFilters: currentFilters });
        if (res.data.success) {
          setData(res.data.data.data);
          setReportInfo(res.data.data);
          if (currentFilters.length === 0 && res.data.data.filters) {
            // init from saved filters on first load
            setRuntimeFilters(res.data.data.filters);
          }
        }
      }
    } catch (error) {
      console.error('Execution failed', error);
      alert('Failed to execute report.');
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    if (!reportId) return;
    setSavingFilters(true);
    try {
      await api.put(`/report-builder/${reportId}/filters`, { filters: runtimeFilters });
      alert('Report configuration saved successfully! Future executions will use these filters.');
    } catch (error) {
      console.error('Failed to save configuration', error);
      alert('Failed to save configuration.');
    } finally {
      setSavingFilters(false);
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(() => {
    if (data.length === 0) return [];
    
    return Object.keys(data[0]).map(key => ({
      id: key,
      header: key,
      accessorFn: (row: any) => row[key],
      cell: info => info.getValue()?.toString() || ''
    }));
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const availableColumns = reportInfo?.columns || [];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex flex-col items-center p-6 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Report Preview: {reportInfo?.reportName}</h2>
            <p className="text-sm text-gray-500 mt-1">Generated {data.length} records instantly via Execution Engine</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200 bg-white">
          <div className="flex space-x-4 flex-1 max-w-md">
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
              placeholder="Search all columns globally..."
            />
          </div>
          <div className="flex space-x-3 items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Advanced Filters ({runtimeFilters.length})
            </button>
            {reportId && (
              <button
                onClick={saveConfiguration}
                disabled={savingFilters}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
              >
                {savingFilters ? 'Saving...' : 'Save Configuration'}
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-900">Runtime Filters</h3>
              <button
                onClick={() => setRuntimeFilters([...runtimeFilters, { fieldId: '', operator: 'EQUALS', value: '' }])}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                + Add Filter
              </button>
            </div>
            
            {runtimeFilters.length === 0 && (
              <p className="text-sm text-gray-500 italic">No advanced filters applied.</p>
            )}

            <div className="space-y-3">
              {runtimeFilters.map((filter, idx) => (
                <div key={idx} className="flex items-center space-x-3 bg-white p-3 rounded shadow-sm border border-gray-200">
                  <select
                    value={filter.fieldId}
                    onChange={e => {
                      const newFilters = [...runtimeFilters];
                      newFilters[idx].fieldId = e.target.value;
                      setRuntimeFilters(newFilters);
                    }}
                    className="block w-1/4 rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Field</option>
                    {availableColumns.map((col: any) => (
                      <option key={col.fieldId} value={col.fieldId}>{col.displayName}</option>
                    ))}
                  </select>
                  
                  <select
                    value={filter.operator}
                    onChange={e => {
                      const newFilters = [...runtimeFilters];
                      newFilters[idx].operator = e.target.value;
                      setRuntimeFilters(newFilters);
                    }}
                    className="block w-1/4 rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="EQUALS">Equals</option>
                    <option value="NOT_EQUALS">Not Equals</option>
                    <option value="CONTAINS">Contains</option>
                    <option value="GREATER_THAN">Greater Than</option>
                    <option value="LESS_THAN">Less Than</option>
                    <option value="BETWEEN">Between (Range)</option>
                  </select>
                  
                  {filter.operator === 'BETWEEN' ? (
                    <div className="flex space-x-2 w-2/4">
                      <input
                        type="text"
                        placeholder="Min"
                        value={filter.value?.min || ''}
                        onChange={e => {
                          const newFilters = [...runtimeFilters];
                          newFilters[idx].value = { ...newFilters[idx].value, min: e.target.value };
                          setRuntimeFilters(newFilters);
                        }}
                        className="block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Max"
                        value={filter.value?.max || ''}
                        onChange={e => {
                          const newFilters = [...runtimeFilters];
                          newFilters[idx].value = { ...newFilters[idx].value, max: e.target.value };
                          setRuntimeFilters(newFilters);
                        }}
                        className="block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Value"
                      value={filter.value || ''}
                      onChange={e => {
                        const newFilters = [...runtimeFilters];
                        newFilters[idx].value = e.target.value;
                        setRuntimeFilters(newFilters);
                      }}
                      className="block w-2/4 rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  )}
                  
                  <button
                    onClick={() => {
                      const newFilters = runtimeFilters.filter((_, i) => i !== idx);
                      setRuntimeFilters(newFilters);
                    }}
                    className="text-red-500 hover:text-red-700 focus:outline-none"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => fetchData(runtimeFilters)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Table Container */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100 relative">
          {loading && (
             <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex justify-center pt-20 z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
             </div>
          )}
          <div className="align-middle inline-block min-w-full shadow overflow-hidden sm:rounded-lg border-b border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      >
                        <div className="flex items-center space-x-1">
                          <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                          <span className="text-gray-400">
                            {{
                              asc: ' ↑',
                              desc: ' ↓',
                            }[header.column.getIsSorted() as string] ?? null}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-blue-50 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {data.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                No data returned by execution engine.
              </div>
            )}
          </div>
        </div>

        {/* Footer Pagination */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Previous</button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Next</button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to <span className="font-medium">{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)}</span> of <span className="font-medium">{data.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
