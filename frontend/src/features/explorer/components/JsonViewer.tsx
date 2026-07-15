import React from 'react';

interface JsonViewerProps {
  data: any;
  onClose: () => void;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, onClose }) => {
  return (
    <div className="fixed inset-y-0 right-0 w-1/3 bg-gray-900 text-white shadow-2xl p-6 overflow-y-auto z-50 transition-transform transform translate-x-0">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-xl font-bold">Raw Payload</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white focus:outline-none">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <pre className="text-sm font-mono whitespace-pre-wrap break-all text-green-400">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};
