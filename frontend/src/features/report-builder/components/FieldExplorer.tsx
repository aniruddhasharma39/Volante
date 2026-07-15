import React from 'react';
import { useDraggable } from '@dnd-kit/core';

interface FieldExplorerProps {
  fields: any[];
}

export const FieldExplorer: React.FC<FieldExplorerProps> = ({ fields }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Fields</h2>
        <input 
          type="text" 
          placeholder="Search fields..." 
          className="mt-2 w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {fields.map((field) => (
          <DraggableField key={field.id} field={field} />
        ))}
      </div>
    </div>
  );
};

const DraggableField = ({ field }: { field: any }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `field-${field.id}`,
    data: field
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className="p-2 bg-gray-50 border border-gray-200 rounded text-sm cursor-grab hover:bg-gray-100 flex items-center justify-between"
    >
      <span className="font-medium text-gray-700">{field.name}</span>
      <span className="text-xs text-gray-400">{field.type}</span>
    </div>
  );
};
