import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface Alert {
  _id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  source: string;
  createdAt: string;
}

export const AlertDashboard = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (id: string) => {
    try {
      await api.post(`/alerts/${id}/resolve`);
      fetchAlerts();
    } catch (error) {
      console.error('Failed to resolve alert', error);
    }
  };

  const triggerMockAlert = async () => {
    try {
      await api.post('/alerts/mock');
      fetchAlerts();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Loading Alerts...</div>;

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Incident Management</h1>
          <p className="mt-2 text-sm text-gray-700">Monitor system health, data quality, and security anomalies.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button 
            onClick={triggerMockAlert}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Simulate Alert
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {alerts.map((alert) => (
            <li key={alert._id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${
                        alert.severity === 'Critical' ? 'bg-red-100 text-red-600' :
                        alert.severity === 'High' ? 'bg-orange-100 text-orange-600' :
                        alert.severity === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 truncate">{alert.title}</p>
                      <p className="text-sm text-gray-500">{alert.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex space-x-2">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        alert.status === 'Open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {alert.status}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {alert.source}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                    {alert.status === 'Open' && (
                      <button 
                        onClick={() => resolveAlert(alert._id)}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-500 font-medium"
                      >
                        Acknowledge & Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
          {alerts.length === 0 && (
             <li className="px-4 py-8 text-center text-gray-500">
              No active incidents. System is healthy.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
