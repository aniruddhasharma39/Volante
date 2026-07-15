import { useEffect, useState } from 'react';
import api from '../../services/api';

interface SchemaField {
  fieldName: string;
  dataType: string;
  path: string;
  isFilterable: boolean;
}

interface SchemaRegistry {
  _id: string;
  schemaName: string;
  endpoint: string;
  version: number;
  dataSourceId: { name: string; type: string };
  fields: SchemaField[];
}

export const SchemaRegistryViewer = () => {
  const [schemas, setSchemas] = useState<SchemaRegistry[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);

  useEffect(() => {
    fetchSchemas();
  }, []);

  const [previewSchema, setPreviewSchema] = useState<SchemaRegistry | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const fetchSchemas = async () => {
    try {
      const res = await api.get('/schema-registry');
      setSchemas(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const runDiscovery = async () => {
    setDiscovering(true);
    try {
      const dsRes = await api.get('/data-sources');
      const dataSources = dsRes.data.data;
      if (dataSources.length === 0) {
        alert('Please create a Data Source first.');
        setDiscovering(false);
        return;
      }
      
      const mockJsonSample = {
        MsgId: "MSG-12345",
        TxId: "TX-98765",
        IntrBkSttlmAmt: { value: 1000.50, currency: "USD" },
        Sts: "ACCP",
        Dbtr: { Nm: "Acme Corp" },
        Cdtr: { Nm: "Global Supplies" },
        CreDtTm: "2023-10-27T10:00:00Z"
      };

      await api.post('/schema-registry/discover', {
        dataSourceId: dataSources[0]._id,
        schemaName: 'pacs.008',
        endpoint: '/api/payments',
        jsonSample: mockJsonSample
      });
      
      alert('Schema Auto-Discovery Complete!');
      fetchSchemas();
    } catch (error) {
      console.error('Discovery failed', error);
      alert('Schema Discovery Failed');
    } finally {
      setDiscovering(false);
    }
  };

  const handlePreview = async (schema: SchemaRegistry) => {
    setPreviewSchema(schema);
    setLoadingPreview(true);
    try {
      const res = await api.get(`/mock-data/${schema.schemaName}?limit=10`);
      if (res.data.success) {
        setPreviewData(res.data.data.data);
      }
    } catch (error) {
      console.error('Failed to load preview data', error);
    } finally {
      setLoadingPreview(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Schema Registry</h1>
          <p className="mt-2 text-sm text-gray-700">Semantic Data Layer containing dynamically discovered fields.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button 
            onClick={runDiscovery}
            disabled={discovering}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {discovering ? 'Running...' : 'Run Auto-Discovery'}
          </button>
        </div>
      </div>
      
      <div className="space-y-8">
        {schemas.map(schema => (
          <div key={schema._id} className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">{schema.schemaName} <span className="text-sm text-gray-500 font-normal ml-2">(v{schema.version})</span></h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Connected to: {schema.dataSourceId?.name}</p>
              </div>
              <div className="flex space-x-4 items-center">
                <button 
                  onClick={() => handlePreview(schema)}
                  className="px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Preview Sample Data
                </button>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-800">
                  {schema.fields.length} Fields
                </span>
              </div>
            </div>
            <div className="border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JSON Path</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filterable</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schema.fields.map((field, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{field.fieldName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 text-xs rounded border border-gray-300 bg-gray-50">{field.dataType}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">{field.path}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {field.isFilterable ? 'Yes' : 'No'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {previewSchema && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500 bg-opacity-75">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Sample Data Preview: {previewSchema.schemaName}</h3>
              <button onClick={() => setPreviewSchema(null)} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex-1 overflow-auto bg-gray-100">
              {loadingPreview ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                  <pre className="p-4 text-xs font-mono text-gray-800 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(previewData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
