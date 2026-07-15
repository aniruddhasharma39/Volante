import React, { useEffect, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import api from '../../services/api';
import { JsonViewer } from './components/JsonViewer';

export const PaymentExplorer = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/explorer/browse?schemaName=pacs.008');
      setData(res.data.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: 'Message ID',
        accessorKey: 'MsgId',
      },
      {
        header: 'Date/Time',
        accessorKey: 'CreDtTm',
        cell: (info) => new Date(info.getValue() as string).toLocaleString(),
      },
      {
        header: 'Amount',
        accessorFn: (row) => `${row.IntrBkSttlmAmt?.currency} ${row.IntrBkSttlmAmt?.value}`,
      },
      {
        header: 'Status',
        accessorKey: 'Sts',
        cell: (info) => (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            info.getValue() === 'ACCP' ? 'bg-green-100 text-green-800' :
            info.getValue() === 'RJCT' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {info.getValue() as string}
          </span>
        )
      },
      {
        header: 'Debtor',
        accessorKey: 'Dbtr.Nm',
      },
      {
        id: 'actions',
        cell: (info) => (
          <button
            onClick={() => setSelectedRow(info.row.original)}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            View Payload
          </button>
        )
      }
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="relative">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Payment Explorer</h1>
          <p className="mt-2 text-sm text-gray-700">Browse and inspect incoming payment messages.</p>
        </div>
      </div>

      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading data...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedRow && (
        <JsonViewer data={selectedRow} onClose={() => setSelectedRow(null)} />
      )}
    </div>
  );
};
