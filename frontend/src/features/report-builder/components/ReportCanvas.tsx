import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface ReportCanvasProps {
  columns: any[];
  onSelectColumn: (col: any) => void;
}

export const ReportCanvas: React.FC<ReportCanvasProps> = ({ columns, onSelectColumn }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'report-canvas',
  });

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Untitled Report</h2>
          <div className="space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Preview</button>
            <button className="px-4 py-2 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Save Report</button>
          </div>
        </div>
      </div>
      
      <div 
        ref={setNodeRef}
        className={`flex-1 p-8 overflow-y-auto ${isOver ? 'bg-blue-50' : ''}`}
      >
        <div className="bg-white shadow rounded-lg min-h-[400px] p-6 border-2 border-dashed border-gray-300">
          {columns.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 mt-20">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="mt-2 text-sm">Drag and drop fields here to build your report</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map(col => (
                      <th 
                        key={col.id} 
                        onClick={() => onSelectColumn(col)}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    {columns.map(col => (
                      <td key={col.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">Data Preview...</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
