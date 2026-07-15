import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DndContext, type DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { FieldExplorer } from './components/FieldExplorer';
import { ReportCanvas } from './components/ReportCanvas';
import { PropertiesPanel } from './components/PropertiesPanel';

export const ReportBuilder = () => {
  const [columns, setColumns] = useState<any[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<any | null>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [reportName, setReportName] = useState('New Report Template');
  const [saving, setSaving] = useState(false);
  const [schemaContext, setSchemaContext] = useState<any>(null);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await api.get('/schema-registry');
        if (response.data && response.data.data) {
          // Extract fields from the first schema (e.g. pacs.008) for the MVP report builder
          const schemas = response.data.data;
          if (schemas.length > 0) {
            const schema = schemas[0];
            setSchemaContext({
              schemaId: schema._id,
              dataSourceId: schema.dataSourceId?._id || schema.dataSourceId
            });
            const allFields = schema.fields.map((f: any) => ({
              id: f._id || f.fieldName, // Fallback if _id is missing
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
      // Don't add if already in columns
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
      const response = await api.post('/report-builder', {
        reportName,
        description: 'Dynamically built report',
        dataSourceId: schemaContext.dataSourceId,
        schemaId: schemaContext.schemaId,
        columns: columns.map((c, idx) => ({
          fieldId: c.id,
          displayName: c.name,
          aggregation: c.aggregation || 'NONE',
          format: c.format || '',
          order: idx
        })),
        filters: [], // MVP: empty filters for now
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
        />
        <PropertiesPanel 
          selectedColumn={selectedColumn} 
          onUpdateColumn={updateColumn}
          onRemoveColumn={removeColumn}
        />
        </div>
      </DndContext>
    </div>
  );
};
