import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './features/auth/Login';
import { useAuthStore } from './store/authStore';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './features/dashboard/Dashboard';
import { AdminUsers } from './features/admin/AdminUsers';
import { DataSourceList } from './features/data-sources/DataSourceList';
import { SchemaRegistryViewer } from './features/schema-registry/SchemaRegistryViewer';
import { PaymentExplorer } from './features/explorer/PaymentExplorer';
import { ReportBuilder } from './features/report-builder/ReportBuilder';
import { SchedulerList } from './features/scheduler/SchedulerList';
import { ReportCenter } from './features/report-center/ReportCenter';
import { AlertDashboard } from './features/alerting/AlertDashboard';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="admin" element={<AdminUsers />} />
          <Route path="data-sources" element={<DataSourceList />} />
          <Route path="schema-registry" element={<SchemaRegistryViewer />} />
          <Route path="explorer" element={<PaymentExplorer />} />
          <Route path="builder" element={<ReportBuilder />} />
          <Route path="scheduler" element={<SchedulerList />} />
          <Route path="reports" element={<ReportCenter />} />
          <Route path="alerts" element={<AlertDashboard />} />
          <Route path="*" element={<div className="p-4">Module under construction</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
