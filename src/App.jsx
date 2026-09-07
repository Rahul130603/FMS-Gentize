import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { MyReport } from './pages/MyReport';
import { IncomingReport } from './pages/IncomingReport';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { NotFound } from './pages/NotFound';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/reports/my-report" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports/my-report" element={<MyReport />} />
        <Route path="/reports/incoming" element={<IncomingReport />} />
        <Route path="/reports/production" element={<Projects />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/clients" element={<Projects />} />
        <Route path="/team" element={<Projects />} />
        <Route path="/settings" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
