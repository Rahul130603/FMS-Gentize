import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { BarChartCard, PieChartCard, LineChartCard } from '../components/Charts';
import KpiCard from '../components/KpiCard';

interface ChartsData {
  projectTypeDistribution: { name: string; value: number }[];
  monthlyDeliveries: { name: string; value: number }[];
  weeklyDeliveries: { name: string; value: number }[];
  completionTrend: { name: string; value: number }[];
  healthDistribution: { name: string; value: number }[];
  riskLevelDistribution: { name: string; value: number }[];
  workflowProgress: { name: string; value: number }[];
  priorityDistribution: { name: string; value: number }[];
  overdueTrend: { name: string; value: number }[];
  missedMilestonesCount: number;
  averageDelayTrend: { name: string; value: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<ChartsData | null>(null);
  useEffect(() => { api.get('/analytics').then((r) => setData(r.data)); }, []);

  if (!data) return <div className="skeleton" style={{ height: 300 }} />;

  return (
    <div>
      <div className="section-title">Analytics Dashboard</div>
      <div className="kpi-grid">
        <KpiCard label="Total Missed Milestones" value={data.missedMilestonesCount} color="#ef4444" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        <PieChartCard title="Project Type Distribution" data={data.projectTypeDistribution} />
        <PieChartCard title="Project Health Distribution" data={data.healthDistribution} />
        <PieChartCard title="Risk Level Distribution" data={data.riskLevelDistribution} />
        <PieChartCard title="Priority Distribution" data={data.priorityDistribution} />
        <BarChartCard title="Workflow Stage Progress" data={data.workflowProgress} />
        <BarChartCard title="Monthly Deliveries" data={data.monthlyDeliveries} />
        <BarChartCard title="Weekly Deliveries" data={data.weeklyDeliveries} />
        <LineChartCard title="Completion Trend (by month created)" data={data.completionTrend} />
        <LineChartCard title="Overdue Trend" data={data.overdueTrend} />
        <LineChartCard title="Average Delay Trend (days)" data={data.averageDelayTrend} />
      </div>
    </div>
  );
}
