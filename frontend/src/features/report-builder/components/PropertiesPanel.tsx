import React from 'react';

interface PropertiesPanelProps {
  selectedColumn: any;
  onUpdateColumn: (col: any) => void;
  onRemoveColumn: (colId: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedColumn, onUpdateColumn, onRemoveColumn }) => {
  if (!selectedColumn) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 h-full p-6 flex flex-col items-center justify-center text-gray-400">
        <p className="text-sm text-center">Select a column in the canvas to view its properties.</p>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-l border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-medium text-gray-900">Properties</h2>
        <button 
          onClick={() => onRemoveColumn(selectedColumn.id)}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Remove
        </button>
      </div>
      
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700">Display Name</label>
          <input 
            type="text" 
            value={selectedColumn.name}
            onChange={(e) => onUpdateColumn({ ...selectedColumn, name: e.target.value })}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Aggregation</label>
          <select 
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedColumn.aggregation || 'NONE'}
            onChange={(e) => onUpdateColumn({ ...selectedColumn, aggregation: e.target.value })}
          >
            <option value="NONE">None</option>
            <option value="SUM">Sum</option>
            <option value="AVG">Average</option>
            <option value="COUNT">Count</option>
            <option value="MIN">Minimum</option>
            <option value="MAX">Maximum</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Format</label>
          <input 
            type="text" 
            placeholder="e.g. $0,0.00"
            value={selectedColumn.format || ''}
            onChange={(e) => onUpdateColumn({ ...selectedColumn, format: e.target.value })}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>
    </div>
  );
};
