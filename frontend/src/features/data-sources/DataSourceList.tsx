import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface DataSource {
  _id: string;
  name: string;
  type: string;
  baseUrl: string;
  status: string;
}

export const DataSourceList = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [newDsName, setNewDsName] = useState('');
  const [newDsType, setNewDsType] = useState('REST_API');
  const [newDsUrl, setNewDsUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDataSources();
  }, []);

  const fetchDataSources = async () => {
    try {
      const res = await api.get('/data-sources');
      setDataSources(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (id: string) => {
    setTesting(id);
    try {
      const res = await api.post(`/data-sources/${id}/test`);
      if (res.data.success) {
        alert('Connection Successful!');
      }
    } catch (error) {
      alert('Connection Failed!');
    } finally {
      setTesting(null);
    }
  };

  const handleAddDataSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/data-sources', {
        name: newDsName,
        type: newDsType,
        baseUrl: newDsUrl,
        authentication: { type: 'NONE' }
      });
      setShowModal(false);
      setNewDsName('');
      setNewDsUrl('');
      fetchDataSources();
    } catch (error) {
      console.error('Failed to create data source', error);
      alert('Failed to add data source.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Data Sources</h1>
          <p className="mt-2 text-sm text-gray-700">Manage connections to external systems and APIs.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button 
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Add Data Source
          </button>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dataSources.map((ds) => (
          <div key={ds._id} className="relative flex flex-col items-center space-y-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:border-gray-400">
            <div className="min-w-0 flex-1 w-full">
              <div className="focus:outline-none flex justify-between">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">{ds.name}</p>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ds.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {ds.status}
                </span>
              </div>
              <p className="truncate text-sm text-gray-500 mt-1">{ds.type}</p>
              <p className="truncate text-xs text-gray-400 mt-1">{ds.baseUrl}</p>
            </div>
            <div className="w-full mt-4 z-10 flex justify-end">
              <button 
                onClick={() => testConnection(ds._id)}
                disabled={testing === ds._id}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                {testing === ds._id ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add Data Source</h2>
            <form onSubmit={handleAddDataSource} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input required type="text" value={newDsName} onChange={e => setNewDsName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select value={newDsType} onChange={e => setNewDsType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="REST_API">REST API</option>
                  <option value="GRAPHQL">GraphQL</option>
                  <option value="DATABASE">Database</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Base URL</label>
                <input required type="text" value={newDsUrl} onChange={e => setNewDsUrl(e.target.value)} placeholder="https://api.example.com" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button type="submit" disabled={saving} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:col-start-2 sm:text-sm disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:col-start-1 sm:text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
