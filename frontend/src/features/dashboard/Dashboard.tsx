import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  reportsGeneratedToday: number;
  connectedDataSources: number;
  runningJobs: number;
  failedReports: number;
  systemUptime: number;
}

export const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/dashboard/metrics');
        if (response.data.success) {
          setMetrics(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard metrics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!metrics) return <div>Failed to load metrics</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Platform Overview</h1>
      
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics.totalUsers}</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Reports Generated Today</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics.reportsGeneratedToday}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Connected Data Sources</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics.connectedDataSources}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Running Jobs</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics.runningJobs}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Failed Reports</dt>
            <dd className="mt-1 text-3xl font-semibold text-red-600">{metrics.failedReports}</dd>
          </div>
        </div>
      </div>
    </div>
  );
};
