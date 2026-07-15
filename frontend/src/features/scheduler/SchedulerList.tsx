import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface Job {
  _id: string;
  jobName: string;
  cronExpression: string;
  recipients: string[];
  exportFormat: string;
  status: string;
  lastRun?: string;
  reportId?: { reportName: string };
}

export const SchedulerList = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [jobName, setJobName] = useState('');
  const [reportId, setReportId] = useState('');
  const [cronExpression, setCronExpression] = useState('0 0 * * *');
  const [recipients, setRecipients] = useState('');
  const [exportFormat, setExportFormat] = useState('PDF');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get('/report-builder');
      setReports(res.data.data);
      if (res.data.data.length > 0) {
        setReportId(res.data.data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch reports', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get('/scheduler');
      setJobs(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleJob = async (id: string) => {
    try {
      await api.post(`/scheduler/${id}/toggle`);
      fetchJobs();
    } catch (error) {
      console.error('Failed to toggle job', error);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/scheduler', {
        jobName,
        reportId,
        cronExpression,
        recipients: recipients.split(',').map(r => r.trim()).filter(Boolean),
        exportFormat
      });
      setShowModal(false);
      setJobName('');
      fetchJobs();
    } catch (error) {
      console.error('Failed to create job', error);
      alert('Failed to create job.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading jobs...</div>;

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Job Scheduler</h1>
          <p className="mt-2 text-sm text-gray-700">Automate report execution and distribution.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button 
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Create Schedule
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {jobs.map((job) => (
            <li key={job._id}>
              <div className="px-4 py-4 flex items-center sm:px-6 hover:bg-gray-50">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="truncate">
                    <div className="flex text-sm">
                      <p className="font-medium text-blue-600 truncate">{job.jobName}</p>
                      <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                        for {job.reportId?.reportName || 'Unknown Report'}
                      </p>
                    </div>
                    <div className="mt-2 flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>Cron: <span className="font-mono">{job.cronExpression}</span></p>
                      </div>
                      <div className="ml-6 flex items-center text-sm text-gray-500">
                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                    <button 
                      onClick={() => toggleJob(job._id)}
                      className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      {job.status === 'Active' ? 'Pause' : 'Resume'}
                    </button>
                    <button className="ml-4 text-sm font-medium text-gray-600 hover:text-gray-500">Edit</button>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {jobs.length === 0 && (
            <li className="px-4 py-8 text-center text-gray-500">
              No jobs scheduled yet.
            </li>
          )}
        </ul>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Create Schedule</h2>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Job Name</label>
                <input required type="text" value={jobName} onChange={e => setJobName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Report</label>
                <select required value={reportId} onChange={e => setReportId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  {reports.map(r => (
                    <option key={r._id} value={r._id}>{r.reportName}</option>
                  ))}
                  {reports.length === 0 && <option value="">No reports available (Create one first)</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cron Expression</label>
                <input required type="text" value={cronExpression} onChange={e => setCronExpression(e.target.value)} placeholder="0 0 * * *" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Recipients (comma separated)</label>
                <input required type="text" value={recipients} onChange={e => setRecipients(e.target.value)} placeholder="team@example.com" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Export Format</label>
                <select value={exportFormat} onChange={e => setExportFormat(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="PDF">PDF</option>
                  <option value="CSV">CSV</option>
                  <option value="XLSX">Excel (XLSX)</option>
                </select>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button type="submit" disabled={saving || reports.length === 0} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:col-start-2 sm:text-sm disabled:opacity-50">
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
