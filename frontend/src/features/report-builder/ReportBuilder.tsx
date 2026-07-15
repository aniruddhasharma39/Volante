import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DndContext, type DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { FieldExplorer } from './components/FieldExplorer';
import { ReportCanvas } from './components/ReportCanvas';
import { PropertiesPanel } from './components/PropertiesPanel';

import { PreviewConsole } from '../report-center/components/PreviewConsole';

export const ReportBuilder = () => {
  const [columns, setColumns] = useState<any[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<any | null>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [reportName, setReportName] = useState('New Report Template');
  const [saving, setSaving] = useState(false);
  const [schemaContext, setSchemaContext] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await api.get('/schema-registry');
        if (response.data && response.data.data) {
          const schemas = response.data.data;
          if (schemas.length > 0) {
            const schema = schemas[0];
            setSchemaContext({
              schemaId: schema._id,
              dataSourceId: schema.dataSourceId?._id || schema.dataSourceId
            });
            const allFields = schema.fields.map((f: any) => ({
              id: f.path, // Use JSON path as the ID so Execution Engine knows how to extract data
              name: f.fieldName,
              type: f.dataType,
              path: f.path
            }));
            setFields(allFields);
          }
        }
      } catch (error) {
        console.error('Failed to fetch schema fields', error);
      }
    };
    fetchFields();
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && over.id === 'report-canvas') {
      const field = active.data.current;
      if (field && !columns.find(c => c.id === field.id)) {
        const newCol = { ...field, aggregation: 'NONE', format: '' };
        setColumns([...columns, newCol]);
        setSelectedColumn(newCol);
      }
    }
  };

  const updateColumn = (updatedCol: any) => {
    setColumns(columns.map(c => c.id === updatedCol.id ? updatedCol : c));
    if (selectedColumn?.id === updatedCol.id) {
      setSelectedColumn(updatedCol);
    }
  };

  const removeColumn = (id: string) => {
    setColumns(columns.filter(c => c.id !== id));
    if (selectedColumn?.id === id) setSelectedColumn(null);
  };

  const getPayload = () => {
    const payloadColumns = columns.map((c, idx) => ({
      fieldId: c.id,
      displayName: c.name,
      aggregation: c.aggregation || 'NONE',
      format: c.format || '',
      order: idx,
      sortDirection: c.sortDirection || 'NONE'
    }));

    const payloadFilters = columns
      .filter(c => c.filterOperator)
      .map(c => {
        let val = c.filterValue;
        if (c.filterOperator === 'BETWEEN') {
          val = { min: c.filterValue, max: c.filterValueMax };
        }
        return {
          fieldId: c.id,
          operator: c.filterOperator,
          value: val,
          isRuntimePrompt: false
        };
      });

    return { columns: payloadColumns, filters: payloadFilters };
  };

  const handleSave = async () => {
    if (columns.length === 0) {
      alert('Please add at least one column to the report.');
      return;
    }
    if (!schemaContext) {
      alert('Schema context is missing. Cannot save.');
      return;
    }
    setSaving(true);
    try {
      const { columns: payloadColumns, filters: payloadFilters } = getPayload();
      
      const response = await api.post('/report-builder', {
        reportName,
        description: 'Dynamically built report',
        dataSourceId: schemaContext.dataSourceId,
        schemaId: schemaContext.schemaId,
        columns: payloadColumns,
        filters: payloadFilters,
        status: 'Draft'
      });
      if (response.data.success) {
        alert('Report saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save report', error);
      alert('Failed to save report. See console for details.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (columns.length === 0) {
      alert('Please add at least one column to preview.');
      return;
    }
    setShowPreview(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] -mt-6 -mx-8">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <input 
            type="text" 
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="text-xl font-semibold text-gray-900 border-none focus:ring-0 p-0 hover:bg-gray-50 rounded"
          />
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Template'}
        </button>
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 overflow-hidden">
        <FieldExplorer fields={fields} />
        <ReportCanvas 
          columns={columns} 
          onSelectColumn={setSelectedColumn} 
          onPreview={handlePreview}
          onSave={handleSave}
        />
        <PropertiesPanel 
          selectedColumn={selectedColumn} 
          onUpdateColumn={updateColumn}
          onRemoveColumn={removeColumn}
        />
        </div>
      </DndContext>

      {showPreview && schemaContext && (
        <PreviewConsole 
          previewConfig={{
            dataSourceId: schemaContext.dataSourceId,
            schemaId: schemaContext.schemaId,
            ...getPayload()
          }}
          onClose={() => setShowPreview(false)} 
        />
      )}
    </div>
  );
};
