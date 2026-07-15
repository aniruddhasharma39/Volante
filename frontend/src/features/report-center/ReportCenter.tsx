import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export const ReportCenter = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // Fetching report definitions, typically this would be a mix of history + available templates
      const res = await api.get('/report-builder');
      setReports(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (id: string, format: string) => {
    try {
      // We trigger a download natively
      const token = localStorage.getItem('token');
      const url = `http://localhost:5000/api/v1/report-center/${id}/export?format=${format}`;
      
      // We fetch via API to handle Auth headers, then create an object URL
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `Report_${id}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to export report');
    }
  };

  if (loading) return <div>Loading Report Center...</div>;

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Report Center</h1>
          <p className="mt-2 text-sm text-gray-700">View and export your configured reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <div key={report._id} className="bg-white overflow-hidden shadow rounded-lg flex flex-col">
            <div className="px-4 py-5 sm:p-6 flex-1">
              <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
                {report.reportName || 'Untitled Report'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {report.description || 'No description provided.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {report.dataSourceId?.name || 'API Source'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {report.columns?.length || 0} Columns
                </span>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end space-x-2 border-t border-gray-200">
              <button 
                onClick={() => handleExport(report._id, 'csv')}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                CSV
              </button>
              <button 
                onClick={() => handleExport(report._id, 'xlsx')}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100 border-green-200 focus:outline-none"
              >
                Excel
              </button>
              <button 
                onClick={() => handleExport(report._id, 'pdf')}
                className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none"
              >
                PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
